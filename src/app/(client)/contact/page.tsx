import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "./components/contact-form";
import { ContactHero } from "./components/contact-hero";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ContactHero />
      <Card className="shadow-md ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>Message</CardTitle>
          <CardDescription>
            Demo form — connect a server action or API route in production.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
