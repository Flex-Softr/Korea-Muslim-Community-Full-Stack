import { ContactForm } from "./components/contact-form";
import { ContactHero } from "./components/contact-hero";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ContactHero />
      <ContactForm />
    </div>
  );
}
