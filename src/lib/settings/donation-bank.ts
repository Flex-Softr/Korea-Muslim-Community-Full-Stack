import { prisma } from "@/lib/prisma";

export type DonationBankDetails = {
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  swift: string | null;
  branch: string | null;
  referenceNote: string | null;
};

export const DONATION_BANK_DEFAULTS: DonationBankDetails = {
  bankName: "Your Bank Co., Ltd.",
  accountName: "Korea Muslim Community",
  accountNumber: "000-00-0000000",
  branch: null,
  swift: null,
  referenceNote: "KMC donation",
};

const DONATION_BANK_SETTING_KEY = "donation_bank_details";

function toNullableString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeDonationBankInput(
  input: Partial<DonationBankDetails>,
): DonationBankDetails {
  return {
    bankName: toNullableString(input.bankName),
    accountName: toNullableString(input.accountName),
    accountNumber: toNullableString(input.accountNumber),
    swift: toNullableString(input.swift),
    branch: toNullableString(input.branch),
    referenceNote: toNullableString(input.referenceNote),
  };
}

function mergeWithDefaults(
  input: Partial<DonationBankDetails> | null | undefined,
): DonationBankDetails {
  return {
    bankName: toNullableString(input?.bankName) ?? DONATION_BANK_DEFAULTS.bankName,
    accountName:
      toNullableString(input?.accountName) ?? DONATION_BANK_DEFAULTS.accountName,
    accountNumber:
      toNullableString(input?.accountNumber) ?? DONATION_BANK_DEFAULTS.accountNumber,
    swift: toNullableString(input?.swift),
    branch: toNullableString(input?.branch),
    referenceNote:
      toNullableString(input?.referenceNote) ?? DONATION_BANK_DEFAULTS.referenceNote,
  };
}

export async function getDonationBankDetails(): Promise<DonationBankDetails> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: DONATION_BANK_SETTING_KEY },
    select: { value: true },
  });
  const raw = setting?.value as Partial<DonationBankDetails> | null | undefined;
  return mergeWithDefaults(raw);
}

export async function updateDonationBankDetails(
  input: Partial<DonationBankDetails>,
): Promise<DonationBankDetails> {
  const sanitized = sanitizeDonationBankInput(input);
  const nextValue = mergeWithDefaults(sanitized);

  await prisma.appSetting.upsert({
    where: { key: DONATION_BANK_SETTING_KEY },
    update: { value: nextValue },
    create: { key: DONATION_BANK_SETTING_KEY, value: nextValue },
  });

  return nextValue;
}
