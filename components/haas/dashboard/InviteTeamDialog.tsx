"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
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
import { X, Link as LinkIcon } from "lucide-react";
import { BrandIconLogo } from "@/components/resources/logos";

interface InviteItem {
    id: string;
    email: string;
    role: string;
}

export function InviteTeamDialog({ children }: { children: React.ReactNode }) {
    const [email, setEmail] = useState("");
    const [invites, setInvites] = useState<InviteItem[]>([]);

    const addInvite = () => {
        if (email && email.includes("@")) {
            setInvites([...invites, { id: Date.now().toString(), email, role: "Operador" }]);
            setEmail("");
        }
    };

    const removeInvite = (id: string) => {
        setInvites(invites.filter((item) => item.id !== id));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
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
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pr-10"
                            />
                            {email && (
                                <button
                                    onClick={() => setEmail("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={addInvite}
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
                                        <Select defaultValue={invite.role.toLowerCase()}>
                                            <SelectTrigger className="h-9 border-none bg-transparent hover:bg-slate-50 text-slate-900 font-medium w-[120px] focus:ring-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="operador">Operador</SelectItem>
                                                <SelectItem value="viewer">Visualizador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <button
                                            onClick={() => removeInvite(invite.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                    <Button variant="outline" className="h-11 gap-2 rounded-xl border-slate-200 text-slate-600 font-semibold px-5">
                        <LinkIcon size={18} />
                        Copiar Link
                    </Button>
                    <Button className="h-11 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl px-8 transition-colors">
                        Enviar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
