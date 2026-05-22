"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAccountProfile, updateAccountProfile } from "@/lib/api/account-profile";
import type { AccountProfileUpdatePayload } from "@/lib/account/profile-types";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type AcademicStatus = "student" | "graduate" | "professional";
type AcademicDegree = "Bachelor" | "Masters" | "PhD";

type Props = {
  readOnlyEmail: string;
  isEmailVerified: boolean;
  onNotify: (message: string, type: "success" | "error" | "info") => void;
};

function RequiredMark() {
  return (
    <span className="ml-1 text-destructive" aria-hidden="true">
      *
    </span>
  );
}

function formatUserDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AccountProfileForm({ readOnlyEmail, isEmailVerified, onNotify }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [phone, setPhone] = useState("");
  const [userCreatedAt, setUserCreatedAt] = useState("");

  const [memberCode, setMemberCode] = useState<string | null>(null);
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "">("");
  const [universityName, setUniversityName] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState<AcademicDegree | "">("");
  const [sessionIntake, setSessionIntake] = useState("");
  const [cityKorea, setCityKorea] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [studentIdImage, setStudentIdImage] = useState<string | null>(null);
  const [reasonToJoin, setReasonToJoin] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getAccountProfile();
      setName(res.user.name?.trim() ?? "");
      setUserCreatedAt(res.user.createdAt);
      if (res.member) {
        setMemberCode(res.member.memberCode);
        setNameBn(res.member.nameBn?.trim() ?? "");
        setPhone(res.member.phone?.trim() ?? "");
        setAcademicStatus(
          res.member.academicStatus
            ? (res.member.academicStatus as AcademicStatus)
            : "student",
        );
        setUniversityName(res.member.universityName?.trim() ?? "");
        setDepartment(res.member.department?.trim() ?? "");
        setDegree(
          res.member.degree && ["Bachelor", "Masters", "PhD"].includes(res.member.degree)
            ? (res.member.degree as AcademicDegree)
            : "Bachelor",
        );
        setSessionIntake(res.member.sessionIntake?.trim() ?? "");
        setCityKorea(res.member.cityKorea?.trim() ?? "");
        setProfilePhoto(res.member.profilePhoto);
        setStudentIdImage(res.member.studentIdImage);
        setReasonToJoin(res.member.reasonToJoin?.trim() ?? "");
      } else {
        setMemberCode(null);
        setNameBn("");
        setPhone("");
        setAcademicStatus("student");
        setUniversityName("");
        setDepartment("");
        setDegree("Bachelor");
        setSessionIntake("");
        setCityKorea("");
        setProfilePhoto(null);
        setStudentIdImage(null);
        setReasonToJoin("");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load profile.";
      setErr(msg);
      onNotify(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) {
      const m = "Full name (English) is required.";
      setErr(m);
      onNotify(m, "error");
      return;
    }
    if (!phone.trim() || !universityName.trim() || !department.trim() || !sessionIntake.trim() || !cityKorea.trim()) {
      const m = "Please fill in phone, university, department, session/intake, and city (Korea).";
      setErr(m);
      onNotify(m, "error");
      return;
    }
    if (!degree) {
      const m = "Please select a degree.";
      setErr(m);
      onNotify(m, "error");
      return;
    }
    if (!academicStatus) {
      const m = "Please select your academic or professional status.";
      setErr(m);
      onNotify(m, "error");
      return;
    }
    if (!profilePhoto) {
      const m = "Profile photo is required.";
      setErr(m);
      onNotify(m, "error");
      return;
    }
    const payload: AccountProfileUpdatePayload = {
      name: name.trim(),
      nameBn: nameBn.trim() || null,
      phone: phone.trim(),
      academicStatus: academicStatus as AccountProfileUpdatePayload["academicStatus"],
      universityName: universityName.trim(),
      department: department.trim(),
      degree: degree as AccountProfileUpdatePayload["degree"],
      sessionIntake: sessionIntake.trim(),
      cityKorea: cityKorea.trim(),
      profilePhoto,
      studentIdImage: studentIdImage?.trim() || null,
      reasonToJoin: reasonToJoin.trim() || null,
    };

    try {
      setPending(true);
      await updateAccountProfile(payload);
      onNotify("Profile saved.", "success");
      router.refresh();
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not update profile.";
      setErr(msg);
      onNotify(msg, "error");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="form-stack max-w-3xl">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Account</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <Label htmlFor="ap-email">Email</Label>
            <Input id="ap-email" value={readOnlyEmail} readOnly className="bg-muted" />
          </div>
          <div className="form-field">
            <Label>Account created</Label>
            <Input value={formatUserDate(userCreatedAt)} readOnly className="bg-muted" />
          </div>
          <div className="form-field">
            <Label>Member code</Label>
            <Input
              value={memberCode ?? "— (assigned on first save if missing)"}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
        {isEmailVerified ? (
          <p className="mt-2 text-xs text-muted-foreground">Email verified.</p>
        ) : (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            Your email is not verified yet; some actions may be limited.
          </p>
        )}
      </div>

      <div className="form-field">
        <Label htmlFor="ap-name">
          Full name (English)
          <RequiredMark />
        </Label>
        <Input
          id="ap-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoComplete="name"
          required
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-name-bn">Full name (Bangla)</Label>
        <Input
          id="ap-name-bn"
          value={nameBn}
          onChange={(e) => setNameBn(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-phone">
          Phone
          <RequiredMark />
        </Label>
        <Input
          id="ap-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <Label htmlFor="ap-academic-status">
          Status
          <RequiredMark />
        </Label>
        <select
          id="ap-academic-status"
          value={academicStatus}
          onChange={(e) => setAcademicStatus(e.target.value as AcademicStatus | "")}
          required
        >
          <option value="">Select status</option>
          <option value="student">Student</option>
          <option value="graduate">Graduate</option>
          <option value="professional">Professional</option>
        </select>
      </div>
      <div className="form-field">
        <Label htmlFor="ap-university">
          University (Korea)
          <RequiredMark />
        </Label>
        <Input
          id="ap-university"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-department">
          Department / major
          <RequiredMark />
        </Label>
        <Input
          id="ap-department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-degree">
          Degree
          <RequiredMark />
        </Label>
        <select
          id="ap-degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value as AcademicDegree | "")}
          required
        >
          <option value="">Select degree</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
        </select>
      </div>
      <div className="form-field">
        <Label htmlFor="ap-session">
          Session / Intake
          <RequiredMark />
        </Label>
        <Input
          id="ap-session"
          placeholder="e.g. 2024 Spring"
          value={sessionIntake}
          onChange={(e) => setSessionIntake(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-city">
          City (Korea)
          <RequiredMark />
        </Label>
        <Input
          id="ap-city"
          value={cityKorea}
          onChange={(e) => setCityKorea(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <Label>
          Profile photo
          <RequiredMark />
        </Label>
        <ImageUploader
          value={profilePhoto}
          onChange={setProfilePhoto}
          maxSizeMb={5}
          helperText="Required. Same as registration — a clear face photo is recommended."
        />
      </div>
      <div className="form-field">
        <Label>Student ID image (optional)</Label>
        <ImageUploader
          value={studentIdImage}
          onChange={setStudentIdImage}
          maxSizeMb={5}
          helperText="Optional verification document."
        />
      </div>
      <div className="form-field">
        <Label htmlFor="ap-reason">Reason to join (optional)</Label>
        <Textarea
          id="ap-reason"
          className="min-h-[100px]"
          value={reasonToJoin}
          onChange={(e) => setReasonToJoin(e.target.value)}
          maxLength={8000}
        />
      </div>

      {err ? (
        <p className="text-sm text-destructive" role="alert">
          {err}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={pending || loading}>
          Reset from server
        </Button>
      </div>
    </form>
  );
}
