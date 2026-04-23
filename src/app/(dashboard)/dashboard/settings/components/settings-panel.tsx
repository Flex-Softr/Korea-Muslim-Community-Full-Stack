"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToastSystem } from "@/components/ui/toast-system";

type DonationBankDetails = {
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  swift: string | null;
  branch: string | null;
  referenceNote: string | null;
};

function DonationBankSettingsCard({
  onNotify,
}: {
  onNotify: (message: string, type: "success" | "error" | "info") => void;
}) {
  const [values, setValues] = useState<DonationBankDetails>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    swift: "",
    branch: "",
    referenceNote: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBankSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/dashboard/settings/donation-bank", {
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: DonationBankDetails;
        };
        if (!res.ok) {
          throw new Error(data.error || "Could not load donation bank settings.");
        }
        if (!cancelled && data.details) {
          setValues({
            bankName: data.details.bankName ?? "",
            accountName: data.details.accountName ?? "",
            accountNumber: data.details.accountNumber ?? "",
            swift: data.details.swift ?? "",
            branch: data.details.branch ?? "",
            referenceNote: data.details.referenceNote ?? "",
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          const msg =
            loadError instanceof Error
              ? loadError.message
              : "Could not load donation bank settings.";
          setError(msg);
          onNotify(msg, "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadBankSettings();
    return () => {
      cancelled = true;
    };
  }, [onNotify]);

  async function saveDonationBankSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!values.bankName?.trim() || !values.accountName?.trim() || !values.accountNumber?.trim()) {
      const validationError = "Bank, account name, and account number are required.";
      setError(validationError);
      onNotify(validationError, "error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/dashboard/settings/donation-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: DonationBankDetails;
      };
      if (!res.ok) {
        const saveError = data.error || "Could not save donation bank settings.";
        setError(saveError);
        onNotify(saveError, "error");
        return;
      }
      if (data.details) {
        setValues({
          bankName: data.details.bankName ?? "",
          accountName: data.details.accountName ?? "",
          accountNumber: data.details.accountNumber ?? "",
          swift: data.details.swift ?? "",
          branch: data.details.branch ?? "",
          referenceNote: data.details.referenceNote ?? "",
        });
      }
      const successMessage = "Donation bank settings saved.";
      setMessage(successMessage);
      onNotify(successMessage, "success");
    } catch {
      const saveError = "Could not save donation bank settings.";
      setError(saveError);
      onNotify(saveError, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-border/80 shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle>Donation Bank Transfer</CardTitle>
        <CardDescription>
          Manage the bank details shown on the public donation page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(ev) => void saveDonationBankSettings(ev)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="donation-bank-name">Bank name</Label>
              <Input
                id="donation-bank-name"
                value={values.bankName ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, bankName: e.target.value }))}
                maxLength={160}
                required
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation-account-name">Account name</Label>
              <Input
                id="donation-account-name"
                value={values.accountName ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, accountName: e.target.value }))}
                maxLength={160}
                required
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation-account-number">Account number</Label>
              <Input
                id="donation-account-number"
                value={values.accountNumber ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, accountNumber: e.target.value }))
                }
                maxLength={120}
                required
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation-branch">Branch (optional)</Label>
              <Input
                id="donation-branch"
                value={values.branch ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, branch: e.target.value }))}
                maxLength={160}
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation-swift">SWIFT / BIC (optional)</Label>
              <Input
                id="donation-swift"
                value={values.swift ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, swift: e.target.value }))}
                maxLength={80}
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="donation-reference-note">Transfer reference / memo</Label>
              <Textarea
                id="donation-reference-note"
                value={values.referenceNote ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, referenceNote: e.target.value }))
                }
                maxLength={240}
                rows={3}
                disabled={loading || saving}
              />
            </div>
          </div>
          {message ? (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving…" : "Save donation bank details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsPanel() {
  const { data: session } = useSession();
  const { notify } = useToastSystem();
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwPending, setPwPending] = useState(false);
  const [createAdminMsg, setCreateAdminMsg] = useState<string | null>(null);
  const [createAdminErr, setCreateAdminErr] = useState<string | null>(null);
  const [createAdminPending, setCreateAdminPending] = useState(false);

  const userId = session?.user?.id;

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
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
    const successMessage =
      "Password updated. Please sign in again with your new password.";
    setPwMsg(successMessage);
    notify(successMessage, "success");
    formElement.reset();
    await signOut({ callbackUrl: "/login" });
  }

  async function createAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateAdminErr(null);
    setCreateAdminMsg(null);
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("adminName") || "").trim();
    const email = String(form.get("adminEmail") || "").trim().toLowerCase();
    const password = String(form.get("adminPassword") || "");

    if (!name || !email || !password) {
      const message = "Name, email, and password are required.";
      setCreateAdminErr(message);
      notify(message, "error");
      return;
    }

    setCreateAdminPending(true);
    const res = await fetch("/api/dashboard/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setCreateAdminPending(false);

    if (!res.ok) {
      const message = data.error || "Could not create admin.";
      setCreateAdminErr(message);
      notify(message, "error");
      return;
    }

    const successMessage = "Admin account created successfully.";
    setCreateAdminMsg(successMessage);
    notify(successMessage, "success");
    formElement.reset();
  }

  if (!userId || !session?.user?.email) {
    return (
      <div className="text-sm text-muted-foreground">Loading settings…</div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
      <Card id="account-profile" className="border-border/80 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Everything you provided at registration, plus your account details. Your email
            is used to sign in and is not changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountProfileForm
            readOnlyEmail={session.user.email}
            isEmailVerified={Boolean(session.user.isEmailVerified)}
            onNotify={notify}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm lg:col-span-1">
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

      {session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" ? (
        <DonationBankSettingsCard onNotify={notify} />
      ) : null}

      {session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" ? (
        <Card className="border-border/80 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Admin</CardTitle>
            <CardDescription>
              Add another admin account with immediate dashboard access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(ev) => void createAdmin(ev)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input
                  id="admin-name"
                  name="adminName"
                  maxLength={120}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  name="adminEmail"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Temporary password</Label>
                <PasswordInput
                  id="admin-password"
                  name="adminPassword"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters and ask the admin to change it after first login.
                </p>
              </div>
              {createAdminMsg ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {createAdminMsg}
                </p>
              ) : null}
              {createAdminErr ? (
                <p className="text-sm text-destructive" role="alert">
                  {createAdminErr}
                </p>
              ) : null}
              <Button type="submit" disabled={createAdminPending}>
                {createAdminPending ? "Creating…" : "Create admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
