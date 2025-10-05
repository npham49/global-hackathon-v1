"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { registerDemoUser } from "../actions/demo-registration-actions";

export default function DemoRegistrationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [actaConsent, setActaConsent] = useState(false);
  const [voiceApiConsent, setVoiceApiConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await registerDemoUser({
        email,
        actaConsent,
        voiceApiConsent,
      });

      if (result?.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } else if (result?.serverError) {
        setError(result.serverError);
      } else if (result?.validationErrors) {
        const firstError = Object.values(result.validationErrors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : "Validation error");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Registration Successful!</CardTitle>
            <CardDescription>
              Your demo account has been created. Redirecting you to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Demo Registration</CardTitle>
          <CardDescription>
            Register for demo access to the SurvyAI platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acta"
                  checked={actaConsent}
                  onCheckedChange={(checked) =>
                    setActaConsent(checked as boolean)
                  }
                  disabled={loading}
                  required
                />
                <Label
                  htmlFor="acta"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  I promise to belong to the ACTA organization for judging the
                  hackathon
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="voiceApi"
                  checked={voiceApiConsent}
                  onCheckedChange={(checked) =>
                    setVoiceApiConsent(checked as boolean)
                  }
                  disabled={loading}
                  required
                />
                <Label
                  htmlFor="voiceApi"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  I will not abuse the voice API
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !actaConsent || !voiceApiConsent}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register for Demo"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
