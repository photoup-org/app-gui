"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inviteUserAction } from "@/actions/invitations";

interface CopyInviteLinkButtonProps {
  url?: string;
  email?: string;
  role?: string;
  onSuccess?: () => void;
  className?: string;
}

export function CopyInviteLinkButton({ url, email, role, onSuccess, className }: CopyInviteLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = async () => {
    try {
      let finalUrl = url;

      if (!finalUrl) {
        if (!email || !role) {
          toast.error("Dados incompletos para gerar o link.");
          return;
        }

        setIsGenerating(true);
        const formData = new FormData();
        formData.append("email", email);
        formData.append("role", role);

        const result = await inviteUserAction(formData);
        if (result.success) {
          finalUrl = result.invitationUrl;
          if (onSuccess) onSuccess();
        } else {
          toast.error(`Erro ao gerar link: ${result.error}`);
          setIsGenerating(false);
          return;
        }
      }

      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      toast.success(url ? "Link copiado para a área de transferência" : "Link gerado e copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error("Erro ao copiar o link");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      disabled={isGenerating}
      className={className}
      title="Copiar link de convite"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Link className="h-4 w-4" />
      )}
    </Button>
  );
}
