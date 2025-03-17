"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // Redirect to AI page
  useEffect(() => {
    router.push("/ai");
  }, [router]);

  return null;
}
