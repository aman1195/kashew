"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (!loading && user) {
      // Only redirect root path to AI page after login
      if (window.location.pathname === "/") {
        router.push("/ai");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-vibrant-yellow animate-spin"></div>
          <div className="absolute inset-[4px] rounded-full border-r-2 border-vibrant-pink animate-spin animate-reverse"></div>
          <div className="absolute inset-[8px] rounded-full border-b-2 border-vibrant-green animate-spin animate-delay-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
