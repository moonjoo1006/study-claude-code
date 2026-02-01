"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TimezoneRedirectProps {
  currentDate: string;
}

export function TimezoneRedirect({ currentDate }: TimezoneRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = new URLSearchParams();
    params.set("date", currentDate);
    params.set("tz", userTz);
    router.replace(`/dashboard?${params.toString()}`);
  }, [currentDate, router]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}