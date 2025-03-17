import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  CreditCard,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  // Function to generate initials from email or name
  const getInitials = () => {
    if (!user) return '??'
    
    // Try to get initials from email if no name
    const email = user.email || ''
    if (!user.user_metadata?.full_name) {
      return email.substring(0, 2).toUpperCase()
    }

    // Get initials from full name
    return user.user_metadata.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
  }

  // Function to get display name
  const getDisplayName = () => {
    if (!user) return 'User'
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  }

  const navItems = [
    {
      title: "AI Assistant",
      href: "/ai",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Products & Services",
      href: "/products",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full w-[280px] flex-col bg-vibrant-black text-white",
        className,
      )}
    >
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-vibrant-yellow p-1">
            <CreditCard className="h-6 w-6 text-black" />
          </div>
          <span className="font-bold text-xl text-white">Kashew</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2 h-10",
                    isActive
                      ? "bg-vibrant-yellow text-black font-medium"
                      : "text-white/80 font-normal hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Separator className="my-4 bg-white/20" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10"
                onClick={signOut}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-md bg-white/10">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-vibrant-pink flex items-center justify-center">
              <span className="text-sm font-medium text-black">
                {loading ? '??' : getInitials()}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-vibrant-black"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {loading ? 'Loading...' : getDisplayName()}
            </span>
            <span className="text-xs text-white/60">
              {loading ? '...' : user?.email || 'No email'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
