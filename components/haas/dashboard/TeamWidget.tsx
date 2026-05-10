import { Button } from "@/components/ui/button";
import { InviteTeamDialog } from "./InviteTeamDialog";
import { StarIconsIlustration } from "@/components/resources/ilustrations";

/**
 * TeamWidget displays the "Invite Members" card on the dashboard.
 * It triggers a dialog to manage team invitations.
 */
export function TeamWidget() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center w-full max-w-sm">
            {/* Stars Illustration */}
            <StarIconsIlustration width={100} />

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Convidar Membros
            </h3>
            <p className="text-slate-500 text-xs mb-8 max-w-[150px]">
                Convide membros para a sua equipa
            </p>

            <InviteTeamDialog>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl h-12 px-8 transition-colors">
                    Enviar Convites
                </Button>
            </InviteTeamDialog>
        </div>
    );
}
