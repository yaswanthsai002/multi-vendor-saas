import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import VerifyEmailPage from './page';

import * as verifyEmailService from '@/features/verify-email/services/verify-email.service';
import { ApiError } from '@/lib/api-client';
import { QueryProvider } from '@/providers/query-provider';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams('email=jane@example.com&purpose=email_verification');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/verify-email/services/verify-email.service', () => ({
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

function renderVerifyEmailPage() {
  return render(
    <QueryProvider>
      <VerifyEmailPage />
    </QueryProvider>,
  );
}

describe('Verify Email Page (/verify-email)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('email=jane@example.com&purpose=email_verification');
    vi.mocked(verifyEmailService.sendOtp).mockResolvedValue({
      message: 'OTP sent successfully',
      email: 'jane@example.com',
      purpose: 'email_verification',
      expiresIn: 300,
      resendCooldown: 60,
      otp: '123456',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders masked email, 6 OTP input boxes, and submit button for signup flow', () => {
    renderVerifyEmailPage();

    expect(screen.getByText(/verify your email/i)).toBeDefined();
    expect(screen.getByText(/j••••••@example\.com/i)).toBeDefined();
    expect(screen.getAllByRole('textbox').length).toBe(6);
    expect(screen.getByRole('button', { name: /verify email/i })).toBeDefined();

    // In signup flow, "Change email" and "Back to sign in" MUST NOT be rendered
    expect(screen.queryByText(/change email/i)).toBeNull();
    expect(screen.queryByText(/back to sign in/i)).toBeNull();
  });

  it('renders "Back to sign in" and "Change email" when purpose is password_reset', () => {
    mockSearchParams = new URLSearchParams('email=jane@example.com&purpose=password_reset');
    renderVerifyEmailPage();

    expect(screen.getByText(/back to sign in/i)).toBeDefined();
    expect(screen.getByText(/change email/i)).toBeDefined();
  });

  it('submits manual 6-character OTP and redirects to /signin on success', async () => {
    const user = userEvent.setup();
    vi.mocked(verifyEmailService.verifyOtp).mockResolvedValueOnce({
      message: 'OTP verified successfully',
      verified: true,
      email: 'jane@example.com',
      purpose: 'email_verification',
    });

    renderVerifyEmailPage();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');
    await user.type(inputs[4], '5');
    await user.type(inputs[5], '6');

    const submitBtn = screen.getByRole('button', { name: /verify email/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(verifyEmailService.verifyOtp).toHaveBeenCalledWith(
        {
          email: 'jane@example.com',
          otp: '123456',
          purpose: 'email_verification',
        },
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Email verified successfully!',
        expect.objectContaining({
          description: 'You can now sign in with your credentials.',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('handles verification failure (invalid OTP) and displays error message', async () => {
    const user = userEvent.setup();
    vi.mocked(verifyEmailService.verifyOtp).mockRejectedValueOnce(
      new ApiError(400, 'INVALID_OTP', 'Incorrect OTP code. You have 2 attempt(s) remaining.'),
    );

    renderVerifyEmailPage();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], '0');
    }

    await user.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect otp code/i)).toBeDefined();
      expect(toast.error).toHaveBeenCalledWith(
        'Verification failed',
        expect.objectContaining({
          description: 'Incorrect OTP code. You have 2 attempt(s) remaining.',
        }),
      );
    });
  });
});
