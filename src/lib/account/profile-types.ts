import type { ApiAcademicStatus } from "./profile-mappers";

export type AccountMemberPayload = {
  memberCode: string | null;
  nameBn: string | null;
  phone: string | null;
  academicStatus: ApiAcademicStatus | "";
  universityName: string | null;
  department: string | null;
  degree: "Bachelor" | "Masters" | "PhD" | "";
  sessionIntake: string;
  cityKorea: string | null;
  profilePhoto: string | null;
  studentIdImage: string | null;
  reasonToJoin: string | null;
};

export type AccountProfileResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: string | null;
    createdAt: string;
  };
  member: AccountMemberPayload | null;
};

export type AccountProfileUpdatePayload = {
  name: string;
  nameBn?: string | null;
  phone: string;
  academicStatus: ApiAcademicStatus;
  universityName: string;
  department: string;
  degree: "Bachelor" | "Masters" | "PhD";
  sessionIntake: string;
  cityKorea: string;
  profilePhoto: string | null;
  studentIdImage?: string | null;
  reasonToJoin?: string | null;
};
