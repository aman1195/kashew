"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  User,
  Building,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Globe,
  Loader2,
} from "lucide-react";
import { getProfile, updateProfile, updateCompany, updatePassword, updateNotificationPreferences } from "@/lib/queries";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  billing_address: string;
  tax_number: string;
  notification_preferences: {
    invoice_created: boolean;
    payment_received: boolean;
    invoice_overdue: boolean;
    marketing_emails: boolean;
    browser_notifications: boolean;
  };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      await updateProfile({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      await updateCompany({
        company_name: profile.company_name,
        company_email: profile.company_email,
        company_phone: profile.company_phone,
        billing_address: profile.billing_address,
        tax_number: profile.tax_number,
      });
      toast.success("Company information updated successfully");
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error("Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.notification_preferences) return;

    try {
      setSaving(true);
      await updateNotificationPreferences(profile.notification_preferences);
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error("Failed to update notification preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                <TabsTrigger
                  value="profile"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="company"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Company
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="justify-start px-4 py-2 h-10 rounded-lg data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="md:w-3/4 space-y-6">
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <form onSubmit={handleProfileUpdate}>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile?.full_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile?.phone || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        />
                      </div>
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <form onSubmit={handleCompanyUpdate}>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                      <CardDescription>
                        Update your company details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={profile?.company_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Company Email</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={profile?.company_email || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, company_email: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyPhone">Company Phone</Label>
                        <Input
                          id="companyPhone"
                          type="tel"
                          value={profile?.company_phone || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, company_phone: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Address</Label>
                        <Textarea
                          id="companyAddress"
                          value={profile?.billing_address || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, billing_address: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                        <Input
                          id="taxId"
                          value={profile?.tax_number || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, tax_number: e.target.value } : null)}
                        />
                      </div>
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            Current Plan: Professional
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            $29/month, billed monthly
                          </p>
                        </div>
                        <Button variant="outline" className="rounded-full">
                          Change Plan
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <div className="p-4 border rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">
                              Expires 12/2025
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Billing Address</Label>
                      <div className="p-4 border rounded-lg">
                        <p>{profile?.full_name}</p>
                        <p>{profile?.company_name}</p>
                        <p>{profile?.billing_address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <form onSubmit={handleNotificationUpdate}>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Email Notifications
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="invoice-created">
                                Invoice Created
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive an email when a new invoice is created
                              </p>
                            </div>
                            <Switch
                              id="invoice-created"
                              checked={profile?.notification_preferences?.invoice_created}
                              onCheckedChange={(checked) => setProfile(prev => prev ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  invoice_created: checked
                                }
                              } : null)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="payment-received">
                                Payment Received
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive an email when a payment is received
                              </p>
                            </div>
                            <Switch
                              id="payment-received"
                              checked={profile?.notification_preferences?.payment_received}
                              onCheckedChange={(checked) => setProfile(prev => prev ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  payment_received: checked
                                }
                              } : null)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="invoice-overdue">
                                Invoice Overdue
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive an email when an invoice becomes overdue
                              </p>
                            </div>
                            <Switch
                              id="invoice-overdue"
                              checked={profile?.notification_preferences?.invoice_overdue}
                              onCheckedChange={(checked) => setProfile(prev => prev ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  invoice_overdue: checked
                                }
                              } : null)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="marketing-emails">
                                Marketing Emails
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive emails about new features and offers
                              </p>
                            </div>
                            <Switch
                              id="marketing-emails"
                              checked={profile?.notification_preferences?.marketing_emails}
                              onCheckedChange={(checked) => setProfile(prev => prev ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  marketing_emails: checked
                                }
                              } : null)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          System Notifications
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="browser-notifications">
                                Browser Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications in your browser
                              </p>
                            </div>
                            <Switch
                              id="browser-notifications"
                              checked={profile?.notification_preferences?.browser_notifications}
                              onCheckedChange={(checked) => setProfile(prev => prev ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  browser_notifications: checked
                                }
                              } : null)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Preferences'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <form onSubmit={handlePasswordUpdate}>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">
                              Current Password
                            </Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                          <Button
                            type="submit"
                            className="mt-2 rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6 mt-0">
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how Kashew looks for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme</h3>
                      <div className="flex items-center gap-4">
                        <Label>Select Theme:</Label>
                        <ThemeSwitcher />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Language</h3>
                      <div className="space-y-2">
                        <Label htmlFor="language">Select Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger
                            id="language"
                            className="w-full md:w-[240px]"
                          >
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
