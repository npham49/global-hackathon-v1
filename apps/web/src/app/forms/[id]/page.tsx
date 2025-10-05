import { getFormWithSubmissionsAction } from "@/app/actions/forms-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import TokenRefreshButton from "@/components/form-detail/token-refresh-button";
import CopyTokenButton from "@/components/form-detail/copy-token-button";
import DisableSubmissionsButton from "@/components/form-detail/disable-submissions-button";

export const revalidate = 0;

export default async function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getFormWithSubmissionsAction({ formId: id });

  if (!result?.data || !result.data.form) {
    redirect("/forms");
  }

  const { form, submissions, activeToken, isAdmin } = result.data;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getTimeRemaining = (expiry: Date) => {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    return "Less than 1 hour remaining";
  };

  const isTokenExpired = activeToken ? new Date(activeToken.expiry) <= new Date() : true;
  const surveyLink = activeToken ? `${process.env.NEXT_PUBLIC_APP_URL}/submit/${id}?token=${activeToken.token}` : "";

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{form.title}</h1>
        <p className="text-muted-foreground mt-2">{form.description}</p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Survey Token</CardTitle>
            <CardDescription>Share this link to allow users to submit responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeToken && !isTokenExpired ? (
              <>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono">
                    {surveyLink}
                  </code>
                  <CopyTokenButton link={surveyLink} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {getTimeRemaining(activeToken.expiry)}
                </p>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {activeToken ? "Token has expired" : "No active token"}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <TokenRefreshButton formId={id} hasToken={!!activeToken && !isTokenExpired} />
              <DisableSubmissionsButton formId={id} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>{submissions.length} response{submissions.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Response Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(submission.createdAt)}
                    </TableCell>
                    <TableCell>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-w-2xl">
                        {JSON.stringify(submission.data, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
