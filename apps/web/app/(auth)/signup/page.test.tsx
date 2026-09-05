import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as signupService from '@/features/signup/services/signup.service';
import { ApiError } from '@/lib/api-client';
import { QueryProvider } from '@/providers/query-provider';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/signup/services/signup.service', () => ({
  signup: vi.fn(),
}));

function renderSignupPage() {
  return render(
    <QueryProvider>
      <SignupPage />
    </QueryProvider>,
  );
}

describe('Signup Page (/signup)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all form fields, labels, and submission button', () => {
    renderSignupPage();

    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/^email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password/i)).toBeDefined();
    expect(screen.getByLabelText(/^confirm password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
  });

  it('submits valid form data, calls signup API, and displays success feedback', async () => {
    const user = userEvent.setup();
    vi.mocked(signupService.signup).mockResolvedValueOnce({
      user: {
        userId: '1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        roles: ['customer'],
        emailVerifiedAt: null,
      },
    });

    renderSignupPage();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'ValidPass123!');
    await user.type(screen.getByLabelText(/^confirm password/i), 'ValidPass123!');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(signupService.signup).toHaveBeenCalledWith(
        {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          password: 'ValidPass123!',
          confirmPassword: 'ValidPass123!',
        },
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Account created successfully!',
        expect.objectContaining({
          description: 'Welcome to Perigee. You can now sign in to your account.',
        }),
      );
    });
  });

  it('handles email conflict error (409) and sets field error', async () => {
    const user = userEvent.setup();
    vi.mocked(signupService.signup).mockRejectedValueOnce(
      new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists.'),
    );

    renderSignupPage();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'ValidPass123!');
    await user.type(screen.getByLabelText(/^confirm password/i), 'ValidPass123!');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeDefined();
      expect(toast.error).toHaveBeenCalledWith(
        'Account already exists',
        expect.objectContaining({
          description: 'Please sign in or use a different email address.',
        }),
      );
    });
  });
});
