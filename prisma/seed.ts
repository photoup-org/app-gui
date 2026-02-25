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
            stripePlanPriceId: "price_1Sw1Wg...", // ⚠️ SUBSTITUIR: O ID do preço de 499,99€/ano
            includedGateways: 1,
            includedSensors: 3,
            maxSensors: 5,
            extraSensorStripePriceId: "price_extra_starter_80...", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 80€
        },
        {
            name: "Industrial Pro", // Também referido como Premium na UI
            stripePlanPriceId: "price_premium...", // ⚠️ SUBSTITUIR: O ID do preço de 1.499,99€/ano
            includedGateways: 1,
            includedSensors: 10,
            maxSensors: 20,
            extraSensorStripePriceId: "price_extra_premium_60...", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 60€
        },
        {
            name: "Enterprise", // Também referido como Executivo na matriz
            stripePlanPriceId: "price_enterprise...", // ⚠️ SUBSTITUIR: O ID do preço de 4.999,99€/ano
            includedGateways: 1,
            includedSensors: 20,
            maxSensors: null, // null = Ilimitado
            extraSensorStripePriceId: "price_extra_enterprise_50...", // ⚠️ SUBSTITUIR: O ID do preço do add-on de 50€
        }
    ];

    for (const tier of planTiers) {
        // Usa o nome como chave única para o upsert se o stripePlanPriceId ainda for um placeholder
        await prisma.planTier.upsert({
            where: { stripePlanPriceId: tier.stripePlanPriceId },
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