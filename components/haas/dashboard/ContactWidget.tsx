import { Headset, Mail, Phone } from "lucide-react";

/**
 * Server Component for the account manager contact widget.
 * Provides direct support links for the user.
 */
export function ContactWidget() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 flex flex-col w-full max-w-sm h-full">
            {/* Header Block */}
            <div className="flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mx-auto mb-3 text-cyan-600 dark:text-cyan-400">
                    <Headset className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Precisa de ajuda?
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Fale com o seu Gestor de Conta
                </p>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    RS
                </div>
                <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        Rui Silva
                    </span>
                    <span className="text-xs text-slate-500">
                        Gestor IoT
                    </span>
                </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-col gap-2 mt-auto">
                <a
                    href="mailto:rui.silva@photoup.pt"
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 group"
                >
                    <Mail size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span>rui.silva@photoup.pt</span>
                </a>
                <a
                    href="tel:+351912345678"
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 group"
                >
                    <Phone size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span>+351 912 345 678</span>
                </a>
            </div>
        </div>
    );
}
