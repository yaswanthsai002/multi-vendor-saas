import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ResetPasswordPage from './page';

import * as resetPasswordService from '@/features/reset-password/services/reset-password.service';
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

vi.mock('@/features/reset-password/services/reset-password.service', () => ({
  resetPassword: vi.fn(),
}));

function renderResetPasswordPage() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={testQueryClient}>
      <ResetPasswordPage />
    </QueryClientProvider>,
  );
}

describe('Reset Password Page (/reset-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders heading, password inputs, back link, and submit button', () => {
    renderResetPasswordPage();

    expect(screen.getByRole('heading', { name: /set new password/i })).toBeDefined();
    expect(screen.getByLabelText(/^new password/i)).toBeDefined();
    expect(screen.getByLabelText(/^confirm new password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeDefined();
  });

  it('displays validation error when password is shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderResetPasswordPage();

    const newPasswordInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/^confirm new password/i);
    await user.type(newPasswordInput, 'short');
    await user.type(confirmInput, 'short');

    const submitBtn = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeDefined();
    });
    expect(resetPasswordService.resetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderResetPasswordPage();

    const newPasswordInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/^confirm new password/i);
    await user.type(newPasswordInput, 'Password123!');
    await user.type(confirmInput, 'Password456!');

    const submitBtn = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined();
    });
    expect(resetPasswordService.resetPassword).not.toHaveBeenCalled();
  });

  it('toggles password visibility when clicking eye button', async () => {
    const user = userEvent.setup();
    renderResetPasswordPage();

    const newPasswordInput = screen.getByLabelText(/^new password/i);
    expect(newPasswordInput.getAttribute('type')).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /show new password/i });
    await user.click(toggleBtn);

    expect(newPasswordInput.getAttribute('type')).toBe('text');
  });

  it('submits matching passwords and redirects to /signin on success', async () => {
    const user = userEvent.setup();
    vi.mocked(resetPasswordService.resetPassword).mockResolvedValueOnce({
      message: 'Password reset successfully',
    });

    renderResetPasswordPage();

    const newPasswordInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/^confirm new password/i);
    await user.type(newPasswordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');

    const submitBtn = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(resetPasswordService.resetPassword).toHaveBeenCalledWith(
        {
          newPassword: 'SecurePass123!',
          confirmNewPassword: 'SecurePass123!',
        },
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Password reset successfully!',
        expect.objectContaining({
          description: 'You can now sign in with your new password.',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('handles expired/invalid reset token by redirecting to /forgot-password', async () => {
    const user = userEvent.setup();
    vi.mocked(resetPasswordService.resetPassword).mockRejectedValueOnce(
      new ApiError(400, 'INVALID_RESET_TOKEN', 'Password reset session is invalid or expired.'),
    );

    renderResetPasswordPage();

    const newPasswordInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/^confirm new password/i);
    await user.type(newPasswordInput, 'SecurePass123!');
    await user.type(confirmInput, 'SecurePass123!');

    const submitBtn = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Session expired',
        expect.objectContaining({
          description: 'Your password reset session has expired. Please request a new code.',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });
  });
});
