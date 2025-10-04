"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { refreshFormTokenAction } from "@/app/actions/forms-actions";
import { useRouter } from "next/navigation";

export default function TokenRefreshButton({ formId }: { formId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshFormTokenAction({ formId });
      router.refresh();
    });
  };

  return (
    <Button onClick={handleRefresh} disabled={isPending}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Refreshing..." : "Refresh Token"}
    </Button>
  );
}
