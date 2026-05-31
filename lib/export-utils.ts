import * as XLSX from 'xlsx';

export function downloadExcel(exportData: any, experimentName: string) {
    if (!exportData || !exportData.telemetry) return;

    const workbook = XLSX.utils.book_new();

    // --- SHEET 1: Project Details ---
    const projectData = [
        ["Propriedade", "Valor"],
        ["Nome do Projeto", exportData.project.name],
        ["Descrição", exportData.project.description || "N/A"],
        ["Data de Criação", new Date(exportData.project.createdAt).toLocaleDateString('pt-PT')]
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    projectSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, projectSheet, "Detalhes do Projeto");

    // --- SHEET 2: Experiment Settings ---
    const expSettings = [
        ["Configuração", "Valor"],
        ["Nome da Experiência", exportData.experiment.name],
        ["Estado", exportData.experiment.status],
        ["Data de Início", exportData.experiment.startDate ? new Date(exportData.experiment.startDate).toLocaleString('pt-PT') : "N/A"],
        ["Data de Fim", exportData.experiment.endDate ? new Date(exportData.experiment.endDate).toLocaleString('pt-PT') : "N/A"],
        ["Frequência de Registo (s)", exportData.experiment.storageFrequency],
        ["Estratégia de Agregação", exportData.experiment.aggregationStrategy]
    ];
    const settingsSheet = XLSX.utils.aoa_to_sheet(expSettings);
    settingsSheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, settingsSheet, "Configurações");

    // --- SHEET 3: Telemetry ---
    const groupedData: Record<string, any> = {};

    if (exportData.telemetry.length > 0) {
        exportData.telemetry.forEach((reading: any) => {
            const date = new Date(reading.timestamp);
            const dateStr = [
                date.getDate().toString().padStart(2, '0'),
                (date.getMonth() + 1).toString().padStart(2, '0'),
                date.getFullYear()
            ].join('/') + ' ' + [
                date.getHours().toString().padStart(2, '0'),
                date.getMinutes().toString().padStart(2, '0'),
                date.getSeconds().toString().padStart(2, '0')
            ].join(':');

            if (!groupedData[dateStr]) {
                groupedData[dateStr] = { "Data/Hora": dateStr };
            }

            const sn = reading.device?.serialNumber || reading.deviceId;
            const metricName = reading.metricType.charAt(0).toUpperCase() + reading.metricType.slice(1);
            const key = `${metricName} (${sn})`;
            groupedData[dateStr][key] = reading.value;
        });
    }

    const flatData = Object.values(groupedData);
    const telemetrySheet = XLSX.utils.json_to_sheet(flatData.length > 0 ? flatData : [{ "Aviso": "Nenhum dado de telemetria registado." }]);
    XLSX.utils.book_append_sheet(workbook, telemetrySheet, "Telemetria");

    // --- TRIGGER DOWNLOAD ---
    XLSX.writeFile(workbook, `Experiencia_${experimentName.replace(/\s+/g, '_')}.xlsx`);
}
