import { getFormByToken } from "@/data-access/forms";
import SubmitFormClient from "@/components/submission/submit-form-client";

export const revalidate = 0;

export default async function SubmitFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  // If no token in URL, show token input modal
  if (!token) {
    return <SubmitFormClient formId={id} token={null} form={null} />;
  }

  // Validate token server-side
  const form = await getFormByToken(id, token);

  if (!form || !form.schema) {
    return <SubmitFormClient formId={id} token={token} form={null} />;
  }

  return (
    <SubmitFormClient
      formId={id}
      token={token}
      form={form as { id: string; title: string; description: string; schema: unknown }}
    />
  );
}
