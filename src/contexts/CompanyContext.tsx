"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile, updateCompany } from '@/lib/queries';

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        
        // Transform profile data to company format
        const companyData: Company = {
          id: profile.id,
          name: profile.company_name || "",
          email: profile.company_email || "",
          phone: profile.company_phone || "",
          address: profile.billing_address || "",
          tax_id: profile.tax_number || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setCompany(companyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const updateCompanyData = async (data: Partial<Company>): Promise<void> => {
    try {
      setError(null);
      
      // Transform company data to profile format
      const profileData = {
        company_name: data.name,
        company_email: data.email,
        company_phone: data.phone,
        billing_address: data.address,
        tax_number: data.tax_id,
      };
      
      await updateCompany(profileData);
      
      // Update local state
      const updatedCompany = {
        ...company!,
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      setCompany(updatedCompany);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const inviteUser = async (email: string) => {
    try {
      setError(null);
      // TODO: Implement user invitation with Supabase
      const newUser: CompanyUser = {
        id: Math.random().toString(),
        company_id: company!.id,
        user_id: Math.random().toString(),
        role: 'member',
        status: 'invited',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          email,
          user_metadata: {
            full_name: email.split('@')[0],
          },
        },
      };

      setUsers([...users, newUser]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    try {
      setError(null);
      // TODO: Implement user removal with Supabase
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