"use client"

import React, { useMemo } from 'react'
import AlertTable from '@/components/haas/alerts/AlertTable'
import { Badge } from '@/components/ui/badge'
import { useMqttStore } from '@/hooks/useMqttStore'
import { SystemLogWithUser } from '@/app/(HaaS)/logs/actions'

interface ExperimentAlertsProps {
    experimentId: string;
    initialAlerts: SystemLogWithUser[];
}

const ExperimentAlerts = ({ experimentId, initialAlerts }: ExperimentAlertsProps) => {
    const liveAlerts = useMqttStore((state) => state.liveAlerts);
    const liveLogs = useMqttStore((state) => state.liveLogs);

    // Combine live alerts and logs that belong to this experiment with the initial ones from DB
    const allAlerts = useMemo(() => {
        // Filter live alerts and logs for this specific experiment
        const experimentLiveEvents = [...liveAlerts, ...liveLogs].filter(
            (event) => event.experimentId === experimentId && (event.category === 'ALERT' || event.category === 'EXPERIMENT' || event.level === 'ERROR' || event.level === 'CRITICAL')
        );

        return [
            ...experimentLiveEvents,
            ...initialAlerts.filter(
                (initial) => !experimentLiveEvents.some((live) => live.id === initial.id)
            )
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [liveAlerts, liveLogs, initialAlerts, experimentId]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Histórico de Alertas
                </h2>
                {allAlerts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                        {allAlerts.length} {allAlerts.length === 1 ? 'Alerta' : 'Alertas'}
                    </Badge>
                )}
            </div>
            <AlertTable alerts={allAlerts} />
        </div>
    );
};

export default ExperimentAlerts;
