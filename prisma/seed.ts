import { PrismaClient, PlanTier, Role, HardwareType, DeviceStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 A iniciar o seed...')

    // 1. Limpar dados antigos (opcional, para evitar erros de duplicados)
    try {
        await prisma.device.deleteMany()
        await prisma.hardwareProduct.deleteMany()
        await prisma.user.deleteMany()
        await prisma.department.deleteMany()
        await prisma.organization.deleteMany()
        console.log('🧹 Dados antigos limpos.')
    } catch (e) {
        console.log('⚠️ Primeira execução (sem dados para limpar).')
    }

    const hardwareProducts = [
        { id: "btnhtehgwer591we985g1we9f", sku: "SENS-PREM-PH", name: "Sensor de pH", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 20, price: 200.00, stripeProductId: "prod_U1J2s171rYcj5R" },
        { id: "cmlsocydi0003ecbgy59cs8ow", sku: "GW-TRB142", name: "Gateway Teltonika TRB142", type: "GATEWAY" as HardwareType, stockQuantity: 50, price: 200.00, stripeProductId: "prod_U1JDQM0WjQr7ah" },
        { id: "df9s84b19s51vas59dc121vc9", sku: "SENS-BASE-PRESS", name: "Sensor de Pressão", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1IzyDFUrDSay5" },
        { id: "fs591b9sd81cv9ads81csdav8", sku: "SENS-BASE-TEMP", name: "Sensor de Temperatura", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J0ZPCTs5SV8v" },
        { id: "rtdnasd5h9g195nh1eth1989e", sku: "SENS-BASE-AMP", name: "Pinça Amperimétrica", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J14UAEHhYfpW" },
        { id: "sdbrwenhtkjg51wfe9f9511af", sku: "SENS-PREM-SALIN", name: "Sensor de Salinidade", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 100, price: 200.00, stripeProductId: "prod_U1J2KudiQXlKvF" },
        { id: "tnjwrg189g1wrhg9w5we5f91d", sku: "SENS-PREM-BIOGAS", name: "Sensor de Biogás", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 100, price: 200.00, stripeProductId: "prod_U1J4fFopHs6X6b" },
        { id: "ytukm4h891rgwr819gwg81gwr", sku: "SENS-BASE-VIBR", name: "Sensor de Vibração", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J0mQnmzeTB4J" }
    ];

    for (const product of hardwareProducts) {
        await prisma.hardwareProduct.upsert({
            where: { id: product.id },
            update: product,
            create: product,
        });
    }
    console.log('✅ HardwareProducts sincronizados com sucesso.');

    // 2. SEED DAS REGRAS DOS PLANOS (PLAN TIERS)
    // Dados baseados na matriz de funcionalidades e preços fornecida
    const planTiers = [
        {
            name: "Starter",
            priceAmount: 99999,
            currency: "eur",
            marketingDesc: "Para pequenas unidades com sede de mudança",
            stripeProductId: "prod_TtpBDLh7dQoq1z", // ⚠️ SUBSTITUIR: ID do Produto (não Preço)
            includedGateways: 1,
            includedSensors: 3,
            maxSensors: 5,
            extraSensorStripePriceId: "prod_U2waD8aJYlehky", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 80€
            maxUsers: 3,
            dataRetentionMonths: 6,
            uiFeatureMatrix: {
                "Hardware & Instalação": {
                    "Modo Offline (Store & Forward)": true,
                    "Suporte a Sensores Premium": "Opcional (+Custo)"
                },
                "Plataforma & Visualização": {
                    "Dashboards em Tempo Real": "Simples",
                    "Vista Kiosk (Modo TV)": false,
                    "Mapa Multi-Site": false,
                    "Gestão de Alertas": "Básico (Email)"
                },
                "Inteligência Artificial": {
                    "Deteção de Anomalias": false,
                    "Interrogador de Dados (Chat)": false,
                    "Análise de Manuais (RAG)": false,
                    "Diagnóstico de Causa Raiz": false
                },
                "Dados & Compliance": {
                    "Histórico de Dados": "6 Meses",
                    "Relatórios Automáticos": false,
                    "Audit Logs (Quem fez o quê)": false,
                    "Exportação de Dados": "Manual"
                },
                "Integração & Suporte": {
                    "API Access": "60 calls/hora",
                    "Webhooks": false,
                    "Setup & Onboarding": "Self-Service",
                    "SLA de Suporte": "Email (48h)"
                }
            }
        },
        {
            name: "Industrial Pro", // Também referido como Premium na UI
            priceAmount: 1499999,
            currency: "eur",
            marketingDesc: "Para linhas de produção e fábricas em crescimento",
            stripeProductId: "prod_TtpC4VinryxEMF", // ⚠️ SUBSTITUIR: ID do Produto (não Preço)
            includedGateways: 1,
            includedSensors: 10,
            maxSensors: 20,
            extraSensorStripePriceId: "prod_U2wbqp5haVLMA4", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 60€
            maxUsers: 10,
            dataRetentionMonths: 12,
            uiFeatureMatrix: {
                "Hardware & Instalação": {
                    "Modo Offline (Store & Forward)": true,
                    "Suporte a Sensores Premium": "Opcional (+Custo)"
                },
                "Plataforma & Visualização": {
                    "Dashboards em Tempo Real": "Avançados",
                    "Vista Kiosk (Modo TV)": true,
                    "Mapa Multi-Site": true,
                    "Gestão de Alertas": "Avançado (SMS/Email)"
                },
                "Inteligência Artificial": {
                    "Deteção de Anomalias": "Padrão",
                    "Interrogador de Dados (Chat)": false,
                    "Análise de Manuais (RAG)": false,
                    "Diagnóstico de Causa Raiz": "Básico"
                },
                "Dados & Compliance": {
                    "Histórico de Dados": "1 Ano",
                    "Relatórios Automáticos": "PDF / Excel (PT)",
                    "Audit Logs (Quem fez o quê)": "30 Dias",
                    "Exportação de Dados": "Agendada"
                },
                "Integração & Suporte": {
                    "API Access": "1 call/seg",
                    "Webhooks": "1 (ERP/Slack)",
                    "Setup & Onboarding": "Assistido",
                    "SLA de Suporte": "Prioritário (24h)"
                }
            }
        },
        {
            name: "Enterprise", // Também referido como Executivo na matriz
            priceAmount: 499999,
            currency: "eur",
            marketingDesc: "Para operações multi-site e grandes volumes de dados",
            stripeProductId: "prod_TtpD08s9icFmyV", // ⚠️ SUBSTITUIR: ID do Produto (não Preço)
            includedGateways: 1,
            includedSensors: 20,
            maxSensors: null, // null = Ilimitado
            extraSensorStripePriceId: "prod_U2wbUzarTw6Gkc", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 50€
            maxUsers: null,
            dataRetentionMonths: 84,
            uiFeatureMatrix: {
                "Hardware & Instalação": {
                    "Modo Offline (Store & Forward)": true,
                    "Suporte a Sensores Premium": "Opcional (+Custo)"
                },
                "Plataforma & Visualização": {
                    "Dashboards em Tempo Real": "Personalizáveis",
                    "Vista Kiosk (Modo TV)": true,
                    "Mapa Multi-Site": true,
                    "Gestão de Alertas": "Escalamento Inteligente"
                },
                "Inteligência Artificial": {
                    "Deteção de Anomalias": "Personalizada",
                    "Interrogador de Dados (Chat)": true,
                    "Análise de Manuais (RAG)": true,
                    "Diagnóstico de Causa Raiz": "Avançado"
                },
                "Dados & Compliance": {
                    "Histórico de Dados": "7 Anos (Audit Ready)",
                    "Relatórios Automáticos": "HACCP / ISO",
                    "Audit Logs (Quem fez o quê)": "Ilimitado",
                    "Exportação de Dados": "Automatizada"
                },
                "Integração & Suporte": {
                    "API Access": "Ilimitado",
                    "Webhooks": "Ilimitados",
                    "Setup & Onboarding": "Gestor de Conta Dedicado",
                    "SLA de Suporte": "Telefone/Crítico (4h)"
                }
            }
        }
    ];

    for (const tier of planTiers) {
        // Usa o stripeProductId como chave única
        await prisma.planTier.upsert({
            where: { stripeProductId: tier.stripeProductId },
            update: tier,
            create: tier,
        });
    }
    console.log('✅ PlanTiers (Regras de Negócio) sincronizados com sucesso.');

    console.log('🚀 Seed concluído com sucesso!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })