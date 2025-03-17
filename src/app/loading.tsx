import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-t-2 border-vibrant-yellow animate-spin"></div>
        <div className="absolute inset-[4px] rounded-full border-r-2 border-vibrant-pink animate-spin animate-reverse"></div>
        <div className="absolute inset-[8px] rounded-full border-b-2 border-vibrant-green animate-spin animate-delay-500"></div>
      </div>
    </div>
  );
}
