"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/matches");
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF4458] border-t-transparent"></div>
    </div>
  );
}
