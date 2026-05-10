"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Link as LinkIcon, Loader2 } from "lucide-react";
import { BrandIconLogo } from "@/components/resources/logos";
import { toast } from "sonner";
import { inviteUserAction } from "@/actions/invitations";

interface InviteItem {
    id: string;
    email: string;
    role: string;
    url?: string;
}

export function InviteTeamDialog({ children, className }: { children: React.ReactNode, className?: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState("");
    const [invites, setInvites] = useState<InviteItem[]>([]);
    const [copyingId, setCopyingId] = useState<string | null>(null);

    const addInvite = () => {
        if (email && email.includes("@")) {
            setInvites([...invites, { id: Date.now().toString(), email, role: "user" }]);
            setEmail("");
        }
    };

    const removeInvite = (id: string) => {
        setInvites(invites.filter((item) => item.id !== id));
    };

    const updateInviteRole = (id: string, role: string) => {
        setInvites(invites.map((item) => item.id === id ? { ...item, role } : item));
    };

    const handleSendInvites = () => {
        if (invites.length === 0) {
            toast.error("Adicione pelo menos um e-mail.");
            return;
        }

        startTransition(async () => {
            let hasError = false;
            for (const invite of invites) {
                const formData = new FormData();
                formData.append("email", invite.email);
                formData.append("role", invite.role);

                const result = await inviteUserAction(formData);
                if (!result.success) {
                    toast.error(`Erro ao convidar ${invite.email}: ${result.error}`);
                    hasError = true;
                }
            }

            if (!hasError) {
                toast.success("Convites enviados com sucesso!");
                setInvites([]);
                setOpen(false);
            }
        });
    };

    const handleCopySingleLink = async (id: string, targetEmail: string, targetRole: string, existingUrl?: string) => {
        // 1. If we already generated it, copy instantly without hitting the server
        if (existingUrl) {
            await navigator.clipboard.writeText(existingUrl);
            toast.success(`Link copiado para ${targetEmail}!`);
            return;
        }

        // 2. Otherwise, generate it silently
        setCopyingId(id);
        try {
            const formData = new FormData();
            formData.append("email", targetEmail);
            formData.append("role", targetRole);
            formData.append("sendEmail", "false"); // Silent generation!

            const result = await inviteUserAction(formData);

            if (result.success) {
                await navigator.clipboard.writeText(result.invitationUrl);
                toast.success(`Link gerado e copiado para ${targetEmail}!`);

                // Save the URL to the state so next click is instant
                setInvites(invites.map(inv =>
                    inv.id === id ? { ...inv, url: result.invitationUrl } : inv
                ));
            } else {
                toast.error(`Erro ao gerar link: ${result.error}`);
            }
        } catch (err) {
            toast.error("Erro ao copiar o link para a área de transferência.");
        } finally {
            setCopyingId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className={className}>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-6">
                        <BrandIconLogo width={40} />
                    </div>

                    <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                        Forme a sua equipa
                    </DialogTitle>
                    <p className="text-slate-500 text-sm mb-8 max-w-[320px]">
                        Convide os membros da sua equipa e atribua diferentes funções ao seu cargo
                    </p>

                    <div className="w-full flex gap-2 mb-8">
                        <div className="relative flex-1">
                            <Input
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isPending}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pr-10"
                            />
                            {email && !isPending && (
                                <button
                                    onClick={() => setEmail("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={addInvite}
                            disabled={isPending}
                            className="h-11 bg-primary hover:bg-primary/80 text-white font-semibold px-6 rounded-xl"
                        >
                            Adicionar
                        </Button>
                    </div>

                    <div className="w-full space-y-4 text-left">
                        <p className="text-sm font-bold text-slate-900 mb-4">A enviar convite</p>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                            {invites.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm">
                                            {invite.email[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{invite.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue={invite.role.toLowerCase()}
                                            disabled={isPending}
                                            onValueChange={(val) => updateInviteRole(invite.id, val)}
                                        >
                                            <SelectTrigger className="h-9 border-none bg-transparent hover:bg-slate-50 text-slate-900 font-medium w-[120px] focus:ring-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="user">Utilizador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <button
                                            type="button"
                                            onClick={() => handleCopySingleLink(invite.id, invite.email, invite.role, invite.url)}
                                            disabled={isPending || copyingId === invite.id}
                                            className="text-slate-300 hover:text-cyan-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            title="Gerar e Copiar Link"
                                        >
                                            {copyingId === invite.id ? (
                                                <Loader2 size={16} className="animate-spin text-cyan-600" />
                                            ) : invite.url ? (
                                                <LinkIcon size={16} className="text-cyan-600" /> // Highlighted state indicating it's ready
                                            ) : (
                                                <LinkIcon size={16} /> // Default state
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeInvite(invite.id)}
                                            disabled={isPending}
                                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-end items-center border-t border-slate-100 space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                        className="h-11 rounded-xl border-slate-200 text-slate-600 font-semibold px-5"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSendInvites}
                        disabled={isPending || invites.length === 0}
                        className="h-11 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl px-8 transition-colors"
                    >
                        {isPending ? "A enviar..." : "Enviar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
