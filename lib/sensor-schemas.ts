export interface SchemaItem {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    color: string;
}

export const SENSOR_DICTIONARY: Record<string, SchemaItem[]> = {
    'SENS-PREM-PH': [
        { key: 'ph', label: 'pH', unit: 'pH', min: 0, max: 14, color: '#ec4899' },
        { key: 'temperature', label: 'Temperatura (Compensação)', unit: '°C', min: 0, max: 100, color: '#f97316' }
    ],
    'SENS-BASE-PRESS': [
        { key: 'pressure', label: 'Pressão', unit: 'mbar', min: 0, max: 2000, color: '#3b82f6' }
    ],
    'SENS-BASE-TEMP': [
        { key: 'temperature', label: 'Temperatura', unit: '°C', min: -50, max: 150, color: '#ef4444' }
    ],
    'SENS-BASE-AMP': [
        { key: 'current', label: 'Corrente', unit: 'A', min: 0, max: 100, color: '#eab308' }
    ],
    'SENS-PREM-SALIN': [
        { key: 'salinity', label: 'Salinidade', unit: 'ppt', min: 0, max: 50, color: '#06b6d4' }
    ],
    'SENS-PREM-BIOGAS': [
        { key: 'ch4', label: 'Metano (CH4)', unit: '%', min: 0, max: 100, color: '#22c55e' },
        { key: 'co2', label: 'Dióxido de Carbono (CO2)', unit: '%', min: 0, max: 100, color: '#64748b' },
        { key: 'h2s', label: 'Sulfureto de Hidrogénio (H2S)', unit: 'ppm', min: 0, max: 500, color: '#f59e0b' }
    ],
    'SENS-BASE-VIBR': [
        { key: 'vibration_x', label: 'Vibração (Eixo X)', unit: 'mm/s', min: 0, max: 50, color: '#8b5cf6' },
        { key: 'vibration_y', label: 'Vibração (Eixo Y)', unit: 'mm/s', min: 0, max: 50, color: '#d946ef' },
        { key: 'vibration_z', label: 'Vibração (Eixo Z)', unit: 'mm/s', min: 0, max: 50, color: '#0ea5e9' }
    ]
};

export const SENSOR_CALIBRATION_DICTIONARY: Record<string, { points: 1 | 2; intervalDays: number }> = {
    'SENS-PREM-PH': { points: 2, intervalDays: 30 }
};
