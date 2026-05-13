import { PrismaClient, DeviceStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function processDispatch(orderId: string) {
    console.log(`🚀 A iniciar processo de despacho para a encomenda: ${orderId}`);

    try {
        // We use $transaction so if anything fails, no ghost devices are created.
        const result = await prisma.$transaction(async (tx) => {

            // 1. Fetch the Order and its associated OrderItems
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: { product: true } // Include product to get the name for logging
                    }
                }
            });

            if (!order) {
                throw new Error(`Encomenda com o ID ${orderId} não encontrada.`);
            }

            if (order.items.length === 0) {
                throw new Error(`A encomenda ${orderId} não tem itens registados (OrderItems).`);
            }

            console.log(`📋 Encontrados ${order.items.length} tipos de produtos na encomenda.`);

            const allGeneratedSerialNumbers: string[] = [];

            // 2. Loop through each OrderItem to generate physical Devices
            for (const item of order.items) {
                const devicesToCreate = Array.from({ length: item.quantity }).map(() => {
                    const sn = randomUUID();
                    allGeneratedSerialNumbers.push(sn);

                    return {
                        serialNumber: sn,
                        status: DeviceStatus.UNCLAIMED,
                        productId: item.productId,
                        departmentId: order.departmentId
                    };
                });

                // 3. Batch insert the new UNCLAIMED devices into the database
                await tx.device.createMany({
                    data: devicesToCreate
                });

                console.log(`📦 Gerados ${item.quantity} equipamentos (UNCLAIMED) para ${item.product.name}`);
            }

            // 4. Mark the Order as SHIPPED
            await tx.order.update({
                where: { id: orderId },
                data: { status: "SHIPPED" }
            });

            console.log("✅ Estado da encomenda atualizado para SHIPPED.");

            return {
                success: true,
                serialNumbers: allGeneratedSerialNumbers
            };
        });

        console.log("🎉 Despacho concluído com sucesso!");
        return result;

    } catch (error) {
        console.error("❌ Erro ao processar despacho:", error);
        return { success: false, error: String(error) };
    } finally {
        await prisma.$disconnect();
    }
}

// ==========================================
// Exemplo de Execução (Mock Data)
// ==========================================
async function runTest() {
    // Insere aqui um orderId real que já exista na tua base de dados (e que já tenha OrderItems)
    const targetOrderId = "cmp4enb5y000pg06jmxch26h0";

    const result = await processDispatch(targetOrderId);

    if (result.success && 'serialNumbers' in result) {
        console.log("\n🖨️ Enviar estes Serial Numbers para a impressora de QR Codes:");
        console.table(result.serialNumbers);
    }
}

// Descomentar para testar localmente
runTest();