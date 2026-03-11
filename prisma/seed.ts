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
        { id: "btnhtehgwer591we985g1we9f", sku: "SENS-PREM-PH", name: "Sensor de pH", isFeatured: true, description: "Monitorização pH 24/7 com compensação automática de temperatura", subtitle: "Análise química com precisão laboratorial", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772990723/Gemini_Generated_Image_gs3tj0gs3tj0gs3t_odrxgm.png", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 20, price: 20000, stripeProductId: "prod_U1J2s171rYcj5R" },
        { id: "cmlsocydi0003ecbgy59cs8ow", sku: "GW-TRB142", name: "Gateway Teltonika TRB142", isFeatured: false, description: "", subtitle: "", imageUrl: "", type: "GATEWAY" as HardwareType, stockQuantity: 50, price: 20000, stripeProductId: "prod_U1JDQM0WjQr7ah" },
        { id: "df9s84b19s51vas59dc121vc9", sku: "SENS-BASE-PRESS", name: "Sensor de Pressão", isFeatured: true, description: "Este sensor monitoriza continuamente a pressão nos seus processos", subtitle: "Monitorização robusta de sistemas industriais", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772988686/Gemini_Generated_Image_f4t9v5f4t9v5f4t9_fsvga2.png", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1IzyDFUrDSay5" },
        { id: "fs591b9sd81cv9ads81csdav8", sku: "SENS-BASE-TEMP", name: "Sensor de Temperatura", isFeatured: false, description: "Uma sonda de aço inoxidável totalmente à prova de água (IP68)", subtitle: "Registo térmico fiável para ambientes críticos", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772990674/Gemini_Generated_Image_puow8lpuow8lpuow_lktxd2.png", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J0ZPCTs5SV8v" },
        { id: "rtdnasd5h9g195nh1eth1989e", sku: "SENS-BASE-AMP", name: "Pinça Amperimétrica", isFeatured: true, description: "Monitorização não intrusiva de corrente elétrica", subtitle: "Análise de consumo elétrico não intrusiva", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772990112/Gemini_Generated_Image_qbw210qbw210qbw2_fmkmzo.png", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J14UAEHhYfpW" },
        { id: "sdbrwenhtkjg51wfe9f9511af", sku: "SENS-PREM-SALIN", name: "Sensor de Salinidade", isFeatured: false, description: "Mede a concentração de sais e nutrientes na água (EC/TDS)", subtitle: "Medição exata de salinidade em soluções", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772990164/Gemini_Generated_Image_vo2b0rvo2b0rvo2b_oewexq.png", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 100, price: 20000, stripeProductId: "prod_U1J2KudiQXlKvF" },
        { id: "tnjwrg189g1wrhg9w5we5f91d", sku: "SENS-PREM-BIOGAS", name: "Sensor de Biogás", isFeatured: true, description: "Especialmente para detetar Metano (CH4), Dióxido de Carbono (CO2) e sulfeto de hidrogénio (H2S).", subtitle: "Deteção inteligente de gases renováveis", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772990865/Gemini_Generated_Image_ilzkjnilzkjnilzk_oj7tsc.png", type: "SENSOR_PREMIUM" as HardwareType, stockQuantity: 100, price: 20000, stripeProductId: "prod_U1J4fFopHs6X6b" },
        { id: "ytukm4h891rgwr819gwg81gwr", sku: "SENS-BASE-VIBR", name: "Sensor de Vibração", isFeatured: false, description: "Sensor que deteta padrões anormais de vibração", subtitle: "Deteção antecipada de desgaste", imageUrl: "https://res.cloudinary.com/diic8impf/image/upload/v1772989431/Gemini_Generated_Image_8xb5p08xb5p08xb5_ajtppq.png", type: "SENSOR_BASE" as HardwareType, stockQuantity: 100, price: 0.00, stripeProductId: "prod_U1J0mQnmzeTB4J" }
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
            priceAmount: 99999, // 999.99€
            currency: "eur",
            orderIndex: 0,
            marketingDesc: "Para pequenas unidades com sede de mudança",
            stripeProductId: "prod_TtpBDLh7dQoq1z",
            includedGateways: 1,
            includedSensors: 3,
            maxSensors: 5,
            extraSensorStripePriceId: "prod_U2waD8aJYlehky",
            maxUsers: 3,
            dataRetentionMonths: 6,
            uiFeatureMatrix: {
                cardFeatures: [
                    { text: "1 Dispositivo Gateway", included: true, tooltip: "Inclui hardware e conectividade" },
                    { text: "3 Sensores Base", included: true, tooltip: "Sensores standard incluídos à sua escolha" },
                    { text: "3 Utilizadores", included: true },
                    { text: "6 meses de retenção dos dados", included: true },
                    { text: "Máximo de 5 sensores ativos", included: true },
                    { text: "60 calls/hora da API", included: true },
                    { text: "Sistema de alertas básico", included: true, tooltip: "Alertas via email" }
                ],
                tableCategories: [
                    {
                        categoryName: "Planos",
                        features: [
                            { name: "Público Alvo", value: "Pequenos Laboratórios" }
                        ]
                    },
                    {
                        categoryName: "Hardware & Instalação",
                        features: [
                            { name: "Gateway Industrial (Edge)", value: "Incluído (1)" },
                            { name: "Sensores Base Incluídos", value: "3" },
                            { name: "Capacidade de Expansão", value: "Até 5 Sensores" },
                            { name: "Modo Offline (Store & Forward)", value: true },
                            { name: "Suporte a Sensores Premium", value: "Opcional (+Custo)" }
                        ]
                    },
                    {
                        categoryName: "Plataforma & Visualização",
                        features: [
                            { name: "Utilizadores", value: "3" },
                            { name: "Dashboards em Tempo Real", value: "Simples" },
                            { name: "Vista Kiosk (Modo TV)", value: false },
                            { name: "Mapa Multi-Site", value: false },
                            { name: "Gestão de Alertas", value: "Básico (Email)" }
                        ]
                    },
                    {
                        categoryName: "Inteligência Artificial",
                        features: [
                            { name: "Deteção de Anomalias", value: false },
                            { name: "Interrogador de Dados (Chat)", value: false },
                            { name: "Análise de Manuais (RAG)", value: false },
                            { name: "Diagnóstico de Causa Raiz", value: false }
                        ]
                    },
                    {
                        categoryName: "Dados & Compliance",
                        features: [
                            { name: "Histórico de Dados", value: "6 Meses" },
                            { name: "Relatórios Automáticos", value: false },
                            { name: "Audit Logs (Quem fez o quê)", value: false },
                            { name: "Exportação de Dados", value: "Manual" }
                        ]
                    },
                    {
                        categoryName: "Integração & Suporte",
                        features: [
                            { name: "API Access", value: "60 calls/hora" },
                            { name: "Webhooks", value: false },
                            { name: "Setup & Onboarding", value: "Self-Service" },
                            { name: "SLA de Suporte", value: "Email (48h)" },
                            { name: "Custo Sensor Extra (Add-on)", value: "80€", tooltip: "Custo por sensor base adicional por ano" }
                        ]
                    }
                ]
            }
        },
        {
            name: "Industrial Pro",
            priceAmount: 149999,
            currency: "eur",
            orderIndex: 1,
            isPopular: true,
            marketingDesc: "Para linhas de produção e fábricas em crescimento",
            stripeProductId: "prod_TtpC4VinryxEMF",
            includedGateways: 1,
            includedSensors: 10,
            maxSensors: 20,
            extraSensorStripePriceId: "prod_U2wbqp5haVLMA4",
            maxUsers: 10,
            dataRetentionMonths: 12,
            uiFeatureMatrix: {
                cardFeatures: [
                    { text: "1 Dispositivo Gateway", included: true, tooltip: "Inclui hardware e conectividade" },
                    { text: "10 Sensores Base", included: true, tooltip: "Sensores standard incluídos à sua escolha" },
                    { text: "Número de utilizadores Ilimitado", included: true },
                    { text: "1 ano de retenção dos dados", included: true },
                    { text: "Máximo de 20 sensores ativos", included: true },
                    { text: "1 call/seg na API", included: true },
                    { text: "1 Webhook", included: true },
                    { text: "Analista AI: Deteção de Anomalias", included: true, tooltip: "O nosso modelo padronizado ajuda a encontrar problemas nos dados" }
                ],
                tableCategories: [
                    {
                        categoryName: "Planos",
                        features: [
                            { name: "Público Alvo", value: "Fábricas | Linhas" }
                        ]
                    },
                    {
                        categoryName: "Hardware & Instalação",
                        features: [
                            { name: "Gateway Industrial (Edge)", value: "Incluído (1)" },
                            { name: "Sensores Base Incluídos", value: "10" },
                            { name: "Capacidade de Expansão", value: "Até 20 Sensores" },
                            { name: "Modo Offline (Store & Forward)", value: true },
                            { name: "Suporte a Sensores Premium", value: "Opcional (+Custo)" }
                        ]
                    },
                    {
                        categoryName: "Plataforma & Visualização",
                        features: [
                            { name: "Utilizadores", value: "Ilimitados" },
                            { name: "Dashboards em Tempo Real", value: "Avançados" },
                            { name: "Vista Kiosk (Modo TV)", value: true },
                            { name: "Mapa Multi-Site", value: true },
                            { name: "Gestão de Alertas", value: "Avançado (SMS/Email)" }
                        ]
                    },
                    {
                        categoryName: "Inteligência Artificial",
                        features: [
                            { name: "Deteção de Anomalias", value: "Padrão" },
                            { name: "Interrogador de Dados (Chat)", value: false },
                            { name: "Análise de Manuais (RAG)", value: false },
                            { name: "Diagnóstico de Causa Raiz", value: "Básico" }
                        ]
                    },
                    {
                        categoryName: "Dados & Compliance",
                        features: [
                            { name: "Histórico de Dados", value: "1 Ano" },
                            { name: "Relatórios Automáticos", value: "PDF/Excel" },
                            { name: "Audit Logs (Quem fez o quê)", value: "30 Dias" },
                            { name: "Exportação de Dados", value: "Agendada" }
                        ]
                    },
                    {
                        categoryName: "Integração & Suporte",
                        features: [
                            { name: "API Access", value: "1 call/seg" },
                            { name: "Webhooks", value: "1 (ERP/Slack)" },
                            { name: "Setup & Onboarding", value: "Assistido" },
                            { name: "SLA de Suporte", value: "Prioritário (24h)" },
                            { name: "Custo Sensor Extra (Add-on)", value: "60€" }
                        ]
                    }
                ]
            }
        },
        {
            name: "Executivo",
            priceAmount: 499999,
            currency: "eur",
            orderIndex: 2,
            marketingDesc: "Para operações multi-site e grandes volumes de dados",
            stripeProductId: "prod_TtpD08s9icFmyV",
            includedGateways: 1,
            includedSensors: 20,
            maxSensors: null,
            extraSensorStripePriceId: "prod_U2wbUzarTw6Gkc",
            maxUsers: null,
            dataRetentionMonths: 84,
            uiFeatureMatrix: {
                cardFeatures: [
                    { text: "1 Dispositivo Gateway", included: true, tooltip: "Inclui hardware e conectividade" },
                    { text: "20 Sensores Base", included: true, tooltip: "Sensores standard incluídos à sua escolha" },
                    { text: "Número de utilizadores Ilimitado", included: true },
                    { text: "7 anos de retenção de dados", included: true },
                    { text: "Número de sensores ativos Ilimitado", included: true, tooltip: "Expanda a sua rede infinitamente" },
                    { text: "Sem limite de calls na API", included: true },
                    { text: "Webhooks Ilimitados", included: true },
                    { text: "Analista AI: Modelos Personalizados", included: true, tooltip: "Treinamos a IA para a sua fábrica" }
                ],
                tableCategories: [
                    {
                        categoryName: "Planos",
                        features: [
                            { name: "Público Alvo", value: "Multi-Site" }
                        ]
                    },
                    {
                        categoryName: "Hardware & Instalação",
                        features: [
                            { name: "Gateway Industrial (Edge)", value: "Incluído (1)" },
                            { name: "Sensores Base Incluídos", value: "20" },
                            { name: "Capacidade de Expansão", value: "Ilimitada", tooltip: "Sujeito a fee on-boarding extra por Gateway" },
                            { name: "Modo Offline (Store & Forward)", value: true },
                            { name: "Suporte a Sensores Premium", value: "Opcional (+Custo)" }
                        ]
                    },
                    {
                        categoryName: "Plataforma & Visualização",
                        features: [
                            { name: "Utilizadores", value: "Ilimitados" },
                            { name: "Dashboards em Tempo Real", value: "Personalizáveis" },
                            { name: "Vista Kiosk (Modo TV)", value: true },
                            { name: "Mapa Multi-Site", value: true },
                            { name: "Gestão de Alertas", value: "Escalamento inteligente", tooltip: "Alertas cruzam com tabelas de horários" }
                        ]
                    },
                    {
                        categoryName: "Inteligência Artificial",
                        features: [
                            { name: "Deteção de Anomalias", value: "Personalizada" },
                            { name: "Interrogador de Dados (Chat)", value: true },
                            { name: "Análise de Manuais (RAG)", value: true },
                            { name: "Diagnóstico de Causa Raiz", value: "Avançado" }
                        ]
                    },
                    {
                        categoryName: "Dados & Compliance",
                        features: [
                            { name: "Histórico de Dados", value: "7 Anos (Audit Ready)" },
                            { name: "Relatórios Automáticos", value: "HACCP / ISO" },
                            { name: "Audit Logs (Quem fez o quê)", value: "Ilimitado" },
                            { name: "Exportação de Dados", value: "Automatizada" }
                        ]
                    },
                    {
                        categoryName: "Integração & Suporte",
                        features: [
                            { name: "API Access", value: "Ilimitado" },
                            { name: "Webhooks", value: "Ilimitados" },
                            { name: "Setup & Onboarding", value: "Gestor de Conta Dedicado" },
                            { name: "SLA de Suporte", value: "Telefone/Crítico (4h)" },
                            { name: "Custo Sensor Extra (Add-on)", value: "50€" }
                        ]
                    }
                ]
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