"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { refreshFormTokenAction } from "@/app/actions/forms-actions";
import { useRouter } from "next/navigation";

export default function TokenRefreshButton({
  formId,
  hasToken = false
}: {
  formId: string;
  hasToken?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshFormTokenAction({ formId });
      router.refresh();
    });
  };

  const Icon = hasToken ? RefreshCw : Plus;
  const buttonText = hasToken ? "Refresh Token" : "Generate Token";
  const loadingText = hasToken ? "Refreshing..." : "Generating...";

  return (
    <Button onClick={handleRefresh} disabled={isPending}>
      <Icon className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? loadingText : buttonText}
    </Button>
  );
}
