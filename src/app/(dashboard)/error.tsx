"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="max-w-lg border-destructive/30 shadow-md">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          {error.message ||
            "An unexpected error occurred in the dashboard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Digest: {error.digest}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </CardFooter>
    </Card>
  );
}
