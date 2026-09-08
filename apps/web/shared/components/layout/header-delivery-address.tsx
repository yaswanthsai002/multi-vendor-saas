'use client';

import { Check, ChevronDown, ChevronUp, MapPin, Plus } from 'lucide-react';
import * as React from 'react';

export interface DeliveryAddressItem {
  id: string;
  label: string;
  detail: string;
  isDefault?: boolean;
}

interface HeaderDeliveryAddressProps {
  addresses?: DeliveryAddressItem[];
  defaultAddress?: string;
  onSelectAddress?: (address: DeliveryAddressItem) => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function HeaderDeliveryAddress({
  addresses = [
    {
      id: '1',
      label: 'Home',
      detail: 'Hyderabad 500001',
      isDefault: true,
    },
  ],
  defaultAddress = 'Hyderabad 500001',
  onSelectAddress,
  variant = 'desktop',
  className = '',
}: HeaderDeliveryAddressProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(defaultAddress);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleSelect = (addr: DeliveryAddressItem) => {
    setSelectedAddress(addr.detail || `${addr.label} - ${addr.detail}`);
    onSelectAddress?.(addr);
    handleClose();
  };

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Delivery Trigger Button */}
      {variant === 'desktop' ? (
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Deliver to ${selectedAddress}`}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-hover/80 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <MapPin className="h-5 w-5 text-text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col text-xs leading-tight">
            <span className="text-text-tertiary font-normal">Deliver to</span>
            <span className="text-text-primary font-semibold truncate max-w-32">
              {selectedAddress}
            </span>
          </div>
          {!isOpen ? (
            <ChevronDown className="h-5 w-5 text-text-primary shrink-0" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-5 w-5 text-text-primary shrink-0" aria-hidden="true" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Deliver to ${selectedAddress}`}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-1"
        >
          <MapPin className="h-3.5 w-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
          <span>Deliver to</span>
          <span className="font-semibold text-text-primary">{selectedAddress}</span>
          {!isOpen ? (
            <ChevronDown className="h-5 w-5 text-text-primary shrink-0" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-5 w-5 text-text-primary shrink-0" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Address Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Select delivery address"
          className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-surface-raised border border-border-default shadow-lg p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Choose your location
            </h4>
          </div>

          {/* Addresses list */}
          {addresses && addresses.length > 0 ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {addresses.map((addr) => {
                const isCurrent =
                  selectedAddress === addr.detail ||
                  selectedAddress === `${addr.label} - ${addr.detail}`;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelect(addr)}
                    className={`w-full text-left p-2 rounded-lg flex items-start justify-between text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-accent-subtle/60 border border-accent/20'
                        : 'hover:bg-surface-hover border border-transparent'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{addr.label}</p>
                      <p className="text-text-secondary mt-0.5">{addr.detail}</p>
                    </div>
                    {isCurrent && (
                      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary py-2">No saved addresses</p>
          )}

          {/* Add Address button (action placeholder) */}
          <div className="mt-2 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-accent hover:bg-accent-subtle transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add address</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
