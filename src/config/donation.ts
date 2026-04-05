/**
 * Bank details for `/donation`. Edit this file to update displayed information.
 * Later you can load these from the dashboard / database instead.
 */
export type DonationBankDetails = {
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  swift: string | null;
  branch: string | null;
  referenceNote: string | null;
};

export const DONATION_BANK_DETAILS: DonationBankDetails = {
  bankName: "Your Bank Co., Ltd.",
  accountName: "Korea Muslim Community",
  accountNumber: "000-00-0000000",
  branch: null,
  swift: null,
  referenceNote: "KMC donation",
};

export function getDonationBankDetails(): DonationBankDetails {
  return DONATION_BANK_DETAILS;
}
