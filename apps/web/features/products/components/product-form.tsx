'use client';

import { Loader2, Save, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { useCreateProduct, useUpdateProduct } from '../hooks/use-products';
import { productFormSchema } from '../schema/product.schema';

import { ProductCategoryPicker } from './product-category-picker';
import { ProductInfoCard } from './product-info-card';
import { ProductMediaCard } from './product-media-card';
import { ProductPricingCard } from './product-pricing-card';

import type { SelectedCategory } from './product-category-picker';
import type { CreateProductInput, ProductDetail, UpdateProductInput } from '../types/product.types';
import type { MediaItem } from '@/features/media/types/media.types';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductDetail;
}

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();

  // Field states
  const [name, setName] = React.useState(initialData?.name || '');
  const [shortDescription, setShortDescription] = React.useState(
    initialData?.shortDescription || '',
  );
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [price, setPrice] = React.useState(initialData?.price || '');
  const [stock, setStock] = React.useState<number | string>(initialData?.stock ?? '');

  // Media states
  const [primaryImage, setPrimaryImage] = React.useState<MediaItem | null>(
    initialData?.primaryImage || null,
  );
  const [galleryImages, setGalleryImages] = React.useState<MediaItem[]>(initialData?.gallery || []);

  // Category states (Option A: single leaf category)
  const [selectedCategories, setSelectedCategories] = React.useState<SelectedCategory[]>(
    () =>
      initialData?.categories?.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        imageUrl: c.imageUrl,
      })) || [],
  );

  // Field error states
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleToggleCategory = (cat: SelectedCategory) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c.categoryId === cat.categoryId);
      if (exists) {
        return [];
      }
      return [cat];
    });
  };

  const validateClientFields = () => {
    const values = {
      name,
      shortDescription: shortDescription.trim() || null,
      description,
      price,
      stock,
      productImageId: primaryImage?.mediaId || null,
      galleryMediaIds: galleryImages.map((m) => m.mediaId),
      categoryIds: selectedCategories.map((c) => c.categoryId),
    };

    const result = productFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && !fieldErrors[path.toString()]) {
          fieldErrors[path.toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the form errors before submitting.');
      return null;
    }

    setErrors({});
    return result.data;
  };

  // 1. Save Draft (in Create mode) or Save Changes (in Edit mode)
  const handleSaveDraftOrChanges = async () => {
    const values = validateClientFields();
    if (!values) return;

    if (mode === 'create') {
      const payload: CreateProductInput = {
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        stock: values.stock,
        productImageId: values.productImageId,
        galleryMediaIds: values.galleryMediaIds,
        categoryIds: values.categoryIds,
        published: false,
      };

      try {
        const res = await createMutation.mutateAsync(payload);
        router.push(`/vendor/products/${res.product.productId}/edit`);
      } catch {
        // Handled by toast
      }
    } else if (mode === 'edit' && initialData) {
      const payload: UpdateProductInput = {
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        stock: values.stock,
        productImageId: values.productImageId,
        galleryMediaIds: values.galleryMediaIds,
        categoryIds: values.categoryIds,
        published: initialData.published,
      };

      try {
        await updateMutation.mutateAsync({
          productId: initialData.productId,
          data: payload,
        });
      } catch {
        // Handled by toast
      }
    }
  };

  // 2. Save & Publish
  const handleSaveAndPublish = async () => {
    const values = validateClientFields();
    if (!values) return;

    if (mode === 'create') {
      const payload: CreateProductInput = {
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        stock: values.stock,
        productImageId: values.productImageId,
        galleryMediaIds: values.galleryMediaIds,
        categoryIds: values.categoryIds,
        published: true,
      };

      try {
        await createMutation.mutateAsync(payload);
        router.push('/vendor/products');
      } catch {
        // Handled by toast
      }
    } else if (mode === 'edit' && initialData) {
      const payload: UpdateProductInput = {
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        stock: values.stock,
        productImageId: values.productImageId,
        galleryMediaIds: values.galleryMediaIds,
        categoryIds: values.categoryIds,
        published: true,
      };

      try {
        await updateMutation.mutateAsync({
          productId: initialData.productId,
          data: payload,
        });
        router.push('/vendor/products');
      } catch {
        // Handled by toast
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-text-tertiary mb-2">
          <Link href="/vendor/products" className="hover:text-text-primary hover:underline">
            Products
          </Link>
          <span>›</span>
          <span className="text-text-secondary">
            {mode === 'create' ? 'Create product' : 'Edit product'}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                {mode === 'create' ? 'Create Product' : 'Edit Product'}
              </h1>
              {mode === 'edit' ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    initialData?.published
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-surface-subtle text-text-secondary border-border-default'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      initialData?.published ? 'bg-emerald-500' : 'bg-text-tertiary'
                    }`}
                  />
                  <span>{initialData?.published ? 'Published' : 'Draft'}</span>
                </span>
              ) : null}
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {mode === 'create'
                ? 'Add a new product to your catalog. Fill in the details, select categories and media, and save as a draft or publish when ready.'
                : 'Update your product details, categories, media, pricing and inventory.'}
            </p>
          </div>

          {/* Header Action Buttons (Both Create and Edit Mode) */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href="/vendor/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Link>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraftOrChanges}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-text-tertiary" />
              )}
              <span>{mode === 'create' ? 'Save draft' : 'Save changes'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAndPublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4 stroke-[2.5]" />
              )}
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Top Row: Two-Column Split (7 cols / 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Product Information */}
          <div className="lg:col-span-7 space-y-6">
            <ProductInfoCard
              name={name}
              onNameChange={setName}
              nameError={errors.name}
              shortDescription={shortDescription}
              onShortDescriptionChange={setShortDescription}
              shortDescriptionError={errors.shortDescription}
              description={description}
              onDescriptionChange={setDescription}
              descriptionError={errors.description}
            />
          </div>

          {/* Right Column (5 cols): Categories + Pricing & Inventory */}
          <div className="lg:col-span-5 space-y-6">
            <ProductCategoryPicker
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              error={errors.categoryIds}
            />

            <ProductPricingCard
              price={price}
              onPriceChange={setPrice}
              priceError={errors.price}
              stock={stock}
              onStockChange={setStock}
              stockError={errors.stock}
            />
          </div>
        </div>

        {/* Bottom Row: Full-Width 12-Column Product Media */}
        <div className="w-full">
          <ProductMediaCard
            primaryImage={primaryImage}
            onSelectPrimaryImage={setPrimaryImage}
            galleryImages={galleryImages}
            onUpdateGallery={setGalleryImages}
            error={errors.productImageId}
          />
        </div>
      </div>
    </div>
  );
}
