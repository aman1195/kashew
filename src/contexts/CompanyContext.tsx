"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile, updateCompany, createCompany, getCompanyUsers, inviteCompanyUser, removeCompanyUser } from '@/lib/queries';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
}

interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'invited';
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
}

interface CompanyContextType {
  company: Company | null;
  users: CompanyUser[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  updateCompany: (data: Partial<Company>) => Promise<void>;
  inviteUser: (email: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  refresh: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const profile = await getProfile();
      
      if (profile.company_id) {
        // User is part of a company
        const companyData: Company = {
          id: profile.company_id,
          name: profile.company_name || "",
          email: profile.company_email || "",
          phone: profile.company_phone || "",
          address: profile.billing_address || "",
          tax_id: profile.tax_number || "",
          created_at: profile.company_created_at || new Date().toISOString(),
          updated_at: profile.company_updated_at || new Date().toISOString(),
        };
        
        setCompany(companyData);

        // Fetch company users
        const companyUsers = await getCompanyUsers(profile.company_id);
        setUsers(companyUsers);

        // Check if user is admin
        const userRole = companyUsers.find(u => u.user_id === user?.id)?.role;
        setIsAdmin(userRole === 'admin');
      } else {
        // User is not part of a company yet
        setCompany(null);
        setUsers([]);
        setIsAdmin(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const updateCompanyData = async (data: Partial<Company>): Promise<void> => {
    try {
      setError(null);
      
      if (!company) {
        // Create new company
        const newCompany = await createCompany({
          ...data,
          user_id: user!.id,
        });
        setCompany(newCompany);
        setIsAdmin(true);
      } else {
        // Update existing company
        const updatedCompany = await updateCompany(data);
        setCompany(updatedCompany);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const inviteUser = async (email: string) => {
    try {
      setError(null);
      if (!company) throw new Error('No company found');

      const newUser = await inviteCompanyUser(company.id, email);
      setUsers([...users, newUser]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    try {
      setError(null);
      if (!company) throw new Error('No company found');

      await removeCompanyUser(company.id, userId);
      setUsers(users.filter(user => user.user_id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const refresh = () => {
    setLoading(true);
    if (user) {
      fetchCompanyData();
    }
    setLoading(false);
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        users,
        loading,
        error,
        isAdmin,
        updateCompany: updateCompanyData,
        inviteUser,
        removeUser,
        refresh,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 