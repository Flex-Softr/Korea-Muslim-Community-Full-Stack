"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { Textarea } from "@/components/ui/textarea";
import { useToastSystem } from "@/components/ui/toast-system";
import {
  createDashboardMember,
  deleteDashboardMember,
  fetchDashboardMemberById,
  fetchDashboardMembers,
  patchDashboardMember,
} from "@/lib/services/dashboard-members";

type MemberCategory = "EXECUTIVE" | "ADVISOR_BODY" | "GENERAL";
type ProfileVisibility = "PUBLIC" | "MEMBERS_ONLY";

type MemberRow = {
  id: string;
  memberCode: string | null;
  name: string;
  designation: string | null;
  title: string | null;
  category: MemberCategory;
  profileVisibility: ProfileVisibility;
  contactEmail: string | null;
  sortOrder: number;
  createdAt: string;
};

type MemberDetail = {
  id: string;
  memberCode: string | null;
  name: string;
  designation: string | null;
  nameBn: string | null;
  title: string | null;
  category: MemberCategory;
  profileVisibility: ProfileVisibility;
  contactEmail: string | null;
  sortOrder: number;
  aboutSummary: string | null;
  bio: string | null;
  imageUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  dateOfBirthYearOnly: boolean;
  universityKr: string | null;
  degree: string | null;
  major: string | null;
  studyStatus: string | null;
  yearAdmission: number | null;
  graduationYear: number | null;
  locationCity: string | null;
  homeDivisionBd: string | null;
  homeDistrictBd: string | null;
  occupationType: string | null;
  companyName: string | null;
  jobTitle: string | null;
  phone: string | null;
  whatsApp: string | null;
  kakaoId: string | null;
  linkedInUrl: string | null;
  facebookUrl: string | null;
  yearArrivalKorea: number | null;
  visaType: string | null;
  scholarshipInfo: string | null;
  educationBangladesh: string | null;
  skillsTechnical: string | null;
  koreanLevelTopik: string | null;
  certifications: string | null;
  awards: string | null;
  publications: string | null;
  researchPapers: string | null;
  scholarshipsHonors: string | null;
  activityNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type MembersResponse = {
  items: MemberRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;
const CATEGORY_OPTIONS: MemberCategory[] = ["EXECUTIVE", "ADVISOR_BODY", "GENERAL"];
const VISIBILITY_OPTIONS: ProfileVisibility[] = ["PUBLIC", "MEMBERS_ONLY"];

type BasicMemberForm = {
  name: string;
  designation: string;
  memberCode: string;
  title: string;
  category: MemberCategory;
  profileVisibility: ProfileVisibility;
  contactEmail: string;
  sortOrder: string;
};

type CreateMemberForm = BasicMemberForm & {
  nameBn: string;
  aboutSummary: string;
  bio: string;
  imageUrl: string;
  gender: string;
  dateOfBirth: string;
  dateOfBirthYearOnly: boolean;
  universityKr: string;
  degree: string;
  major: string;
  studyStatus: string;
  yearAdmission: string;
  graduationYear: string;
  locationCity: string;
  homeDivisionBd: string;
  homeDistrictBd: string;
  occupationType: string;
  companyName: string;
  jobTitle: string;
  phone: string;
  whatsApp: string;
  kakaoId: string;
  linkedInUrl: string;
  facebookUrl: string;
  yearArrivalKorea: string;
  visaType: string;
  scholarshipInfo: string;
  educationBangladesh: string;
  skillsTechnical: string;
  koreanLevelTopik: string;
  certifications: string;
  awards: string;
  publications: string;
  researchPapers: string;
  scholarshipsHonors: string;
  activityNotes: string;
};

type FullMemberForm = CreateMemberForm;

const EMPTY_FORM: BasicMemberForm = {
  name: "",
  designation: "",
  memberCode: "",
  title: "",
  category: "GENERAL",
  profileVisibility: "PUBLIC",
  contactEmail: "",
  sortOrder: "0",
};

const EMPTY_CREATE_FORM: CreateMemberForm = {
  ...EMPTY_FORM,
  nameBn: "",
  aboutSummary: "",
  bio: "",
  imageUrl: "",
  gender: "",
  dateOfBirth: "",
  dateOfBirthYearOnly: false,
  universityKr: "",
  degree: "",
  major: "",
  studyStatus: "",
  yearAdmission: "",
  graduationYear: "",
  locationCity: "",
  homeDivisionBd: "",
  homeDistrictBd: "",
  occupationType: "",
  companyName: "",
  jobTitle: "",
  phone: "",
  whatsApp: "",
  kakaoId: "",
  linkedInUrl: "",
  facebookUrl: "",
  yearArrivalKorea: "",
  visaType: "",
  scholarshipInfo: "",
  educationBangladesh: "",
  skillsTechnical: "",
  koreanLevelTopik: "",
  certifications: "",
  awards: "",
  publications: "",
  researchPapers: "",
  scholarshipsHonors: "",
  activityNotes: "",
};

function nullableToInput(value: string | number | null | undefined): string {
  return value == null ? "" : String(value);
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0] ?? "";
}

function detailToForm(detail: MemberDetail): FullMemberForm {
  return {
    name: detail.name,
    designation: nullableToInput(detail.designation),
    memberCode: nullableToInput(detail.memberCode),
    title: nullableToInput(detail.title),
    category: detail.category,
    profileVisibility: detail.profileVisibility,
    contactEmail: nullableToInput(detail.contactEmail),
    sortOrder: String(detail.sortOrder),
    nameBn: nullableToInput(detail.nameBn),
    aboutSummary: nullableToInput(detail.aboutSummary),
    bio: nullableToInput(detail.bio),
    imageUrl: nullableToInput(detail.imageUrl),
    gender: nullableToInput(detail.gender),
    dateOfBirth: toDateInputValue(detail.dateOfBirth),
    dateOfBirthYearOnly: detail.dateOfBirthYearOnly,
    universityKr: nullableToInput(detail.universityKr),
    degree: nullableToInput(detail.degree),
    major: nullableToInput(detail.major),
    studyStatus: nullableToInput(detail.studyStatus),
    yearAdmission: nullableToInput(detail.yearAdmission),
    graduationYear: nullableToInput(detail.graduationYear),
    locationCity: nullableToInput(detail.locationCity),
    homeDivisionBd: nullableToInput(detail.homeDivisionBd),
    homeDistrictBd: nullableToInput(detail.homeDistrictBd),
    occupationType: nullableToInput(detail.occupationType),
    companyName: nullableToInput(detail.companyName),
    jobTitle: nullableToInput(detail.jobTitle),
    phone: nullableToInput(detail.phone),
    whatsApp: nullableToInput(detail.whatsApp),
    kakaoId: nullableToInput(detail.kakaoId),
    linkedInUrl: nullableToInput(detail.linkedInUrl),
    facebookUrl: nullableToInput(detail.facebookUrl),
    yearArrivalKorea: nullableToInput(detail.yearArrivalKorea),
    visaType: nullableToInput(detail.visaType),
    scholarshipInfo: nullableToInput(detail.scholarshipInfo),
    educationBangladesh: nullableToInput(detail.educationBangladesh),
    skillsTechnical: nullableToInput(detail.skillsTechnical),
    koreanLevelTopik: nullableToInput(detail.koreanLevelTopik),
    certifications: nullableToInput(detail.certifications),
    awards: nullableToInput(detail.awards),
    publications: nullableToInput(detail.publications),
    researchPapers: nullableToInput(detail.researchPapers),
    scholarshipsHonors: nullableToInput(detail.scholarshipsHonors),
    activityNotes: nullableToInput(detail.activityNotes),
  };
}

function categoryLabel(value: MemberCategory): string {
  if (value === "ADVISOR_BODY") return "Advisor Body";
  if (value === "EXECUTIVE") return "Executive Member";
  return "General Member";
}

function visibilityLabel(value: ProfileVisibility): string {
  return value === "PUBLIC" ? "Public" : "Members Only";
}

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function DetailImage({ label, src }: { label: string; src: string | null | undefined }) {
  return (
    <div className="space-y-1 md:col-span-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {src ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border">
          <Image src={src} alt="Member profile" fill className="object-cover" />
        </div>
      ) : (
        <p className="text-sm text-foreground">N/A</p>
      )}
    </div>
  );
}

export function MembersModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null);
  const [editingTarget, setEditingTarget] = useState<MemberRow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMemberForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<FullMemberForm>(EMPTY_CREATE_FORM);
  const [memberDetails, setMemberDetails] = useState<Record<string, MemberDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      if (visibilityFilter) params.set("profileVisibility", visibilityFilter);

      const res = await fetchDashboardMembers(params);
      const data = (await res.json()) as MembersResponse;
      if (!res.ok) throw new Error("Failed");
      setRows(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      notify("Could not load members.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, visibilityFilter, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const applySearch = () => {
    setPage(1);
    void load();
  };

  const resetCreateForm = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setShowCreateForm(false);
  };

  const toPayload = (form: BasicMemberForm) => ({
    name: form.name.trim(),
    designation: form.designation.trim(),
    memberCode: form.memberCode.trim(),
    title: form.title.trim(),
    category: form.category,
    profileVisibility: form.profileVisibility,
    contactEmail: form.contactEmail.trim(),
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
  });

  const toCreatePayload = (form: CreateMemberForm) => ({
    ...toPayload(form),
    nameBn: form.nameBn.trim(),
    aboutSummary: form.aboutSummary.trim(),
    bio: form.bio.trim(),
    imageUrl: form.imageUrl.trim(),
    gender: form.gender.trim(),
    dateOfBirth: form.dateOfBirth || undefined,
    dateOfBirthYearOnly: form.dateOfBirthYearOnly,
    universityKr: form.universityKr.trim(),
    degree: form.degree.trim(),
    major: form.major.trim(),
    studyStatus: form.studyStatus.trim(),
    yearAdmission: form.yearAdmission,
    graduationYear: form.graduationYear,
    locationCity: form.locationCity.trim(),
    homeDivisionBd: form.homeDivisionBd.trim(),
    homeDistrictBd: form.homeDistrictBd.trim(),
    occupationType: form.occupationType.trim(),
    companyName: form.companyName.trim(),
    jobTitle: form.jobTitle.trim(),
    phone: form.phone.trim(),
    whatsApp: form.whatsApp.trim(),
    kakaoId: form.kakaoId.trim(),
    linkedInUrl: form.linkedInUrl.trim(),
    facebookUrl: form.facebookUrl.trim(),
    yearArrivalKorea: form.yearArrivalKorea,
    visaType: form.visaType.trim(),
    scholarshipInfo: form.scholarshipInfo.trim(),
    educationBangladesh: form.educationBangladesh.trim(),
    skillsTechnical: form.skillsTechnical.trim(),
    koreanLevelTopik: form.koreanLevelTopik.trim(),
    certifications: form.certifications.trim(),
    awards: form.awards.trim(),
    publications: form.publications.trim(),
    researchPapers: form.researchPapers.trim(),
    scholarshipsHonors: form.scholarshipsHonors.trim(),
    activityNotes: form.activityNotes.trim(),
  });

  const submitCreate = async () => {
    if (!createForm.name.trim()) {
      notify("Member name is required.", "warning");
      return;
    }
    const res = await createDashboardMember(toCreatePayload(createForm));
    const body = (await res.json()) as { error?: string };
    if (!res.ok) return notify(body.error ?? "Could not create member.", "error");
    notify("Member created successfully.", "success");
    resetCreateForm();
    void load();
  };

  const openEdit = async (row: MemberRow) => {
    setEditingTarget(row);
    setEditForm({
      name: row.name,
      designation: row.designation ?? "",
      memberCode: row.memberCode ?? "",
      title: row.title ?? "",
      category: row.category,
      profileVisibility: row.profileVisibility,
      contactEmail: row.contactEmail ?? "",
      sortOrder: String(row.sortOrder),
      nameBn: "",
      aboutSummary: "",
      bio: "",
      imageUrl: "",
      gender: "",
      dateOfBirth: "",
      dateOfBirthYearOnly: false,
      universityKr: "",
      degree: "",
      major: "",
      studyStatus: "",
      yearAdmission: "",
      graduationYear: "",
      locationCity: "",
      homeDivisionBd: "",
      homeDistrictBd: "",
      occupationType: "",
      companyName: "",
      jobTitle: "",
      phone: "",
      whatsApp: "",
      kakaoId: "",
      linkedInUrl: "",
      facebookUrl: "",
      yearArrivalKorea: "",
      visaType: "",
      scholarshipInfo: "",
      educationBangladesh: "",
      skillsTechnical: "",
      koreanLevelTopik: "",
      certifications: "",
      awards: "",
      publications: "",
      researchPapers: "",
      scholarshipsHonors: "",
      activityNotes: "",
    });
    try {
      const res = await fetchDashboardMemberById(row.id);
      const data = (await res.json()) as MemberDetail | { error?: string };
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Could not load details");
      setEditForm(detailToForm(data as MemberDetail));
    } catch {
      notify("Could not load full member data for editing.", "warning");
    }
  };

  const submitEdit = async () => {
    if (!editingTarget) return;
    if (!editForm.name.trim()) {
      notify("Member name is required.", "warning");
      return;
    }
    const res = await patchDashboardMember(editingTarget.id, toCreatePayload(editForm));
    const body = (await res.json()) as { error?: string };
    if (!res.ok) return notify(body.error ?? "Could not update member.", "error");
    notify("Member updated successfully.", "success");
    setEditingTarget(null);
    void load();
  };

  const assignCategory = async (row: MemberRow, category: MemberCategory) => {
    const res = await patchDashboardMember(row.id, { category });
    if (!res.ok) return notify("Could not update member role.", "error");
    notify("Member role updated.", "success");
    void load();
  };

  const loadMemberDetails = async (memberId: string) => {
    if (memberDetails[memberId] || loadingDetails[memberId]) return;
    setLoadingDetails((prev) => ({ ...prev, [memberId]: true }));
    try {
      const res = await fetchDashboardMemberById(memberId);
      const data = (await res.json()) as MemberDetail | { error?: string };
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setMemberDetails((prev) => ({ ...prev, [memberId]: data as MemberDetail }));
    } catch {
      notify("Could not load full member details.", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const columns: Array<DataTableColumn<MemberRow>> = [
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "designation", header: "Designation", render: (row) => row.designation ?? "N/A" },
    { key: "memberCode", header: "Member Code", render: (row) => row.memberCode ?? "N/A" },
    { key: "email", header: "Email", render: (row) => row.contactEmail ?? "N/A" },
    { key: "category", header: "Role", render: (row) => categoryLabel(row.category) },
    { key: "visibility", header: "Visibility", render: (row) => visibilityLabel(row.profileVisibility) },
    { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <select
            value={row.category}
            onChange={(e) => {
              const nextCategory = e.target.value as MemberCategory;
              if (nextCategory !== row.category) {
                void assignCategory(row, nextCategory);
              }
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            aria-label={`Change role for ${row.name}`}
          >
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {categoryLabel(item)}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => void openEdit(row)} title="Edit member">
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete member"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="Members"
        subtitle="Create and manage community members, member roles, and visibility."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Members" }]}
        action={
          <Button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
            <UserPlus className="mr-2 size-4" />
            {showCreateForm ? "Close Form" : "Create Member"}
          </Button>
        }
      />

      {showCreateForm ? (
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Create new member</h2>
          <p className="mt-2 text-xs text-muted-foreground">Fields marked with * are required.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Member name" required>
              <Input
                placeholder="Enter member name"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>
            <Field label="Member code">
              <Input
                placeholder="Enter member code"
                value={createForm.memberCode}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, memberCode: e.target.value }))}
              />
            </Field>
            <Field label="Designation">
              <Input
                placeholder="Enter designation"
                value={createForm.designation}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, designation: e.target.value }))}
              />
            </Field>
            <Field label="Member title">
              <Input
                placeholder="Enter title"
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field>
            <Field label="Contact email">
              <Input
                placeholder="Enter contact email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </Field>
            <Field label="Member role" required>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value as MemberCategory }))}
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {categoryLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Profile visibility" required>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.profileVisibility}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, profileVisibility: e.target.value as ProfileVisibility }))
                }
              >
                {VISIBILITY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {visibilityLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                placeholder="0"
                value={createForm.sortOrder}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </Field>
            <Field label="Name (Bangla)">
              <Input
                placeholder="Enter Bangla name"
                value={createForm.nameBn}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nameBn: e.target.value }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Profile image</Label>
              <ImageUploader
                value={createForm.imageUrl || null}
                onChange={(next) => setCreateForm((prev) => ({ ...prev, imageUrl: next ?? "" }))}
                maxSizeMb={5}
                helperText="Upload a member profile image."
              />
            </div>
            <Field label="Gender">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.gender}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <Input
                type="date"
                value={createForm.dateOfBirth}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </Field>
            <Field label="Birth date visibility">
              <label className="inline-flex h-10 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={createForm.dateOfBirthYearOnly}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, dateOfBirthYearOnly: e.target.checked }))}
                />
                Show only birth year
              </label>
            </Field>
            <Field label="University in Korea">
              <Input
                placeholder="Enter university name"
                value={createForm.universityKr}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, universityKr: e.target.value }))}
              />
            </Field>
            <Field label="Degree">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.degree}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, degree: e.target.value }))}
              >
                <option value="">Select degree</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Major">
              <Input
                placeholder="Enter major"
                value={createForm.major}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, major: e.target.value }))}
              />
            </Field>
            <Field label="Study status">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createForm.studyStatus}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, studyStatus: e.target.value }))}
              >
                <option value="">Select study status</option>
                <option value="CURRENT_STUDENT">Current student</option>
                <option value="GRADUATED">Graduated</option>
              </select>
            </Field>
            <Field label="Admission year">
              <Input
                type="number"
                placeholder="e.g. 2022"
                value={createForm.yearAdmission}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, yearAdmission: e.target.value }))}
              />
            </Field>
            <Field label="Graduation year">
              <Input
                type="number"
                placeholder="e.g. 2026"
                value={createForm.graduationYear}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, graduationYear: e.target.value }))}
              />
            </Field>
            <Field label="City in Korea">
              <Input
                placeholder="Enter city"
                value={createForm.locationCity}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, locationCity: e.target.value }))}
              />
            </Field>
            <Field label="Home division (Bangladesh)">
              <Input
                placeholder="Enter division"
                value={createForm.homeDivisionBd}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, homeDivisionBd: e.target.value }))}
              />
            </Field>
            <Field label="Home district (Bangladesh)">
              <Input
                placeholder="Enter district"
                value={createForm.homeDistrictBd}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, homeDistrictBd: e.target.value }))}
              />
            </Field>
            <Field label="Occupation type">
              <Input
                placeholder="STUDENT/JOB_HOLDER/BUSINESS_OWNER/OTHER"
                value={createForm.occupationType}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, occupationType: e.target.value }))}
              />
            </Field>
            <Field label="Company name">
              <Input
                placeholder="Enter company name"
                value={createForm.companyName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </Field>
            <Field label="Job title">
              <Input
                placeholder="Enter job title"
                value={createForm.jobTitle}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input
                placeholder="Enter phone number"
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                placeholder="Enter WhatsApp number"
                value={createForm.whatsApp}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, whatsApp: e.target.value }))}
              />
            </Field>
            <Field label="Kakao ID">
              <Input
                placeholder="Enter Kakao ID"
                value={createForm.kakaoId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, kakaoId: e.target.value }))}
              />
            </Field>
            <Field label="LinkedIn URL">
              <Input
                placeholder="Enter LinkedIn URL"
                value={createForm.linkedInUrl}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, linkedInUrl: e.target.value }))}
              />
            </Field>
            <Field label="Facebook URL">
              <Input
                placeholder="Enter Facebook URL"
                value={createForm.facebookUrl}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, facebookUrl: e.target.value }))}
              />
            </Field>
            <Field label="Year arrived in Korea">
              <Input
                type="number"
                placeholder="e.g. 2021"
                value={createForm.yearArrivalKorea}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, yearArrivalKorea: e.target.value }))}
              />
            </Field>
            <Field label="Visa type">
              <Input
                placeholder="Enter visa type"
                value={createForm.visaType}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, visaType: e.target.value }))}
              />
            </Field>
            <Field label="Scholarship info">
              <Input
                placeholder="Enter scholarship details"
                value={createForm.scholarshipInfo}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, scholarshipInfo: e.target.value }))}
              />
            </Field>
            <Field label="Education in Bangladesh">
              <Input
                placeholder="Enter education background"
                value={createForm.educationBangladesh}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, educationBangladesh: e.target.value }))}
              />
            </Field>
            <Field label="Technical skills">
              <Input
                placeholder="Enter technical skills"
                value={createForm.skillsTechnical}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, skillsTechnical: e.target.value }))}
              />
            </Field>
            <Field label="Korean TOPIK level">
              <Input
                placeholder="Enter TOPIK level"
                value={createForm.koreanLevelTopik}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, koreanLevelTopik: e.target.value }))}
              />
            </Field>
            <Field label="Certifications">
              <Input
                placeholder="Enter certifications"
                value={createForm.certifications}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, certifications: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-3 grid gap-3">
            <Field label="About summary">
              <Textarea
                placeholder="Write a short summary"
                value={createForm.aboutSummary}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, aboutSummary: e.target.value }))}
              />
            </Field>
            <Field label="Bio">
              <Textarea
                placeholder="Write detailed bio"
                value={createForm.bio}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </Field>
            <Field label="Awards">
              <Textarea
                placeholder="List awards"
                value={createForm.awards}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, awards: e.target.value }))}
              />
            </Field>
            <Field label="Publications">
              <Textarea
                placeholder="List publications"
                value={createForm.publications}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, publications: e.target.value }))}
              />
            </Field>
            <Field label="Research papers">
              <Textarea
                placeholder="List research papers"
                value={createForm.researchPapers}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, researchPapers: e.target.value }))}
              />
            </Field>
            <Field label="Scholarships and honors">
              <Textarea
                placeholder="List scholarships and honors"
                value={createForm.scholarshipsHonors}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, scholarshipsHonors: e.target.value }))}
              />
            </Field>
            <Field label="Activity notes">
              <Textarea
                placeholder="Write activity notes"
                value={createForm.activityNotes}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, activityNotes: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={() => void submitCreate()}>
              Create Member
            </Button>
            <Button type="button" variant="outline" onClick={resetCreateForm}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, designation, code, email"
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {categoryLabel(item)}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All visibility</option>
            {VISIBILITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {visibilityLabel(item)}
              </option>
            ))}
          </select>
          <Button type="button" onClick={applySearch}>
            Search
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading members..." />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="No members found."
            expandButtonLabel="Toggle member details"
            onExpandedChange={(row, expanded) => {
              if (expanded) {
                void loadMemberDetails(row.id);
              }
            }}
            renderExpandedRow={(row) => (
              loadingDetails[row.id] ? (
                <p className="text-sm text-muted-foreground">Loading full details...</p>
              ) : memberDetails[row.id] ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries({
                    "Member ID": memberDetails[row.id].id,
                    "Member Code": memberDetails[row.id].memberCode,
                    "Name (English)": memberDetails[row.id].name,
                    Designation: memberDetails[row.id].designation,
                    "Name (Bangla)": memberDetails[row.id].nameBn,
                    Title: memberDetails[row.id].title,
                    Email: memberDetails[row.id].contactEmail,
                    Role: categoryLabel(memberDetails[row.id].category),
                    Visibility: visibilityLabel(memberDetails[row.id].profileVisibility),
                    "Sort Order": String(memberDetails[row.id].sortOrder),
                    "About Summary": memberDetails[row.id].aboutSummary,
                    Bio: memberDetails[row.id].bio,
                    Gender: memberDetails[row.id].gender,
                    "Date of Birth": memberDetails[row.id].dateOfBirth
                      ? formatDate(memberDetails[row.id].dateOfBirth!)
                      : null,
                    "Year Only DOB": memberDetails[row.id].dateOfBirthYearOnly ? "Yes" : "No",
                    University: memberDetails[row.id].universityKr,
                    Degree: memberDetails[row.id].degree,
                    Major: memberDetails[row.id].major,
                    "Study Status": memberDetails[row.id].studyStatus,
                    "Admission Year": memberDetails[row.id].yearAdmission?.toString() ?? null,
                    "Graduation Year": memberDetails[row.id].graduationYear?.toString() ?? null,
                    "City (Korea)": memberDetails[row.id].locationCity,
                    "Division (Bangladesh)": memberDetails[row.id].homeDivisionBd,
                    "District (Bangladesh)": memberDetails[row.id].homeDistrictBd,
                    Occupation: memberDetails[row.id].occupationType,
                    Company: memberDetails[row.id].companyName,
                    "Job Title": memberDetails[row.id].jobTitle,
                    Phone: memberDetails[row.id].phone,
                    WhatsApp: memberDetails[row.id].whatsApp,
                    "Kakao ID": memberDetails[row.id].kakaoId,
                    LinkedIn: memberDetails[row.id].linkedInUrl,
                    Facebook: memberDetails[row.id].facebookUrl,
                    "Arrival Year (Korea)": memberDetails[row.id].yearArrivalKorea?.toString() ?? null,
                    "Visa Type": memberDetails[row.id].visaType,
                    Scholarship: memberDetails[row.id].scholarshipInfo,
                    "Education (Bangladesh)": memberDetails[row.id].educationBangladesh,
                    "Technical Skills": memberDetails[row.id].skillsTechnical,
                    "TOPIK Level": memberDetails[row.id].koreanLevelTopik,
                    Certifications: memberDetails[row.id].certifications,
                    Awards: memberDetails[row.id].awards,
                    Publications: memberDetails[row.id].publications,
                    "Research Papers": memberDetails[row.id].researchPapers,
                    "Scholarships & Honors": memberDetails[row.id].scholarshipsHonors,
                    "Activity Notes": memberDetails[row.id].activityNotes,
                    "Created At": formatDate(memberDetails[row.id].createdAt),
                    "Updated At": formatDate(memberDetails[row.id].updatedAt),
                  }).map(([label, value]) => (
                    <DetailItem key={label} label={label} value={value || "N/A"} />
                  ))}
                  <DetailImage label="Profile Image" src={memberDetails[row.id].imageUrl} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No detail data found.</p>
              )
            )}
          />
        )}

        {totalPages > 1 ? (
          <div className="mt-6">
            <ReusablePagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          </div>
        ) : null}
      </div>

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete member?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this member"}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          void (async () => {
            const res = await deleteDashboardMember(deleteTarget.id);
            if (!res.ok) return notify("Could not delete member.", "error");
            setDeleteTarget(null);
            notify("Member deleted.", "success");
            void load();
          })();
        }}
      />

      {editingTarget ? (
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Edit member</h2>
          <p className="mt-2 text-xs text-muted-foreground">Fields marked with * are required.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Member name" required>
              <Input
                placeholder="Enter member name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>
            <Field label="Member code">
              <Input
                placeholder="Enter member code"
                value={editForm.memberCode}
                onChange={(e) => setEditForm((prev) => ({ ...prev, memberCode: e.target.value }))}
              />
            </Field>
            <Field label="Designation">
              <Input
                placeholder="Enter designation"
                value={editForm.designation}
                onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
              />
            </Field>
            <Field label="Member title">
              <Input
                placeholder="Enter title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field>
            <Field label="Contact email">
              <Input
                placeholder="Enter contact email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </Field>
            <Field label="Member role" required>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editForm.category}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value as MemberCategory }))}
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {categoryLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Profile visibility" required>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editForm.profileVisibility}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, profileVisibility: e.target.value as ProfileVisibility }))
                }
              >
                {VISIBILITY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {visibilityLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                placeholder="0"
                value={editForm.sortOrder}
                onChange={(e) => setEditForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </Field>
            <Field label="Name (Bangla)">
              <Input
                placeholder="Enter Bangla name"
                value={editForm.nameBn}
                onChange={(e) => setEditForm((prev) => ({ ...prev, nameBn: e.target.value }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Profile image</Label>
              <ImageUploader
                value={editForm.imageUrl || null}
                onChange={(next) => setEditForm((prev) => ({ ...prev, imageUrl: next ?? "" }))}
                maxSizeMb={5}
                helperText="Upload a member profile image."
              />
            </div>
            <Field label="Gender">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editForm.gender}
                onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <Input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </Field>
            <Field label="Birth date visibility">
              <label className="inline-flex h-10 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.dateOfBirthYearOnly}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirthYearOnly: e.target.checked }))}
                />
                Show only birth year
              </label>
            </Field>
            <Field label="University in Korea">
              <Input
                placeholder="Enter university name"
                value={editForm.universityKr}
                onChange={(e) => setEditForm((prev) => ({ ...prev, universityKr: e.target.value }))}
              />
            </Field>
            <Field label="Degree">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editForm.degree}
                onChange={(e) => setEditForm((prev) => ({ ...prev, degree: e.target.value }))}
              >
                <option value="">Select degree</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Major">
              <Input
                placeholder="Enter major"
                value={editForm.major}
                onChange={(e) => setEditForm((prev) => ({ ...prev, major: e.target.value }))}
              />
            </Field>
            <Field label="Study status">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editForm.studyStatus}
                onChange={(e) => setEditForm((prev) => ({ ...prev, studyStatus: e.target.value }))}
              >
                <option value="">Select study status</option>
                <option value="CURRENT_STUDENT">Current student</option>
                <option value="GRADUATED">Graduated</option>
              </select>
            </Field>
            <Field label="Admission year">
              <Input
                type="number"
                placeholder="e.g. 2022"
                value={editForm.yearAdmission}
                onChange={(e) => setEditForm((prev) => ({ ...prev, yearAdmission: e.target.value }))}
              />
            </Field>
            <Field label="Graduation year">
              <Input
                type="number"
                placeholder="e.g. 2026"
                value={editForm.graduationYear}
                onChange={(e) => setEditForm((prev) => ({ ...prev, graduationYear: e.target.value }))}
              />
            </Field>
            <Field label="City in Korea">
              <Input
                placeholder="Enter city"
                value={editForm.locationCity}
                onChange={(e) => setEditForm((prev) => ({ ...prev, locationCity: e.target.value }))}
              />
            </Field>
            <Field label="Home division (Bangladesh)">
              <Input
                placeholder="Enter division"
                value={editForm.homeDivisionBd}
                onChange={(e) => setEditForm((prev) => ({ ...prev, homeDivisionBd: e.target.value }))}
              />
            </Field>
            <Field label="Home district (Bangladesh)">
              <Input
                placeholder="Enter district"
                value={editForm.homeDistrictBd}
                onChange={(e) => setEditForm((prev) => ({ ...prev, homeDistrictBd: e.target.value }))}
              />
            </Field>
            <Field label="Occupation type">
              <Input
                placeholder="STUDENT/JOB_HOLDER/BUSINESS_OWNER/OTHER"
                value={editForm.occupationType}
                onChange={(e) => setEditForm((prev) => ({ ...prev, occupationType: e.target.value }))}
              />
            </Field>
            <Field label="Company name">
              <Input
                placeholder="Enter company name"
                value={editForm.companyName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </Field>
            <Field label="Job title">
              <Input
                placeholder="Enter job title"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input
                placeholder="Enter phone number"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                placeholder="Enter WhatsApp number"
                value={editForm.whatsApp}
                onChange={(e) => setEditForm((prev) => ({ ...prev, whatsApp: e.target.value }))}
              />
            </Field>
            <Field label="Kakao ID">
              <Input
                placeholder="Enter Kakao ID"
                value={editForm.kakaoId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, kakaoId: e.target.value }))}
              />
            </Field>
            <Field label="LinkedIn URL">
              <Input
                placeholder="Enter LinkedIn URL"
                value={editForm.linkedInUrl}
                onChange={(e) => setEditForm((prev) => ({ ...prev, linkedInUrl: e.target.value }))}
              />
            </Field>
            <Field label="Facebook URL">
              <Input
                placeholder="Enter Facebook URL"
                value={editForm.facebookUrl}
                onChange={(e) => setEditForm((prev) => ({ ...prev, facebookUrl: e.target.value }))}
              />
            </Field>
            <Field label="Year arrived in Korea">
              <Input
                type="number"
                placeholder="e.g. 2021"
                value={editForm.yearArrivalKorea}
                onChange={(e) => setEditForm((prev) => ({ ...prev, yearArrivalKorea: e.target.value }))}
              />
            </Field>
            <Field label="Visa type">
              <Input
                placeholder="Enter visa type"
                value={editForm.visaType}
                onChange={(e) => setEditForm((prev) => ({ ...prev, visaType: e.target.value }))}
              />
            </Field>
            <Field label="Scholarship info">
              <Input
                placeholder="Enter scholarship details"
                value={editForm.scholarshipInfo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, scholarshipInfo: e.target.value }))}
              />
            </Field>
            <Field label="Education in Bangladesh">
              <Input
                placeholder="Enter education background"
                value={editForm.educationBangladesh}
                onChange={(e) => setEditForm((prev) => ({ ...prev, educationBangladesh: e.target.value }))}
              />
            </Field>
            <Field label="Technical skills">
              <Input
                placeholder="Enter technical skills"
                value={editForm.skillsTechnical}
                onChange={(e) => setEditForm((prev) => ({ ...prev, skillsTechnical: e.target.value }))}
              />
            </Field>
            <Field label="Korean TOPIK level">
              <Input
                placeholder="Enter TOPIK level"
                value={editForm.koreanLevelTopik}
                onChange={(e) => setEditForm((prev) => ({ ...prev, koreanLevelTopik: e.target.value }))}
              />
            </Field>
            <Field label="Certifications">
              <Input
                placeholder="Enter certifications"
                value={editForm.certifications}
                onChange={(e) => setEditForm((prev) => ({ ...prev, certifications: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-3 grid gap-3">
            <Field label="About summary">
              <Textarea
                placeholder="Write a short summary"
                value={editForm.aboutSummary}
                onChange={(e) => setEditForm((prev) => ({ ...prev, aboutSummary: e.target.value }))}
              />
            </Field>
            <Field label="Bio">
              <Textarea
                placeholder="Write detailed bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </Field>
            <Field label="Awards">
              <Textarea
                placeholder="List awards"
                value={editForm.awards}
                onChange={(e) => setEditForm((prev) => ({ ...prev, awards: e.target.value }))}
              />
            </Field>
            <Field label="Publications">
              <Textarea
                placeholder="List publications"
                value={editForm.publications}
                onChange={(e) => setEditForm((prev) => ({ ...prev, publications: e.target.value }))}
              />
            </Field>
            <Field label="Research papers">
              <Textarea
                placeholder="List research papers"
                value={editForm.researchPapers}
                onChange={(e) => setEditForm((prev) => ({ ...prev, researchPapers: e.target.value }))}
              />
            </Field>
            <Field label="Scholarships and honors">
              <Textarea
                placeholder="List scholarships and honors"
                value={editForm.scholarshipsHonors}
                onChange={(e) => setEditForm((prev) => ({ ...prev, scholarshipsHonors: e.target.value }))}
              />
            </Field>
            <Field label="Activity notes">
              <Textarea
                placeholder="Write activity notes"
                value={editForm.activityNotes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, activityNotes: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={() => void submitEdit()}>
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditingTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
