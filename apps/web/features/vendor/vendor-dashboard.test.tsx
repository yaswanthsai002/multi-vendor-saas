import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VendorDashboardOverview } from './components/vendor-dashboard-overview';
import { VendorKpiCards } from './components/vendor-kpi-cards';
import { VendorRecentOrders } from './components/vendor-recent-orders';
import { VendorSalesChart } from './components/vendor-sales-chart';
import { VendorSidebar } from './components/vendor-sidebar';
import { VendorTopNav } from './components/vendor-top-nav';
import { VendorTopProducts } from './components/vendor-top-products';
import * as vendorService from './services/vendor-dashboard.service';

import type { VendorDashboardData } from './types/vendor-dashboard.types';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => '/vendor',
}));

vi.mock('@/lib/api-client', () => ({
  makeApiRequest: vi.fn().mockResolvedValue({ message: 'Success' }),
}));

vi.mock('./services/vendor-dashboard.service', () => ({
  fetchVendorDashboard: vi.fn(),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Vendor Dashboard Feature Unit & Integration Tests', () => {
  const mockDashboardData: VendorDashboardData = {
    vendor: {
      vendorId: '22222222-2222-4222-8222-222222222222',
      name: 'Aura Boutique',
      slug: 'aura-boutique',
      logoUrl: null,
    },
    metrics: {
      sales: { value: 124500, changePercentage: 12.4 },
      orders: { value: 186, changePercentage: 8.2 },
      unitsSold: { value: 247, changePercentage: 11.7 },
      avgOrderValue: { value: 669, changePercentage: 3.9 },
    },
    chart: [
      { label: 'Mon', date: '2026-09-15', sales: 1200 },
      { label: 'Tue', date: '2026-09-16', sales: 1500 },
      { label: 'Wed', date: '2026-09-17', sales: 1250 },
      { label: 'Thu', date: '2026-09-18', sales: 1600 },
      { label: 'Fri', date: '2026-09-19', sales: 1450 },
      { label: 'Sat', date: '2026-09-20', sales: 1800 },
      { label: 'Sun', date: '2026-09-21', sales: 1400 },
    ],
    recentOrders: [
      {
        vendorOrderId: 'vo-1',
        orderId: 'o-1',
        orderNumber: '#1001',
        itemsCount: 2,
        amount: 2499,
        status: 'pending',
        thumbnailUrl: null,
        createdAt: '2026-09-21T10:00:00.000Z',
      },
      {
        vendorOrderId: 'vo-2',
        orderId: 'o-2',
        orderNumber: '#1002',
        itemsCount: 1,
        amount: 899,
        status: 'processing',
        thumbnailUrl: null,
        createdAt: '2026-09-21T09:30:00.000Z',
      },
    ],
    topProducts: [
      {
        productId: 'p-1',
        name: 'Sony WH-1000XM5',
        category: 'Electronics · Headphones',
        thumbnailUrl: null,
        unitsSold: 42,
        sales: 84000,
        stock: 8,
      },
      {
        productId: 'p-2',
        name: 'Coffee Machine',
        category: 'Home & Kitchen · Appliances',
        thumbnailUrl: null,
        unitsSold: 31,
        sales: 62000,
        stock: 0,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vendorService.fetchVendorDashboard).mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    cleanup();
  });

  describe('VendorSidebar', () => {
    it('renders navigation links including Overview, Products, Orders, Media, and Settings', () => {
      renderWithClient(<VendorSidebar />);

      expect(screen.getByText('Overview')).toBeDefined();
      expect(screen.getByText('Products')).toBeDefined();
      expect(screen.getByText('All Products')).toBeDefined();
      expect(screen.getByText('Bulk Upload')).toBeDefined();
      expect(screen.getByText('Orders')).toBeDefined();
      expect(screen.getByText('All Orders')).toBeDefined();
      expect(screen.getByText('Order Reviews')).toBeDefined();
      expect(screen.getByText('Media Library')).toBeDefined();
      expect(screen.getByText('Settings')).toBeDefined();
      expect(screen.getByText('Marketplace')).toBeDefined();
      expect(screen.getByText('Profile')).toBeDefined();
      expect(screen.getByText('Logout')).toBeDefined();
    });
  });

  describe('VendorTopNav', () => {
    it('renders store name and opens profile dropdown when clicked', async () => {
      const user = userEvent.setup();
      renderWithClient(<VendorTopNav storeName="Aura Boutique" />);

      expect(screen.getByText('Aura Boutique')).toBeDefined();

      const profileBtn = screen.getByRole('button', { name: /Aura Boutique/i });
      await user.click(profileBtn);

      expect(screen.getByText('Store Profile')).toBeDefined();
      expect(screen.getByText('Marketplace Settings')).toBeDefined();
      expect(screen.getByText('Sign out')).toBeDefined();
    });
  });

  describe('VendorKpiCards', () => {
    it('renders formatted sales, orders, units sold, and avg order value with deltas', () => {
      renderWithClient(<VendorKpiCards metrics={mockDashboardData.metrics} />);

      expect(screen.getByText('Sales')).toBeDefined();
      expect(screen.getByText('₹ 1,24,500')).toBeDefined();
      expect(screen.getByText('12.4%')).toBeDefined();

      expect(screen.getByText('Orders')).toBeDefined();
      expect(screen.getByText('186')).toBeDefined();
      expect(screen.getByText('8.2%')).toBeDefined();

      expect(screen.getByText('Units Sold')).toBeDefined();
      expect(screen.getByText('247')).toBeDefined();
      expect(screen.getByText('11.7%')).toBeDefined();

      expect(screen.getByText('Avg. Order Value')).toBeDefined();
      expect(screen.getByText('₹ 669')).toBeDefined();
      expect(screen.getByText('3.9%')).toBeDefined();
    });
  });

  describe('VendorSalesChart', () => {
    it('renders timeframe selector buttons and chart axis', async () => {
      const user = userEvent.setup();
      const onPeriodChange = vi.fn();

      renderWithClient(
        <VendorSalesChart
          data={mockDashboardData.chart}
          period="7d"
          onPeriodChange={onPeriodChange}
        />,
      );

      expect(screen.getByText('Sales Overview')).toBeDefined();
      expect(screen.getByText('7D')).toBeDefined();
      expect(screen.getByText('30D')).toBeDefined();
      expect(screen.getByText('90D')).toBeDefined();

      await user.click(screen.getByText('30D'));
      expect(onPeriodChange).toHaveBeenCalledWith('30d');
    });
  });

  describe('VendorRecentOrders', () => {
    it('renders order list with order numbers, items, amounts, and badges', () => {
      renderWithClient(<VendorRecentOrders orders={mockDashboardData.recentOrders} />);

      expect(screen.getByText('Recent Orders')).toBeDefined();
      expect(screen.getByText('#1001')).toBeDefined();
      expect(screen.getByText('₹ 2,499')).toBeDefined();
      expect(screen.getByText('Pending')).toBeDefined();

      expect(screen.getByText('#1002')).toBeDefined();
      expect(screen.getByText('₹ 899')).toBeDefined();
      expect(screen.getByText('Processing')).toBeDefined();
    });

    it('renders empty message when no orders exist', () => {
      renderWithClient(<VendorRecentOrders orders={[]} />);
      expect(screen.getByText('No orders placed yet.')).toBeDefined();
    });
  });

  describe('VendorTopProducts', () => {
    it('renders top products and indicates out of stock status', () => {
      renderWithClient(<VendorTopProducts products={mockDashboardData.topProducts} />);

      expect(screen.getByText('Top Products')).toBeDefined();
      expect(screen.getByText('Sony WH-1000XM5')).toBeDefined();
      expect(screen.getByText('Electronics · Headphones')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
      expect(screen.getByText('₹ 84,000')).toBeDefined();
      expect(screen.getByText('8')).toBeDefined();

      expect(screen.getByText('Coffee Machine')).toBeDefined();
      expect(screen.getByText('0')).toBeDefined();
    });

    it('renders empty message when no products exist', () => {
      renderWithClient(<VendorTopProducts products={[]} />);
      expect(screen.getByText('No active products found.')).toBeDefined();
    });
  });

  describe('VendorDashboardOverview', () => {
    it('integrates full overview screen with greeting and add product button', async () => {
      renderWithClient(<VendorDashboardOverview />);

      expect(screen.getByText('Add Product')).toBeDefined();
      expect(screen.getByText('Last 7 days')).toBeDefined();
      expect(await screen.findByText('₹ 1,24,500')).toBeDefined();
      expect(await screen.findByText('#1001')).toBeDefined();
      expect(await screen.findByText('Sony WH-1000XM5')).toBeDefined();
    });
  });
});
