"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, AlertTriangle } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function VerifyEmail() {
  const { user, sendVerificationEmail } = useAuth();
  const [isSending, setIsSending] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const handleSendVerification = async () => {
    if (!user) return;

    setIsSending(true);
    try {
      await sendVerificationEmail();
      setIsSent(true);
    } catch (error) {
      console.error("Error sending verification email:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null;
  if (user.email_confirmed_at) return null;

  return (
    <Card className="w-full max-w-md mx-auto modern-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-vibrant-yellow" />
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
        </div>
        <CardDescription>
          Please verify your email address to access all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="text-sm text-center">
          We've sent a verification email to <strong>{user.email}</strong>.
          Please check your inbox and follow the instructions to verify your
          account.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSendVerification}
          disabled={isSending || isSent}
          className="w-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
        >
          {isSending
            ? "Sending..."
            : isSent
              ? "Email Sent"
              : "Resend Verification Email"}
        </Button>
      </CardFooter>
    </Card>
  );
}
