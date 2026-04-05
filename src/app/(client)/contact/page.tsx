import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { ContactForm } from "./components/contact-form";

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact"
        subtitle="Send us a message — we read every submission and reply when a response is needed."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Card className="shadow-md ring-1 ring-border/60">
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>
              Use the form below. For urgent matters, email us directly from the
              footer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
