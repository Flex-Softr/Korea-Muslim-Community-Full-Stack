import {
  isValidBdDistrict,
  isValidBdDivision,
} from "@/data/bangladesh-divisions-districts";

export type MemberBdFilterParams = {
  division: string | null;
  district: string | null;
};

/**
 * Validates `division` / `district` query params against known BD admin lists.
 */
export function parseMemberBdFilters(
  division: string | string[] | null | undefined,
  district: string | string[] | null | undefined,
): MemberBdFilterParams {
  const divRaw = Array.isArray(division) ? division[0] : division;
  const distRaw = Array.isArray(district) ? district[0] : district;
  const divTrim = divRaw?.trim() || null;
  const distTrim = distRaw?.trim() || null;

  if (!isValidBdDivision(divTrim)) {
    return { division: null, district: null };
  }
  if (distTrim && !isValidBdDistrict(divTrim, distTrim)) {
    return { division: divTrim, district: null };
  }
  return { division: divTrim, district: distTrim };
}
