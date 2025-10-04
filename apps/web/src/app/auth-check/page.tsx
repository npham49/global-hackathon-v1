import { completeAuthCheck } from "../actions/user-actions";

export default async function AuthCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/forms";

  await completeAuthCheck(redirectTo);
}
