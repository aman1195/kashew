"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProfile, updateCompany } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  billing_address: string;
  tax_number: string;
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

interface CompanyMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
}

interface CompanyContextType {
  company: Company | null;
  members: CompanyMember[];
  loading: boolean;
  error: string | null;
  updateCompany: (data: Partial<Company>) => Promise<void>;
  inviteUser: (email: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  acceptInvitation: (companyId: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchCompanyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch company profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch company members with proper foreign key relationships
      const { data: membersData, error: membersError } = await supabase
        .from('company_memberships')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          updated_at
        `)
        .eq('company_id', user.id);

      if (membersError) throw membersError;

      // Fetch user data for each member
      const membersWithUserData = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, email, user_metadata')
            .eq('id', member.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return null;
          }

          return {
            id: member.id,
            user_id: member.user_id,
            role: member.role as 'owner' | 'admin' | 'member',
            status: member.status as 'pending' | 'active' | 'rejected',
            created_at: member.created_at,
            updated_at: member.updated_at,
            user: {
              id: userData.id,
              email: userData.email,
              user_metadata: {
                full_name: userData.user_metadata?.full_name || ''
              }
            }
          };
        })
      );

      // Filter out any null values from failed user data fetches
      const validMembers = membersWithUserData.filter((member): member is CompanyMember => member !== null);
      setMembers(validMembers);

      setCompany({
        id: profile.id,
        name: profile.company_name || profile.full_name || "",
        email: profile.company_email || profile.email || "",
        phone: profile.company_phone || profile.phone || "",
        address: profile.billing_address || "",
        tax_id: profile.tax_number || "",
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        company_name: profile.company_name || profile.full_name || "",
        company_email: profile.company_email || profile.email || "",
        company_phone: profile.company_phone || profile.phone || "",
        billing_address: profile.billing_address || "",
        tax_number: profile.tax_number || "",
      });
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: Partial<Company>) => {
    if (!user) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: data.name,
          company_email: data.email,
          company_phone: data.phone,
          billing_address: data.address,
          tax_number: data.tax_id,
        })
        .eq('id', user.id);

      if (error) throw error;

      setCompany(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Error updating company:', err);
      setError(err instanceof Error ? err.message : 'Failed to update company');
      throw err;
    }
  };

  const inviteUser = async (email: string) => {
    if (!user) return;

    try {
      setError(null);
      const { error } = await supabase.rpc('handle_user_invitation', {
        p_company_id: user.id,
        p_email: email,
        p_role: 'member'
      });

      if (error) throw error;

      // Refresh company data to show new member
      await fetchCompanyData();
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite user');
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    if (!user) return;

    try {
      setError(null);
      const { error } = await supabase.rpc('remove_company_member', {
        p_company_id: user.id,
        p_user_id: userId
      });

      if (error) throw error;

      // Refresh company data to remove member
      await fetchCompanyData();
    } catch (err) {
      console.error('Error removing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove user');
      throw err;
    }
  };

  const acceptInvitation = async (companyId: string) => {
    if (!user) return;

    try {
      setError(null);
      const { error } = await supabase.rpc('accept_invitation', {
        p_company_id: companyId,
        p_user_id: user.id
      });

      if (error) throw error;

      // Refresh company data to show updated status
      await fetchCompanyData();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  return (
    <CompanyContext.Provider value={{
      company,
      members,
      loading,
      error,
      updateCompany,
      inviteUser,
      removeUser,
      acceptInvitation,
    }}>
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