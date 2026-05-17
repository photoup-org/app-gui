"use client"

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { HardwareProgress } from "@/lib/data/hardware";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

interface ChartComponentProps {
    gatewaysData: HardwareProgress['gateways'];
    sensorsData: HardwareProgress['sensors'];
}

const ChartComponent = ({ gatewaysData, sensorsData }: ChartComponentProps) => {
    const { total: totalGateways, claimed: claimedGateways } = gatewaysData;
    const totalSensors = sensorsData.reduce((acc, sensor) => acc + sensor.total, 0);
    const claimedSensors = sensorsData.reduce((acc, sensor) => acc + sensor.claimed, 0);

    const gatewaysPct = totalGateways > 0 ? (claimedGateways / totalGateways) * 100 : 0;
    const sensorsPct = totalSensors > 0 ? (claimedSensors / totalSensors) * 100 : 0;

    const totalDone = (claimedGateways + claimedSensors) / (totalGateways + totalSensors) * 100;

    const chartConfig = {
        gateways: {
            label: "Gateways",
            color: "hsl(var(--chart-1))",
        },
        sensores: {
            label: "Sensores",
            color: "hsl(var(--chart-2))",
        }
    } satisfies ChartConfig

    const chartData = [
        {
            device: "sensores",
            progress: sensorsPct,
            fill: "var(--disp-sensores)"
        },
        {
            device: "gateways",
            progress: gatewaysPct,
            fill: "var(--disp-gateway)"
        },
    ]


    return (
        <>
            <ChartContainer
                config={chartConfig}
                className="relative aspect-square min-h-[250px] max-h-[300px] -mt-10 -mx-4"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-3xl font-bold">{Number(totalDone.toFixed(0))}%</span>
                </div>
                <RadialBarChart
                    data={chartData}
                    innerRadius={50}
                    outerRadius={80}
                    barSize={12}
                    startAngle={265} // ADDED: Starts at bottom-left
                    endAngle={-85}   // ADDED: Ends at bottom-right
                >
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="device" formatter={(value, entry, item) => {
                            const device = String(item?.payload?.device).charAt(0).toUpperCase() + String(item?.payload?.device).slice(1);
                            return `${device} (${Number(value).toFixed(0)}%)`
                        }
                        } />}
                    />
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="progress" background cornerRadius={10} />

                </RadialBarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 w-full -mt-5">
                <LegendItem
                    color="bg-disp-sensores"
                    label="Sensores"
                    displayText={`${claimedSensors}/${totalSensors}`}
                />

                <LegendItem
                    color="bg-disp-gateway"
                    label="Gateways"
                    displayText={`${claimedGateways}/${totalGateways}`}
                />

            </div>
        </>
    )
}

const LegendItem = ({ color, label, displayText }: { color: string, label: string, displayText: string }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-sm">{label}</span>
            </div>
            <span className="font-bold text-xl">
                {displayText}
            </span>
        </div>
    )
}

export default ChartComponent