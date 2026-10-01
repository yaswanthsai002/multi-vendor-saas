'use client';

import {
  Bold,
  Heading,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Underline,
  Undo,
} from 'lucide-react';
import * as React from 'react';

interface ProductInfoCardProps {
  name: string;
  onNameChange: (val: string) => void;
  nameError?: string;
  shortDescription: string;
  onShortDescriptionChange: (val: string) => void;
  shortDescriptionError?: string;
  description: string;
  onDescriptionChange: (val: string) => void;
  descriptionError?: string;
}

export function ProductInfoCard({
  name,
  onNameChange,
  nameError,
  shortDescription,
  onShortDescriptionChange,
  shortDescriptionError,
  description,
  onDescriptionChange,
  descriptionError,
}: ProductInfoCardProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Helper to insert formatting syntax into textarea
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    onDescriptionChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4),
      );
    }, 0);
  };

  return (
    <div className="rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle p-6 space-y-6 shadow-xs">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
          Product Information
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Basic details about your product.
        </p>
      </div>

      <div className="space-y-5">
        {/* Product Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="product-name"
              className="text-xs sm:text-sm font-semibold text-text-primary"
            >
              Product name <span className="text-danger">*</span>
            </label>
            <span className="text-xs text-text-tertiary">{name.length}/255</span>
          </div>
          <input
            id="product-name"
            type="text"
            value={name}
            maxLength={255}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter product name (e.g. Sony WH-1000XM5)"
            className={`block w-full px-3.5 py-2.5 text-sm bg-surface dark:bg-surface-subtle border rounded-xl text-text-primary placeholder:text-text-tertiary  transition-colors ${
              nameError ? 'border-danger ring-1 ring-danger' : 'border-border-default'
            }`}
          />
          {nameError ? <p className="text-xs text-danger mt-1 font-medium">{nameError}</p> : null}
        </div>

        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="short-desc"
              className="text-xs sm:text-sm font-semibold text-text-primary"
            >
              Short description{' '}
              <span className="text-xs font-normal text-text-tertiary">(optional)</span>
            </label>
            <span className="text-xs text-text-tertiary">{shortDescription.length}/500</span>
          </div>
          <textarea
            id="short-desc"
            rows={2}
            value={shortDescription}
            maxLength={500}
            onChange={(e) => onShortDescriptionChange(e.target.value)}
            placeholder="Enter a short description (optional)"
            className={`block w-full px-3.5 py-2.5 text-sm bg-surface dark:bg-surface-subtle border rounded-xl text-text-primary placeholder:text-text-tertiary  transition-colors resize-y ${
              shortDescriptionError ? 'border-danger ring-1 ring-danger' : 'border-border-default'
            }`}
          />
          {shortDescriptionError ? (
            <p className="text-xs text-danger mt-1 font-medium">{shortDescriptionError}</p>
          ) : null}
        </div>

        {/* Full Description with Formatting Toolbar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="product-desc"
              className="text-xs sm:text-sm font-semibold text-text-primary"
            >
              Description <span className="text-danger">*</span>
            </label>
            <span className="text-xs text-text-tertiary">{description.length}/10000</span>
          </div>

          <div
            className={`rounded-xl border bg-surface dark:bg-surface-subtle overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-border-focus focus-within:border-transparent ${
              descriptionError ? 'border-danger' : 'border-border-default'
            }`}
          >
            {/* Minimal Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border-subtle bg-surface-subtle/50 dark:bg-surface/50 flex-wrap">
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                title="Heading"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Heading className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                title="Bold"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                title="Italic"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                title="Underline"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Underline className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={() => insertFormatting('\n- ')}
                title="Bullet List"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n1. ')}
                title="Numbered List"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://)')}
                title="Link"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n> ')}
                title="Quote"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Quote className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={() => document.execCommand('undo')}
                title="Undo"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('redo')}
                title="Redo"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              id="product-desc"
              rows={6}
              value={description}
              maxLength={10000}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Write a detailed description about your product..."
              className="block w-full p-3.5 text-sm bg-transparent border-0 text-text-primary placeholder:text-text-tertiary focus:outline-none resize-y font-normal leading-relaxed"
            />
          </div>
          {descriptionError ? (
            <p className="text-xs text-danger mt-1 font-medium">{descriptionError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
