import { getCurrentUserForms } from "@/app/actions/forms-actions";
import { FormsTable } from "@/components/form-table/forms-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function FormsPage() {
  const result = await getCurrentUserForms();
  const forms = result?.data || [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all your feedback forms
          </p>
        </div>
        <Link href="/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Button>
        </Link>
      </div>

      <FormsTable forms={forms} />
    </div>
  );
}
