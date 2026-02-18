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

    // 2. Criar a Organização Pai PRIMEIRO
    const org = await prisma.organization.create({
        data: {
            name: 'Universidade do Minho',
            auth0OrgId: 'org_uminho_demo',
        }
    })
    console.log(`✅ Organização criada: ${org.id}`)

    // 3. Criar o Departamento (Ligando à Organização criada acima)
    const dept = await prisma.department.create({
        data: {
            name: "Departamento de Física (Lab 3)",
            slug: "uminho-fisica",
            stripeCustomerId: "cus_T9x8y7z6",

            plan: PlanTier.INDUSTRIAL_PRO,

            organization: {
                connect: { id: org.id }
            },

            billingAddress: {
                create: {
                    street: "Campus de Gualtar",
                    city: "Braga",
                    zipCode: "4710-057",
                    nif: "502011378",
                    country: "Portugal"
                }
            }
        }
    })
    console.log(`✅ Departamento criado: ${dept.id}`)

    // 4. Criar Produto de Hardware
    const gateway = await prisma.hardwareProduct.create({
        data: {
            sku: 'GW-TRB142',
            name: 'Gateway Teltonika TRB142',
            type: HardwareType.GATEWAY,
            stockQuantity: 50,
            price: 150.00
        }
    })

    // 5. Criar um Device atribuído ao Departamento
    await prisma.device.create({
        data: {
            serialNumber: 'SN99887766',
            status: DeviceStatus.ACTIVE, // Enum
            productId: gateway.id,
            departmentId: dept.id
        }
    })

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