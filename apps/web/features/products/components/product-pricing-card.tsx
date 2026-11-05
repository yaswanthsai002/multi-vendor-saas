'use client';

import * as React from 'react';

interface ProductPricingCardProps {
  price: string;
  onPriceChange: (val: string) => void;
  priceError?: string;
  mrp: string;
  onMrpChange: (val: string) => void;
  mrpError?: string;
  stock: number | string;
  onStockChange: (val: string) => void;
  stockError?: string;
}

export function ProductPricingCard({
  price,
  onPriceChange,
  priceError,
  mrp,
  onMrpChange,
  mrpError,
  stock,
  onStockChange,
  stockError,
}: ProductPricingCardProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle p-6 space-y-5 shadow-xs">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
          Pricing & Inventory
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Set the price and available stock for your product.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Price Input */}
        <div>
          <label
            htmlFor="product-price"
            className="block text-xs sm:text-sm font-semibold text-text-primary mb-1.5"
          >
            Price <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary font-medium">
              ₹
            </div>
            <input
              id="product-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className={`block w-full pl-8 pr-3.5 py-2.5 text-sm bg-surface dark:bg-surface-subtle border rounded-xl text-text-primary placeholder:text-text-tertiary  transition-colors ${
                priceError ? 'border-danger ring-1 ring-danger' : 'border-border-default'
              }`}
            />
          </div>
          {priceError ? (
            <p className="text-xs text-danger mt-1 font-medium">{priceError}</p>
          ) : (
            <p className="text-xs text-text-tertiary mt-1">
              Enter the selling price (e.g. 1299.00).
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-mrp"
            className="block text-xs sm:text-sm font-semibold text-text-primary mb-1.5"
          >
            MRP (Maximum Retail Price)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-medium text-text-secondary">
              ₹
            </span>
            <input
              id="product-mrp"
              type="text"
              inputMode="decimal"
              value={mrp}
              onChange={(e) => onMrpChange(e.target.value)}
              placeholder="0.00"
              className={`block w-full py-2.5 pl-8 pr-3.5 text-sm bg-surface dark:bg-surface-subtle border rounded-xl text-text-primary placeholder:text-text-tertiary ${mrpError ? 'border-danger ring-1 ring-danger' : 'border-border-default'}`}
            />
          </div>
          {mrpError ? (
            <p className="mt-1 text-xs text-danger">{mrpError}</p>
          ) : (
            <p className="mt-1 text-xs text-text-tertiary">
              Original MRP shown alongside your selling price.
            </p>
          )}
        </div>

        {/* Stock Input */}
        <div>
          <label
            htmlFor="product-stock"
            className="block text-xs sm:text-sm font-semibold text-text-primary mb-1.5"
          >
            Stock <span className="text-danger">*</span>
          </label>
          <input
            id="product-stock"
            type="number"
            min={1}
            step={1}
            value={stock}
            onChange={(e) => onStockChange(e.target.value)}
            placeholder="e.g. 10"
            className={`block w-full px-3.5 py-2.5 text-sm bg-surface dark:bg-surface-subtle border rounded-xl text-text-primary placeholder:text-text-tertiary  transition-colors ${
              stockError ? 'border-danger ring-1 ring-danger' : 'border-border-default'
            }`}
          />
          {stockError ? (
            <p className="text-xs text-danger mt-1 font-medium">{stockError}</p>
          ) : (
            <p className="text-xs text-text-tertiary mt-1">Available quantity in stock (min. 1).</p>
          )}
        </div>
      </div>
    </div>
  );
}
