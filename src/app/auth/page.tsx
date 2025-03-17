"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import VerifyEmail from "@/components/auth/VerifyEmail";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to AI page if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/ai");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {user && !user.isVerified ? <VerifyEmail /> : !user && <AuthForm />}
      </div>
    </div>
  );
}
