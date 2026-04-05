import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function HomeHero() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="secondary" className="mb-4">
        Next.js starter
      </Badge>
      <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        Build faster with a modern full-stack foundation
      </h1>
      <Separator className="mx-auto my-6 max-w-xs opacity-40" />
      <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
        Client layout for marketing and public pages. Dashboard with sidebar and
        header. Auth and Prisma included — swap pieces as your product grows.
      </p>
    </div>
  );
}
