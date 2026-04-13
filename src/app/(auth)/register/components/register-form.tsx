"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";

type Step = 1 | 2 | 3 | 4 | 5;
type AcademicStatus = "student" | "graduate" | "professional";
type AcademicDegree = "Bachelor" | "Masters" | "PhD";

type FormState = {
  fullNameEn: string;
  fullNameBn: string;
  email: string;
  phone: string;
  password: string;
  academicStatus: AcademicStatus | "";
  universityName: string;
  department: string;
  degree: AcademicDegree | "";
  sessionIntake: string;
  cityKorea: string;
  profilePhoto: string | null;
  studentIdImage: string | null;
  reasonToJoin: string;
};

const TOTAL_STEPS = 5;

function initialState(): FormState {
  return {
    fullNameEn: "",
    fullNameBn: "",
    email: "",
    phone: "",
    password: "",
    academicStatus: "",
    universityName: "",
    department: "",
    degree: "",
    sessionIntake: "",
    cityKorea: "",
    profilePhoto: null,
    studentIdImage: null,
    reasonToJoin: "",
  };
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return "Basic Info";
      case 2:
        return "Academic Info";
      case 3:
        return "Location";
      case 4:
        return "Verification";
      default:
        return "Extra Info";
    }
  }, [step]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateCurrentStep = (): string | null => {
    if (step === 1) {
      if (!form.fullNameEn.trim()) return "Full Name (English) is required.";
      if (!form.email.trim()) return "Email is required.";
      if (!form.phone.trim()) return "Phone is required.";
      if (!form.password || form.password.length < 8) return "Password must be at least 8 characters.";
    }
    if (step === 2) {
      if (!form.academicStatus) return "Academic status is required.";
      if (!form.universityName.trim()) return "University name is required.";
      if (!form.department.trim()) return "Department is required.";
      if (!form.degree) return "Degree is required.";
      if (!form.sessionIntake.trim()) return "Session/Intake is required.";
    }
    if (step === 3) {
      if (!form.cityKorea.trim()) return "City (Korea) is required.";
    }
    if (step === 4) {
      if (!form.profilePhoto) return "Profile photo is required.";
    }
    return null;
  };

  const goNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((prev) => (Math.min(TOTAL_STEPS, prev + 1) as Step));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => (Math.max(1, prev - 1) as Step));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      setPending(false);
      setError(data.error || "Registration failed.");
      return;
    }

    setPending(false);
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{stepTitle}</p>
          <p className="text-xs text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-200"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 ? (
        <div className="form-stack">
          <div className="form-field">
            <Label htmlFor="register-full-name-en">Full Name (English)</Label>
            <Input
              id="register-full-name-en"
              value={form.fullNameEn}
              onChange={(e) => update("fullNameEn", e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-full-name-bn">Full Name (Bangla) (optional)</Label>
            <Input
              id="register-full-name-bn"
              value={form.fullNameBn}
              onChange={(e) => update("fullNameBn", e.target.value)}
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-phone">Phone</Label>
            <Input
              id="register-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-password">Password</Label>
            <PasswordInput
              id="register-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="form-stack">
          <div className="form-field">
            <Label htmlFor="register-academic-status">Status</Label>
            <select
              id="register-academic-status"
              value={form.academicStatus}
              onChange={(e) => update("academicStatus", e.target.value as AcademicStatus | "")}
              required
            >
              <option value="">Select status</option>
              <option value="student">Student</option>
              <option value="graduate">Graduate</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div className="form-field">
            <Label htmlFor="register-university-name">University Name</Label>
            <Input
              id="register-university-name"
              value={form.universityName}
              onChange={(e) => update("universityName", e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-department">Department</Label>
            <Input
              id="register-department"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <Label htmlFor="register-degree">Degree</Label>
            <select
              id="register-degree"
              value={form.degree}
              onChange={(e) => update("degree", e.target.value as AcademicDegree | "")}
              required
            >
              <option value="">Select degree</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="form-field">
            <Label htmlFor="register-session-intake">Session/Intake</Label>
            <Input
              id="register-session-intake"
              placeholder="e.g. 2024 Spring"
              value={form.sessionIntake}
              onChange={(e) => update("sessionIntake", e.target.value)}
              required
            />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="form-stack">
          <div className="form-field">
            <Label htmlFor="register-city-korea">City (Korea)</Label>
            <Input
              id="register-city-korea"
              value={form.cityKorea}
              onChange={(e) => update("cityKorea", e.target.value)}
              required
            />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="form-stack">
          <div className="form-field">
            <Label>Profile Photo</Label>
            <ImageUploader
              value={form.profilePhoto}
              onChange={(next) => update("profilePhoto", next)}
              maxSizeMb={5}
              helperText="Required. Clear face photo is recommended."
              error={error?.toLowerCase().includes("profile photo") ? error : null}
            />
          </div>
          <div className="form-field">
            <Label>Student ID image (optional)</Label>
            <ImageUploader
              value={form.studentIdImage}
              onChange={(next) => update("studentIdImage", next)}
              maxSizeMb={5}
              helperText="Optional verification document."
            />
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="form-stack">
          <div className="form-field">
            <Label htmlFor="register-reason">Reason to join</Label>
            <Textarea
              id="register-reason"
              value={form.reasonToJoin}
              onChange={(e) => update("reasonToJoin", e.target.value)}
              placeholder="Tell us a little about why you want to join this association."
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={pending || step === 1}
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={goNext} disabled={pending} className="w-full sm:w-auto">
            Next
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={pending}>
            {pending ? "Submitting…" : "Submit registration"}
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
