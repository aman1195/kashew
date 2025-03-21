"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Building2, Users, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import dynamic from "next/dynamic";

const ProtectedRoute = dynamic(
  () => import("@/components/layout/ProtectedRoute"),
  { ssr: false },
);

export default function CompanyPage() {
  const { company, users, loading, error, updateCompany, inviteUser, removeUser } = useCompany();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleSaveCompany = async () => {
    try {
      await updateCompany({
        name: company?.name,
        email: company?.email,
        phone: company?.phone,
        address: company?.address,
        tax_id: company?.tax_id,
      });
      toast.success("Company information updated successfully");
    } catch (err) {
      toast.error("Failed to update company information");
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    
    try {
      setIsInviting(true);
      await inviteUser(inviteEmail);
      setInviteEmail("");
      toast.success("User invited successfully");
    } catch (err) {
      toast.error("Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUser(userId);
      toast.success("User removed successfully");
    } catch (err) {
      toast.error("Failed to remove user");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Company">
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Company">
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-red-500">{error}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Company">
        <div className="space-y-6 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-vibrant-yellow p-2">
                <Building2 className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Company Settings</h1>
                <p className="text-muted-foreground">
                  Manage your company information and team members
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="space-y-4">
            <TabsList className="bg-background">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card className="border-none shadow-none">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={company?.name || ""}
                      onChange={(e) => company && updateCompany({ name: e.target.value })}
                      className="bg-background"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={company?.email || ""}
                      onChange={(e) => company && updateCompany({ email: e.target.value })}
                      className="bg-background"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      value={company?.phone || ""}
                      onChange={(e) => company && updateCompany({ phone: e.target.value })}
                      className="bg-background"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Input
                      id="companyAddress"
                      value={company?.address || ""}
                      onChange={(e) => company && updateCompany({ address: e.target.value })}
                      className="bg-background"
                      placeholder="123 Business Ave, Suite 100, City, State ZIP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyTaxId">Tax ID / VAT Number</Label>
                    <Input
                      id="companyTaxId"
                      value={company?.tax_id || ""}
                      onChange={(e) => company && updateCompany({ tax_id: e.target.value })}
                      className="bg-background"
                      placeholder="US123456789"
                    />
                  </div>
                  <Button 
                    className="w-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                    onClick={handleSaveCompany}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between px-0">
                  <CardTitle>Team Members</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">Email Address</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            disabled={isInviting}
                            className="bg-background"
                          />
                        </div>
                        <Button 
                          className="w-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90" 
                          onClick={handleInviteUser}
                          disabled={isInviting || !inviteEmail}
                        >
                          {isInviting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Inviting...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.user?.user_metadata?.full_name || 'N/A'}</TableCell>
                          <TableCell>{user.user?.email || 'N/A'}</TableCell>
                          <TableCell className="capitalize">{user.role}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveUser(user.user_id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 