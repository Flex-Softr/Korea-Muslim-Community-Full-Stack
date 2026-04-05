"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
    >
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className="w-full rounded-lg border border-zinc-300 bg-background px-3 py-2 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 dark:border-zinc-600"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        {sent ? "Thanks — demo only" : "Send"}
      </Button>
      {sent ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Wire this form to your API or server action in a real project.
        </p>
      ) : null}
    </form>
  );
}
