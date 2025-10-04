"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TokenInputModal({ formId }: { formId: string }) {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");

  const handleSubmit = () => {
    if (tokenInput.trim()) {
      router.push(`/submit/${formId}?token=${tokenInput.trim()}`);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Access Token</DialogTitle>
          <DialogDescription>
            Please enter your access token to view and submit this form.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Enter token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!tokenInput.trim()}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
