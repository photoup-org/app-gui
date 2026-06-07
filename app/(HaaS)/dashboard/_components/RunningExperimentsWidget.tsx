import prisma from '@/lib/core/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export async function RunningExperimentsWidget() {
  const runningExperiments = await prisma.experiment.findMany({
    where: {
      status: { in: ['RUNNING', 'PAUSED'] },
    },
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: 4,
  });

  if (runningExperiments.length === 0) {
    return
  }

  console.log(runningExperiments)

  return (
    <div className="mb-8 w-full">
      <h2 className="text-xl font-semibold mb-4 tracking-tight">Experiências em Execução (Quick Access)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {runningExperiments.map((experiment) => (
          <Link
            key={experiment.id}
            href={`/projects/${experiment.projectId}/experiments/${experiment.id}`}
            className="group"
          >
            <Card className="h-full transition-colors hover:border-blue-500/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base truncate pr-2">
                    {experiment.name}
                    <p className="text-sm text-muted-foreground truncate">
                      {experiment.project.name}
                    </p>
                  </CardTitle>
                  <div className={experiment.status === 'RUNNING' ? 'w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0' : 'w-2 h-2 rounded-full bg-yellow-500 shrink-0'} />
                </div>
              </CardHeader>

            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
