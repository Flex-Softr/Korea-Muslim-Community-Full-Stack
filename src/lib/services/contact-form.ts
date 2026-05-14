import { apiFetch } from "@/lib/api/client";

export type ContactFormPayload = {
  name: string;
  mobileNumber: string;
  occupation: string;
  address: string;
  visaType: string;
  message: string;
};

export async function submitContactForm(body: ContactFormPayload) {
  return apiFetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
