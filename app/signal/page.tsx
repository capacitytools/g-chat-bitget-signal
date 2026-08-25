import { Suspense } from "react";
import { SignalPageContent } from "@/components/signals/SignalPageContent";
import { Loader2 } from "lucide-react";

export default function SignalPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading signal...</p>
          </div>
        </div>
      }
    >
      <SignalPageContent />
    </Suspense>
  );
}