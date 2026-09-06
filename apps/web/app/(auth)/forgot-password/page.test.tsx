import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ForgotPasswordPage from './page';

import * as forgotPasswordService from '@/features/forgot-password/services/forgot-password.service';
import { ApiError } from '@/lib/api-client';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/forgot-password/services/forgot-password.service', () => ({
  requestPasswordResetOtp: vi.fn(),
}));

function renderForgotPasswordPage() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={testQueryClient}>
      <ForgotPasswordPage />
    </QueryClientProvider>,
  );
}

describe('Forgot Password Page (/forgot-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders title, email input, back link, and submit button', () => {
    renderForgotPasswordPage();

    expect(screen.getByRole('heading', { name: /forgot your password\?/i })).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeDefined();
  });

  it('displays validation error when submitting with empty email', async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    const submitBtn = screen.getByRole('button', { name: /send verification code/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeDefined();
    });
    expect(forgotPasswordService.requestPasswordResetOtp).not.toHaveBeenCalled();
  });

  it('submits valid email and redirects to /verify-email', async () => {
    const user = userEvent.setup();
    vi.mocked(forgotPasswordService.requestPasswordResetOtp).mockResolvedValueOnce({
      message: 'Verification code sent',
      expiresIn: 300,
      resendCooldown: 60,
    });

    renderForgotPasswordPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'alex@example.com');

    const submitBtn = screen.getByRole('button', { name: /send verification code/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(forgotPasswordService.requestPasswordResetOtp).toHaveBeenCalledWith(
        { email: 'alex@example.com' },
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Verification code sent',
        expect.objectContaining({
          description: 'Please check your email for the verification code.',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/verify-email');
    });
  });

  it('handles API error on submission', async () => {
    const user = userEvent.setup();
    vi.mocked(forgotPasswordService.requestPasswordResetOtp).mockRejectedValueOnce(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Service temporarily unavailable'),
    );

    renderForgotPasswordPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'alex@example.com');

    const submitBtn = screen.getByRole('button', { name: /send verification code/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Request failed',
        expect.objectContaining({
          description: 'Service temporarily unavailable',
        }),
      );
    });
  });
});
