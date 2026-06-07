import React from "react";
import { notFound } from "next/navigation";
import { getDeviceDetailsAction } from "@/app/(HaaS)/equipment/actions";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalibrationHistoryTab } from "@/app/(HaaS)/inventory/_components/audit/CalibrationHistoryTab";
import { DeviceLiveTelemetry } from "./DeviceLiveTelemetry";
import { DeviceAlertsTable } from "./DeviceAlertsTable";
import { ArrowLeft, Cpu, Activity, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SensorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const response = await getDeviceDetailsAction(id);

    if (!response.success || !response.data) {
        notFound();
    }

    const device = response.data;
    const calibrations = device.calibrations.map((c: any) => ({
        id: c.id,
        calibratedAt: c.calibratedAt,
        performedBy: c.performedBy || c.user?.name || "Unknown Operator",
        pointsApplied: c.pointsApplied,
        newConfig: c.newConfig,
        notes: c.notes
    }));

    return (
        <div className="flex flex-col h-full w-full max-w-7xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Link href="/inventory">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            {device.name || device.product?.name || "Unnamed Sensor"}
                        </h1>
                        <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                            {device.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 pl-11">
                        <span className="flex items-center gap-1.5">
                            <Cpu className="h-4 w-4" />
                            SKU: {device.product?.sku || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Settings2 className="h-4 w-4" />
                            SN: {device.serialNumber}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs section */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 pb-px space-x-6">
                    <TabsTrigger 
                        value="overview" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 font-medium"
                    >
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger 
                        value="audit" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-2 py-3 font-medium flex items-center gap-2"
                    >
                        <Activity className="h-4 w-4" />
                        Auditoria de Calibração
                    </TabsTrigger>
                </TabsList>
                
                <div className="mt-6 flex-1">
                    <TabsContent value="overview" className="m-0 h-full">
                        <div className="flex flex-col gap-6 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Live Telemetry Content */}
                                <div className="col-span-2 border rounded-xl bg-white dark:bg-slate-950 p-6 shadow-sm flex items-center justify-center min-h-[400px]">
                                    <DeviceLiveTelemetry deviceId={device.id} sku={device.product?.sku} />
                                </div>
                                <div className="border rounded-xl bg-slate-50/50 dark:bg-slate-900/20 p-6">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Device Info</h3>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Product Type</p>
                                            <p className="font-medium">{device.product?.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Added to Inventory</p>
                                            <p className="font-medium">{new Date(device.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Device Alerts Table */}
                            <div className="border rounded-xl bg-white dark:bg-slate-950 p-6 shadow-sm">
                                <DeviceAlertsTable alerts={device.alerts || []} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="audit" className="m-0">
                        <div className="border rounded-xl bg-white dark:bg-slate-950 p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Calibration History</h2>
                                <p className="text-sm text-slate-500">GLP-compliant audit log of all calibrations performed on this specific device.</p>
                            </div>
                            <CalibrationHistoryTab records={calibrations} />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
