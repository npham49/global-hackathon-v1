"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye, Edit, Copy } from "lucide-react";

type Form = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export function FormsTable({ forms }: { forms: Form[] }) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const copyFormId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (forms.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No forms found. Create your first form to get started.</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">{form.title}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {form.description}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(form.createdAt)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(form.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/forms/${form.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/forms/${form.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyFormId(form.id)}
                  >
                    {copiedId === form.id ? (
                      <Badge variant="secondary" className="h-8 px-2">Copied!</Badge>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
