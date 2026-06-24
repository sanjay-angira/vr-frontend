"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Input } from "@/components/common/Input";
import { ImageUploadField } from "@/components/admin/forms/shared/ImageUploadField";
import { UPLOAD_PATHS } from "@/components/admin/forms/shared/uploadPaths";
import {
  STORAGE_KEYS,
  getData,
  postData,
  putData,
  API_ENDPOINTS,
} from "@/services/api";
import { setJson } from "@/services/api/storage";
import { useAdminAuth } from "@/services/admin/useAdminAuth";
import { useAppDispatch } from "@/services/redux/hooks";
import { updateAdmin } from "@/services/redux/slices/adminSlices/adminAuthSlice";

type ProfileUser = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: string;
  userRoles?: Array<{ roleName?: string; role?: { roleName?: string } }>;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
};

type PasswordFormState = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const emptyProfileForm: ProfileFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  profileImage: "",
};

const emptyPasswordForm: PasswordFormState = {
  oldPassword: "",
  password: "",
  confirmPassword: "",
};

function getInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  const initials = `${first}${last}`.trim();
  return (initials || "A").toUpperCase();
}

function getRoleName(user?: ProfileUser | null) {
  return (
    user?.userRoles?.[0]?.roleName ??
    user?.userRoles?.[0]?.role?.roleName ??
    "Admin"
  );
}

function formatMemberSince(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function mapUserToForm(user: ProfileUser): ProfileFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    profileImage: user.profileImage ?? "",
  };
}

function SuccessMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {message}
    </div>
  );
}

function ProfileSectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const { admin, isHydrated } = useAdminAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    if (!admin?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const response = await getData(API_ENDPOINTS.AUTH.GET_USER(admin.id));
      const user = (response as { data?: ProfileUser }).data ?? response;
      setProfile(user as ProfileUser);
      setProfileForm(mapUserToForm(user as ProfileUser));
    } catch {
      setLoadError("Failed to load profile. Please try again.");
      if (admin) {
        const [firstName = "", ...rest] = admin.name.split(" ");
        setProfileForm({
          firstName,
          lastName: rest.join(" "),
          email: admin.email,
          phoneNumber: "",
          profileImage: admin.avatar ?? "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function saveProfile(
    overrides?: Partial<ProfileFormState>,
    successMessage = "Profile updated successfully."
  ) {
    if (!admin?.id) return;

    const nextProfile = {
      firstName: (overrides?.firstName ?? profileForm.firstName).trim(),
      lastName: (overrides?.lastName ?? profileForm.lastName).trim(),
      email: (overrides?.email ?? profileForm.email).trim(),
      phoneNumber: (overrides?.phoneNumber ?? profileForm.phoneNumber).trim(),
      profileImage: (overrides?.profileImage ?? profileForm.profileImage).trim(),
    };

    const response = await putData(API_ENDPOINTS.USERS.UPDATE(admin.id), nextProfile);
    const updatedUser =
      (response as { data?: ProfileUser }).data ?? (response as ProfileUser);

    setProfile(updatedUser);
    setProfileForm(mapUserToForm(updatedUser));

    const fullName = `${updatedUser.firstName ?? ""} ${updatedUser.lastName ?? ""}`.trim();
    dispatch(
      updateAdmin({
        name: fullName || admin.name,
        email: updatedUser.email ?? admin.email,
        avatar: updatedUser.profileImage ?? undefined,
        role: getRoleName(updatedUser),
      })
    );

    setJson(STORAGE_KEYS.adminUser, updatedUser);
    setProfileSuccess(successMessage);
  }

  async function handleProfileImageChange(url: string) {
    const previousImage = profileForm.profileImage;
    setProfileForm((current) => ({
      ...current,
      profileImage: url,
    }));

    if (url !== "" || !previousImage) return;

    setProfileError("");
    setProfileSuccess("");
    setIsSavingProfile(true);

    try {
      await saveProfile({ profileImage: "" }, "Profile photo removed.");
    } catch {
      setProfileForm((current) => ({
        ...current,
        profileImage: previousImage,
      }));
      setProfileError("Failed to remove profile photo. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!admin?.id) return;

    setProfileError("");
    setProfileSuccess("");
    setIsSavingProfile(true);

    try {
      await saveProfile();
    } catch (error) {
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.password.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await postData(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        oldPassword: passwordForm.oldPassword,
        password: passwordForm.password,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordSuccess("Password changed successfully.");
    } catch (error) {
      throw error;
    } finally {
      setIsSavingPassword(false);
    }
  }

  const displayName =
    `${profileForm.firstName} ${profileForm.lastName}`.trim() || admin?.name || "Admin";
  const roleName = getRoleName(profile);
  const avatarUrl = profileForm.profileImage.trim() || admin?.avatar;

  if (!isHydrated) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">Sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="relative px-6 pb-6">
          <div className="-mx-6 h-28 bg-gradient-to-r from-admin-sidebar via-admin-primary to-blue-400" />

          <div className="absolute left-6 top-28 flex h-24 w-24 -translate-y-1/2 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-admin-primary text-2xl font-semibold text-white shadow-md">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(profileForm.firstName, profileForm.lastName)
            )}
          </div>

          <div className="absolute right-6 left-34 top-26 -translate-y-full">
            <h2 className="truncate text-2xl font-semibold leading-tight text-white">
              {displayName}
            </h2>
          </div>

          <div className="absolute inset-x-6 top-28 flex flex-col gap-2 pt-1 pl-28 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 truncate text-sm text-zinc-500">
              {profileForm.email || admin.email}
            </p>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-admin-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-800">
                {roleName}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  profile?.isActive === false
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {profile?.isActive === false ? "Inactive" : "Active"}
              </span>
            </div>
          </div>

          <div className="mt-[3.5rem] grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                User ID
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">{admin.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Phone
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {profileForm.phoneNumber || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Member since
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {formatMemberSince(profile?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{loadError}</p>
          <button
            type="button"
            onClick={loadProfile}
            className="text-sm font-medium text-amber-900 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 h-5 w-40 rounded bg-zinc-100" />
              <div className="space-y-4">
                <div className="h-10 rounded-lg bg-zinc-100" />
                <div className="h-10 rounded-lg bg-zinc-100" />
                <div className="h-10 rounded-lg bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileSectionCard
            title="Personal information"
            description="Update your name, contact details, and profile photo."
          >
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <ErrorMessage message={profileError} />
              <SuccessMessage message={profileSuccess} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  value={profileForm.firstName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  placeholder="First name"
                  required
                />
                <Input
                  label="Last name"
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  placeholder="Last name"
                  required
                />
              </div>

              <Input
                label="Email address"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="admin@example.com"
                required
              />

              <Input
                label="Phone number"
                type="tel"
                value={profileForm.phoneNumber}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                placeholder="9876543210"
              />

              <ImageUploadField
                label="Profile photo"
                value={profileForm.profileImage}
                onChange={handleProfileImageChange}
                uploadPath={UPLOAD_PATHS.users}
                hint="Upload a profile photo or replace the current image. Removing the photo updates your profile immediately."
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSavingProfile}>
                  Save changes
                </Button>
              </div>
            </form>
          </ProfileSectionCard>

          <ProfileSectionCard
            title="Security"
            description="Change your password to keep your account secure."
          >
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <ErrorMessage message={passwordError} />
              <SuccessMessage message={passwordSuccess} />

              <Input
                label="Current password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    oldPassword: event.target.value,
                  }))
                }
                placeholder="Enter current password"
                showPasswordToggle
                required
              />

              <Input
                label="New password"
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter new password"
                showPasswordToggle
                required
              />

              <Input
                label="Confirm new password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm new password"
                showPasswordToggle
                required
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSavingPassword}>
                  Update password
                </Button>
              </div>
            </form>
          </ProfileSectionCard>
        </div>
      )}
    </div>
  );
}
