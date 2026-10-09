import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrderActionDialog } from './order-action-dialog';
import { OrderCustomerCard } from './order-customer-card';
import { OrderDeliveryCard } from './order-delivery-card';
import { OrderItemsTable } from './order-items-table';
import { OrderPagination } from './order-pagination';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStepper } from './order-stepper';
import { OrderSummaryCard } from './order-summary-card';
import { OrdersFilters } from './orders-filters';
import { OrdersHeader } from './orders-header';
import { OrdersStatCards } from './orders-stat-cards';
import { OrdersTable } from './orders-table';

import type { OrderItemDetail, VendorOrderListItem } from '../types/order.types';

describe('Vendor Orders Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('OrdersHeader', () => {
    it('renders heading and description', () => {
      render(<OrdersHeader />);
      expect(screen.getByRole('heading', { name: /^orders$/i })).toBeDefined();
      expect(screen.getByText(/review, manage, and fulfill orders/i)).toBeDefined();
    });
  });

  describe('OrdersStatCards', () => {
    it('renders 4 summary cards with count values', () => {
      const counts = {
        all: 42,
        pending: 5,
        processing: 12,
        completed: 23,
        cancelled: 2,
      };

      render(<OrdersStatCards counts={counts} />);

      expect(screen.getByText('Total Orders')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
      expect(screen.getByText('Pending Review')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('In Processing')).toBeDefined();
      expect(screen.getByText('12')).toBeDefined();
      expect(screen.getByText('Completed')).toBeDefined();
      expect(screen.getByText('23')).toBeDefined();
    });
  });

  describe('OrderStatusBadge', () => {
    it('renders correct labels and semantic styles for each status', () => {
      const { rerender } = render(<OrderStatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeDefined();

      rerender(<OrderStatusBadge status="processing" />);
      expect(screen.getByText('Processing')).toBeDefined();

      rerender(<OrderStatusBadge status="completed" />);
      expect(screen.getByText('Completed')).toBeDefined();

      rerender(<OrderStatusBadge status="cancelled" />);
      expect(screen.getByText('Cancelled')).toBeDefined();
    });
  });

  describe('OrdersFilters', () => {
    it('handles search input and sort changes', async () => {
      const handleSearch = vi.fn();
      const handleSort = vi.fn();
      const handleReset = vi.fn();

      render(
        <OrdersFilters
          search=""
          onSearchChange={handleSearch}
          sort="newest"
          onSortChange={handleSort}
          onDateChange={vi.fn()}
          onReset={handleReset}
          hasActiveFilters={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText(/search by order/i);
      await userEvent.type(searchInput, 'ORD-100');
      expect(handleSearch).toHaveBeenCalled();

      const sortSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(sortSelect, 'total_desc');
      expect(handleSort).toHaveBeenCalledWith('total_desc');

      const resetBtn = screen.getByRole('button', { name: /reset/i });
      await userEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('OrdersTable', () => {
    const mockOrders: VendorOrderListItem[] = [
      {
        vendorOrderId: 'vo-1',
        orderNumber: 'ORD-10001',
        customer: { name: 'John Doe', email: 'john@example.com' },
        itemCount: 3,
        total: '129.99',
        placedAt: '2026-10-09T08:00:00.000Z',
        status: 'pending',
      },
    ];

    it('renders empty state when order array is empty', () => {
      render(<OrdersTable orders={[]} hasFilters={false} />);
      expect(screen.getByText(/no orders found/i)).toBeDefined();
    });

    it('renders order rows with links to detail page', () => {
      render(<OrdersTable orders={mockOrders} hasFilters={false} />);
      expect(screen.getByText('ORD-10001')).toBeDefined();
      expect(screen.getByText('John Doe')).toBeDefined();
      expect(screen.getByText('john@example.com')).toBeDefined();
      expect(screen.getByText('$129.99')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();

      const detailLink = screen.getByRole('link', { name: /view/i });
      expect(detailLink.getAttribute('href')).toBe('/vendor/orders/vo-1');
    });
  });

  describe('OrderPagination', () => {
    it('renders pagination buttons and handles page changes', async () => {
      const handlePageChange = vi.fn();
      render(
        <OrderPagination
          pagination={{ page: 2, limit: 10, total: 35, totalPages: 4 }}
          onPageChange={handlePageChange}
        />,
      );

      expect(screen.getByText(/showing/i)).toBeDefined();
      expect(screen.getByText('Page 2 of 4')).toBeDefined();

      const prevBtn = screen.getByLabelText('Previous Page');
      const nextBtn = screen.getByLabelText('Next Page');

      await userEvent.click(prevBtn);
      expect(handlePageChange).toHaveBeenCalledWith(1);

      await userEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('OrderStepper', () => {
    it('renders active progress steps for processing state', () => {
      render(<OrderStepper status="processing" />);
      expect(screen.getByText('Fulfillment Progress')).toBeDefined();
      expect(screen.getByText('Pending Review')).toBeDefined();
      expect(screen.getByText('In Processing')).toBeDefined();
      expect(screen.getByText('Completed')).toBeDefined();
    });

    it('renders cancelled alert state when order is cancelled', () => {
      render(<OrderStepper status="cancelled" cancellationReason="Item damaged" />);
      expect(screen.getByText('Order Cancelled')).toBeDefined();
      expect(screen.getByText(/reason: item damaged/i)).toBeDefined();
    });
  });

  describe('OrderItemsTable & SummaryCard', () => {
    const mockItems: OrderItemDetail[] = [
      {
        orderItemId: 'item-1',
        productId: 'prod-1',
        productName: 'Mechanical Gaming Keyboard',
        productImageUrl: null,
        unitPrice: '89.99',
        quantity: 2,
        subtotal: '179.98',
      },
    ];

    it('renders order items with pricing and quantities', () => {
      render(<OrderItemsTable items={mockItems} />);
      expect(screen.getByText('Mechanical Gaming Keyboard')).toBeDefined();
      expect(screen.getByText('$89.99')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText('$179.98')).toBeDefined();
    });

    it('renders financial summary totals', () => {
      render(<OrderSummaryCard itemCount={2} total="179.98" />);
      expect(screen.getByText('Vendor Order Total')).toBeDefined();
      expect(screen.getAllByText('$179.98')).toHaveLength(2);
    });
  });

  describe('OrderCustomerCard & OrderDeliveryCard', () => {
    it('renders customer name and email', () => {
      render(
        <OrderCustomerCard name="Alice Smith" email="alice@example.com" phone="+1 555-0123" />,
      );
      expect(screen.getByText('Alice Smith')).toBeDefined();
      expect(screen.getByText('alice@example.com')).toBeDefined();
      expect(screen.getByText('+1 555-0123')).toBeDefined();
    });

    it('renders formatted delivery address', () => {
      render(
        <OrderDeliveryCard
          address={{
            recipientName: 'Alice Smith',
            phone: '+1 555-0123',
            addressLine1: '789 Pine Street',
            addressLine2: 'Suite 200',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'US',
          }}
        />,
      );
      expect(screen.getByText('789 Pine Street')).toBeDefined();
      expect(screen.getByText('Suite 200')).toBeDefined();
      expect(screen.getByText(/seattle, wa 98101/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /copy address/i })).toBeDefined();
    });
  });

  describe('OrderActionDialog', () => {
    it('renders confirmation for starting processing', async () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <OrderActionDialog
          isOpen={true}
          action="process"
          onClose={handleClose}
          onConfirm={handleConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText('Start Processing Order')).toBeDefined();
      const submitBtn = screen.getByRole('button', { name: 'Start Processing' });
      await userEvent.click(submitBtn);

      expect(handleConfirm).toHaveBeenCalledWith({ status: 'processing' });
    });

    it('allows entering cancellation reason for cancel action', async () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <OrderActionDialog
          isOpen={true}
          action="cancel"
          onClose={handleClose}
          onConfirm={handleConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Cancel Order' })).toBeDefined();
      const textarea = screen.getByPlaceholderText(/out of stock/i);
      await userEvent.type(textarea, 'Customer requested cancel');

      const cancelBtn = screen.getByRole('button', { name: 'Cancel Order' });
      await userEvent.click(cancelBtn);

      expect(handleConfirm).toHaveBeenCalledWith({
        status: 'cancelled',
        cancellationReason: 'Customer requested cancel',
      });
    });
  });
});
