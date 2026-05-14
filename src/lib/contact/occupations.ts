export const CONTACT_OCCUPATION_VALUES = ["student", "job_holder", "eps"] as const;

export type ContactOccupationValue = (typeof CONTACT_OCCUPATION_VALUES)[number];
