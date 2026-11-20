'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { VendorSidebar } from './vendor-sidebar';

export function VendorMobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant="ghost" aria-label="Open vendor navigation" />}>
        <Menu className="h-5 w-5" />
        Menu
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className="fixed inset-y-0 left-0 z-50 w-60 overflow-y-auto bg-surface outline-none"
          onClickCapture={(event) => {
            if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">Vendor navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Manage your store, orders, and profile
          </Dialog.Description>
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close vendor navigation"
                className="absolute right-2 top-5 z-10"
              />
            }
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <VendorSidebar />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
