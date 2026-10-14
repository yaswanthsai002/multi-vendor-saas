'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  Moon,
  Palette,
  Shield,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { toast } from 'sonner';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { type CurrentUserData } from '@/lib/auth/current-user';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

type SettingsTab = 'general' | 'security' | 'preferences';

export default function AdminProfilePage() {
  const { data, isLoading } = useCurrentUser();
  const user = data?.user;

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        <div className="h-8 w-60 bg-surface-subtle animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 lg:col-span-3 space-y-2">
            <div className="h-10 bg-surface-subtle animate-pulse rounded-xl" />
            <div className="h-10 bg-surface-subtle animate-pulse rounded-xl" />
            <div className="h-10 bg-surface-subtle animate-pulse rounded-xl" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="h-40 rounded-2xl bg-surface-subtle animate-pulse border border-border-default" />
            <div className="h-64 rounded-2xl bg-surface-subtle animate-pulse border border-border-default" />
          </div>
        </div>
      </div>
    );
  }

  return <AdminProfileContent key={user.userId ?? user.fullName} user={user} />;
}

function AdminProfileContent({ user }: { user: CurrentUserData }) {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Active sub-navigation tab
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('general');

  // Profile Form State
  const [fullName, setFullName] = React.useState(user.fullName || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Upload Avatar Mutation (Direct-to-R2 presigned flow)
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Request presigned upload URL with file metadata
      const { uploadUrl, publicUrl } = await makeApiRequest<{
        uploadUrl: string;
        publicUrl: string;
      }>({
        url: API_ENDPOINTS.auth.avatarUploadUrl,
        method: 'POST',
        data: {
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
        },
      });

      // 2. Direct binary HTTP PUT to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image directly to storage.');
      }

      // 3. Persist public avatar URL in user profile
      return makeApiRequest({
        url: API_ENDPOINTS.auth.updateMe,
        method: 'PATCH',
        data: { avatarUrl: publicUrl },
      });
    },
    onSuccess: () => {
      toast.success('Profile photo updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    },
  });

  // Remove Avatar Mutation
  const removeAvatarMutation = useMutation({
    mutationFn: () =>
      makeApiRequest({
        url: API_ENDPOINTS.auth.updateMe,
        method: 'PATCH',
        data: { avatarUrl: null },
      }),
    onSuccess: () => {
      toast.success('Profile photo removed');
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove photo');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    uploadAvatarMutation.mutate(file);
    e.target.value = '';
  };

  // Update Name Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string }) =>
      makeApiRequest({
        url: API_ENDPOINTS.auth.updateMe,
        method: 'PATCH',
        data,
      }),
    onSuccess: () => {
      toast.success('Profile details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) =>
      makeApiRequest({
        url: API_ENDPOINTS.auth.changePassword,
        method: 'POST',
        data,
      }),
    onSuccess: () => {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim() === user?.fullName) return;
    updateProfileMutation.mutate({ fullName: fullName.trim() });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmNewPassword: confirmPassword,
    });
  };

  const isProfileDirty = fullName.trim() !== (user?.fullName || '');
  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AD';

  // ponytail: Lightweight password strength indicator (0-4)
  const passwordStrength = React.useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-danger' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500' };
    return { score: 4, label: 'Strong', color: 'bg-success' };
  }, [newPassword]);

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const navItems: {
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'general', label: 'General Profile', icon: User },
    { id: 'security', label: 'Password & Security', icon: KeyRound },
    { id: 'preferences', label: 'Interface & Theme', icon: Palette },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Account Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your personal administrative credentials, avatar, and appearance preferences.
        </p>
      </div>

      {/* 2-Column Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sub-navigation Menu */}
        <aside className="md:col-span-4 lg:col-span-3">
          {/* Mobile Tab Strip */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 border-b border-border-default">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                    isActive
                      ? 'bg-accent text-on-accent shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover bg-surface-raised border border-border-default',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Vertical Subnav */}
          <nav className="hidden md:flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'relative flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left cursor-pointer',
                    isActive
                      ? 'bg-surface-raised dark:bg-surface text-text-primary font-semibold border border-border-default shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/80 border border-transparent',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-accent' : 'text-text-tertiary',
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Column: Settings Panels */}
        <main className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Identity Banner with Avatar Photo Upload */}
              <div className="bg-surface-raised dark:bg-surface p-6 sm:p-7 rounded-2xl border border-border-default shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative group shrink-0 self-start sm:self-auto">
                    {user.avatarUrl ? (
                      <div className="relative h-18 w-18 rounded-2xl overflow-hidden border border-border-default shadow-xs bg-surface-subtle">
                        <Image
                          src={user.avatarUrl}
                          alt={user.fullName || 'Admin Avatar'}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-18 w-18 rounded-2xl bg-accent text-on-accent font-bold text-2xl flex items-center justify-center shadow-xs select-none">
                        {initials}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                      className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                      title="Upload profile photo"
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-[10px] font-semibold mt-0.5">Upload</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-text-primary truncate">
                        {user?.fullName || 'Platform Administrator'}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
                        <Shield className="h-3 w-3" />
                        <span>Superadmin</span>
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-text-secondary mt-1 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                      <span className="truncate">{user?.email}</span>
                      {user?.emailVerifiedAt ? (
                        <span
                          title="Email verified"
                          className="text-success inline-flex items-center shrink-0"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span
                          title="Email unverified"
                          className="text-text-tertiary inline-flex items-center shrink-0"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatarMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-surface-subtle hover:bg-surface-hover text-text-primary border border-border-default transition-colors cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5 text-text-secondary" />
                        <span>
                          {uploadAvatarMutation.isPending ? 'Uploading...' : 'Change photo'}
                        </span>
                      </button>
                      {user.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => removeAvatarMutation.mutate()}
                          disabled={removeAvatarMutation.isPending}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-danger hover:bg-danger-subtle/40 border border-transparent hover:border-danger/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details Form */}
              <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-xs overflow-hidden">
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-text-primary">
                        Personal Information
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Update the display name shown across audit logs and administrative actions.
                      </p>
                    </div>
                  </div>

                  <form
                    id="profile-form"
                    onSubmit={handleProfileSubmit}
                    className="space-y-4 max-w-xl"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        Display Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface-subtle border border-border-default focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder:text-text-tertiary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-surface-subtle border border-border-default text-text-tertiary cursor-not-allowed select-none"
                      />
                      <p className="text-[11px] text-text-tertiary mt-1.5">
                        Email modification is restricted to platform super-administrators for
                        account audit security.
                      </p>
                    </div>
                  </form>
                </div>

                <div className="bg-surface-subtle/50 border-t border-border-subtle px-6 sm:px-7 py-3.5 flex items-center justify-between">
                  <span className="text-xs text-text-tertiary hidden sm:inline">
                    Changes reflect immediately across all administrative panels.
                  </span>
                  <div className="flex items-center gap-2.5 ml-auto">
                    {isProfileDirty && (
                      <button
                        type="button"
                        onClick={() => setFullName(user?.fullName || '')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-hover border border-border-default transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="submit"
                      form="profile-form"
                      disabled={!isProfileDirty || updateProfileMutation.isPending}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-xs overflow-hidden">
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                    <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-text-primary">
                        Password & Authentication
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Ensure your account uses a secure password with at least 8 characters.
                      </p>
                    </div>
                  </div>

                  <form
                    id="password-form"
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4 max-w-xl"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        Current Password <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password..."
                          className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface-subtle border border-border-default focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder:text-text-tertiary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                          aria-label={
                            showCurrentPassword ? 'Hide current password' : 'Show current password'
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        New Password <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters..."
                          className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface-subtle border border-border-default focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder:text-text-tertiary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                          aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {newPassword && (
                        <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-text-tertiary">Password strength:</span>
                            <span className="font-semibold text-text-primary">
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={cn(
                                  'h-1.5 rounded-full transition-all duration-200',
                                  step <= passwordStrength.score
                                    ? passwordStrength.color
                                    : 'bg-surface-subtle border border-border-subtle',
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        Confirm New Password <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password..."
                          className={cn(
                            'w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl bg-surface dark:bg-surface-subtle border focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder:text-text-tertiary transition-colors',
                            passwordsMismatch
                              ? 'border-danger focus:ring-danger'
                              : 'border-border-default',
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                          aria-label={
                            showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {passwordsMatch && (
                        <p className="text-[11px] text-success font-medium mt-1.5 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Passwords match</span>
                        </p>
                      )}
                      {passwordsMismatch && (
                        <p className="text-[11px] text-danger font-medium mt-1.5">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-surface-subtle/50 border-t border-border-subtle px-6 sm:px-7 py-3.5 flex items-center justify-between">
                  <span className="text-xs text-text-tertiary hidden sm:inline flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-text-tertiary" />
                    <span>Credentials protected by server-side Argon2id hashing.</span>
                  </span>
                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="submit"
                      form="password-form"
                      disabled={
                        !currentPassword ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword ||
                        changePasswordMutation.isPending
                      }
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    >
                      {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-surface-raised dark:bg-surface rounded-2xl border border-border-default shadow-xs p-6 sm:p-7 space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">Interface Theme</h3>
                    <p className="text-xs text-text-secondary">
                      Customize how Perigee appears on your administrative workstation.
                    </p>
                  </div>
                </div>

                {/* Theme Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    {
                      id: 'light',
                      label: 'Light',
                      icon: Sun,
                      desc: 'Clean high-contrast daytime mode',
                    },
                    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Subdued nighttime dark mode' },
                    {
                      id: 'system',
                      label: 'System',
                      icon: Laptop,
                      desc: 'Sync with operating system',
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTheme(option.id)}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer space-y-2 relative',
                          isSelected
                            ? 'bg-accent/10 border-accent ring-1 ring-accent'
                            : 'bg-surface dark:bg-surface-subtle border-border-default hover:border-border-strong',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isSelected ? 'text-accent' : 'text-text-secondary',
                            )}
                          />
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-accent text-on-accent flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary">{option.label}</div>
                          <div className="text-[11px] text-text-secondary mt-0.5">
                            {option.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
