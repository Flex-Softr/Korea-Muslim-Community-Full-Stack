"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileSettingsCardProps = {
  email: string;
  initialName: string;
  isEmailVerified: boolean;
};

function ProfileSettingsCard({
  email,
  initialName,
  isEmailVerified,
}: ProfileSettingsCardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [profileName, setProfileName] = useState(initialName);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [profilePending, setProfilePending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    setProfilePending(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setProfilePending(false);
    if (!res.ok) {
      setProfileErr(data.error || "Could not update profile.");
      return;
    }
    setProfileMsg("Profile saved.");
    await update?.();
    router.refresh();
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your display name (optional). Email is managed at sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(ev) => void saveProfile(ev)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              value={email}
              disabled
              className="h-10 bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              maxLength={120}
              autoComplete="name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label>Profile image</Label>
            <ImageUploader
              value={avatarPreview}
              onChange={setAvatarPreview}
              maxSizeMb={5}
              helperText="Upload preview only for now. Image profile persistence will be enabled in a later update."
            />
          </div>
          {isEmailVerified ? (
            <p className="text-xs text-muted-foreground">
              Email verified — you have full access to the dashboard.
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Finish verifying your email to use the dashboard without
              interruption.
            </p>
          )}
          {profileMsg ? (
            <p className="text-sm text-muted-foreground" role="status">
              {profileMsg}
            </p>
          ) : null}
          {profileErr ? (
            <p className="text-sm text-destructive" role="alert">
              {profileErr}
            </p>
          ) : null}
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsPanel() {
  const { data: session } = useSession();
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwPending, setPwPending] = useState(false);

  const userId = session?.user?.id;
  const sessionName = session?.user?.name ?? "";
  const profileKey = `${userId ?? "pending"}-${sessionName}`;

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (newPassword !== confirm) {
      setPwErr("New password and confirmation do not match.");
      return;
    }
    setPwPending(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setPwPending(false);
    if (!res.ok) {
      setPwErr(data.error || "Could not change password.");
      return;
    }
    setPwMsg("Password updated.");
    e.currentTarget.reset();
  }

  if (!userId || !session?.user?.email) {
    return (
      <div className="text-sm text-muted-foreground">Loading settings…</div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ProfileSettingsCard
        key={profileKey}
        email={session.user.email}
        initialName={sessionName}
        isEmailVerified={session.user.isEmailVerified}
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password. You must enter your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(ev) => void changePassword(ev)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <PasswordInput
                id="current-password"
                name="currentPassword"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                name="newPassword"
                autoComplete="new-password"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {pwMsg ? (
              <p className="text-sm text-muted-foreground" role="status">
                {pwMsg}
              </p>
            ) : null}
            {pwErr ? (
              <p className="text-sm text-destructive" role="alert">
                {pwErr}
              </p>
            ) : null}
            <Button type="submit" disabled={pwPending}>
              {pwPending ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
