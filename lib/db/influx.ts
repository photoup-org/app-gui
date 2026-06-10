import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { SensorReading } from '@/app/(HaaS)/projects/[projectId]/experiments/_components/DynamicSensorChart'; // type import

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || '';
const INFLUX_ORG = process.env.INFLUX_ORG || '';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || '';

const client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });

export interface TelemetryPoint {
    deviceId: string;
    tenantId: string;
    experimentId?: string;
    timestamp: Date;
    fields: Record<string, number>;
}

export async function writeTelemetry(points: TelemetryPoint[]) {
    const writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ms');
    
    for (const data of points) {
        const point = new Point('telemetry')
            .tag('deviceId', data.deviceId)
            .tag('tenantId', data.tenantId)
            .tag('experimentId', data.experimentId || 'none')
            .timestamp(data.timestamp);

        for (const [key, value] of Object.entries(data.fields)) {
            if (typeof value === 'number') {
                point.floatField(key, value);
            }
        }

        writeApi.writePoint(point);
    }

    await writeApi.close();
}

export async function getExperimentTelemetry(
    deviceId: string,
    experimentId: string,
    startDate: Date | string,
    endDate?: Date | string | null
): Promise<SensorReading[]> {
    const queryApi = client.getQueryApi(INFLUX_ORG);
    
    const startIso = new Date(startDate).toISOString();
    const endIso = endDate ? new Date(endDate).toISOString() : 'now()';

    // Using pivot to structure fields by time, per the architectural blueprint
    const fluxQuery = `
        from(bucket: "${INFLUX_BUCKET}")
            |> range(start: ${startIso}, stop: ${endIso})
            |> filter(fn: (r) => r._measurement == "telemetry")
            |> filter(fn: (r) => r.deviceId == "${deviceId}")
            |> filter(fn: (r) => r.experimentId == "${experimentId}")
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> sort(columns: ["_time"], desc: false)
    `;

    const results: SensorReading[] = [];
    
    return new Promise((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                const timestamp = new Date(o._time);
                
                // Map the pivoted rows back to the SensorReading shape to prevent breaking our frontend components
                Object.keys(o).forEach(key => {
                    const sysKeys = ['table', 'result', '_start', '_stop', '_time', '_measurement', 'deviceId', 'experimentId', 'tenantId'];
                    if (sysKeys.includes(key)) return;
                    
                    if (o[key] !== null && o[key] !== undefined) {
                        results.push({
                            id: `${o.deviceId}-${o._time}-${key}`,
                            deviceId: o.deviceId,
                            experimentId: o.experimentId !== 'none' ? o.experimentId : undefined,
                            metricType: key,
                            value: Number(o[key]),
                            timestamp
                        });
                    }
                });
            },
            error(error) {
                console.error('[InfluxDB] Query Error:', error);
                reject(error);
            },
            complete() {
                resolve(results);
            },
        });
    });
}
