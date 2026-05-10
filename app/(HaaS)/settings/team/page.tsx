import { getAppSession } from "@/lib/auth/session";
import { getOrgInvitations } from "@/lib/auth/auth0-management";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyInviteLinkButton } from "@/components/haas/settings/CopyInviteLinkButton";
import { Badge } from "@/components/ui/badge";

export default async function TeamSettingsPage() {
  const session = await getAppSession();

  if (!session || !session.user) {
    return <div>Não autorizado.</div>;
  }

  const orgId = session.user.org_id || session.user.org_slug;

  if (!orgId) {
    return <div>ID de organização não encontrado.</div>;
  }

  let invitations = [];
  try {
    invitations = await getOrgInvitations(orgId);
  } catch (error) {
    console.error("Erro ao carregar convites:", error);
    // Continue with empty array or display error
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        Definições de Equipa
      </h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Convites Pendentes
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gerir os membros que ainda não aceitaram o convite para a equipa.
          </p>
        </div>

        {invitations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-slate-400">📥</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Não existem convites pendentes.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Os convites enviados aparecerão aqui até serem aceites.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50">
                <TableHead>Cargo</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invite: any) => {
                const date = new Date(invite.created_at);
                const formattedDate = date.toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                // Map roles back from IDs or use default
                // Depending on the exact response structure, you might need to adjust this
                const roleNames = invite.roles && invite.roles.length > 0
                  ? invite.roles.join(", ")
                  : "Membro";

                return (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {roleNames}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {invite.invitee.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-600 hover:bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2 shrink-0" />
                        Pendente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <CopyInviteLinkButton url={invite.invitation_url} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
