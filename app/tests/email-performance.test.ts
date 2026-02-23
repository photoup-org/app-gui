import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

// We must dynamically import the email service after loadEnvConfig 
// so that process.env is populated before the transporter is initialized.

async function testEmailPerformance() {
    const { sendInvitationEmail } = await import('@/lib/services/email');
    console.log("Starting email performance test...");
    const testEmail = "danielmadalena@msn.com";
    const testUrl = "http://localhost:3000/auth/login?invitation=test12345";

    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        console.log(`\n[Iteration ${i + 1}/${iterations}] Sending email...`);
        try {
            await sendInvitationEmail(testEmail, testUrl);
            const end = performance.now();
            const duration = end - start;
            times.push(duration);
            console.log(`✅ Iteration ${i + 1} completed in ${duration.toFixed(2)}ms`);
        } catch (error) {
            console.error(`❌ Iteration ${i + 1} failed:`, error);
        }
    }

    if (times.length > 0) {
        const total = times.reduce((a, b) => a + b, 0);
        const avg = total / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        console.log("\n--- ⚡ Performance Results ⚡ ---");
        console.log(`Total Emails Sent: ${times.length}`);
        console.log(`Average Delivery Time: ${avg.toFixed(2)}ms`);
        console.log(`Fastest Delivery: ${min.toFixed(2)}ms`);
        console.log(`Slowest Delivery: ${max.toFixed(2)}ms`);
        console.log("---------------------------------");
    } else {
        console.log("No successful iterations to measure.");
    }
}

testEmailPerformance().then(() => {
    console.log("Test execution finished.");
    process.exit(0);
}).catch((e) => {
    console.error("Critical test failure:", e);
    process.exit(1);
});
