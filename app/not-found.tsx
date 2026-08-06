import Link from "next/link";
import { CloudOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="padding-x flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 text-center">
      <CloudOff
        aria-hidden="true"
        className="size-8 text-muted-foreground sm:size-10 xl:size-12"
      />

      <div className="space-y-1">
        <h1 className="text-lg font-semibold sm:text-xl xl:text-2xl">
          Page not found
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          That page doesn&apos;t exist.
        </p>
      </div>

      <Button asChild>
        <Link href="/">Back to the forecast</Link>
      </Button>
    </main>
  );
}
