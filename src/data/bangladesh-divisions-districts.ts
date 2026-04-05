/**
 * Bangladesh administrative divisions and districts (English names, for filters).
 * Division keys must match `homeDivisionBd` in the database.
 */

export const BD_DIVISIONS: readonly string[] = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const;

export const BD_DISTRICTS_BY_DIVISION: Record<string, readonly string[]> = {
  Barishal: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokathi",
    "Patuakhali",
    "Pirojpur",
  ],
  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  Rajshahi: [
    "Bogura",
    "Chapai Nawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
};

const divisionSet = new Set(BD_DIVISIONS);

export function isValidBdDivision(value: string | null | undefined): boolean {
  return !!value && divisionSet.has(value);
}

export function districtsForDivision(
  division: string | null | undefined,
): string[] {
  if (!division || !isValidBdDivision(division)) {
    return [];
  }
  const list = BD_DISTRICTS_BY_DIVISION[division];
  return list ? [...list] : [];
}

export function isValidBdDistrict(
  division: string | null | undefined,
  district: string | null | undefined,
): boolean {
  if (!district || !division || !isValidBdDivision(division)) {
    return false;
  }
  const list = BD_DISTRICTS_BY_DIVISION[division];
  return !!list && list.includes(district);
}
