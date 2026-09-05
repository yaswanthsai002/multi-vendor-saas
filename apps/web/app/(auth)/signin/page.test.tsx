import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import SigninPage from './page';

import * as signinService from '@/features/signin/services/signin.service';
import { ApiError } from '@/lib/api-client';
import { QueryProvider } from '@/providers/query-provider';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/signin/services/signin.service', () => ({
  signin: vi.fn(),
}));

function renderSigninPage() {
  return render(
    <QueryProvider>
      <SigninPage />
    </QueryProvider>,
  );
}

describe('Signin Page (/signin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders email, password inputs, submit button, and forgot password link', () => {
    renderSigninPage();

    expect(screen.getByLabelText(/^email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeDefined();
  });

  it('submits valid credentials, calls signin API, and redirects to destination', async () => {
    const user = userEvent.setup();
    vi.mocked(signinService.signin).mockResolvedValueOnce({
      user: {
        userId: '1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        roles: ['customer'],
        emailVerifiedAt: null,
      },
    });

    renderSigninPage();

    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'ValidPassword123!');

    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(signinService.signin).toHaveBeenCalledWith(
        {
          email: 'jane@example.com',
          password: 'ValidPassword123!',
        },
        undefined,
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Signed in successfully!',
        expect.objectContaining({
          description: 'Welcome back, Jane Doe!',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles invalid credentials error (401) and shows error state', async () => {
    const user = userEvent.setup();
    vi.mocked(signinService.signin).mockRejectedValueOnce(
      new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.'),
    );

    renderSigninPage();

    await user.type(screen.getByLabelText(/^email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'WrongPass123!');

    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/invalid email or password/i).length).toBeGreaterThanOrEqual(1);
      expect(toast.error).toHaveBeenCalledWith(
        'Sign in failed',
        expect.objectContaining({
          description: 'Invalid email or password. Please check your credentials.',
        }),
      );
    });
  });
});
