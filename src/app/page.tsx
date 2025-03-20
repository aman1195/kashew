"use client";

import React from "react";
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to{' '}
            <span className="text-vibrant-yellow">Kashew</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one solution for managing payments, subscriptions, and financial tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90">
                Get Started
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
            <p className="text-muted-foreground">
              Process payments seamlessly with our intuitive interface and secure payment gateway.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Subscription Management</h3>
            <p className="text-muted-foreground">
              Handle recurring payments and subscriptions with automated billing and notifications.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Financial Tracking</h3>
            <p className="text-muted-foreground">
              Keep track of your finances with detailed analytics and reporting tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
