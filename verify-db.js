
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Prisma Models...');

    try {
        // Check Service model
        const serviceCount = await prisma.service.count();
        console.log(`Service model accessible. Count: ${serviceCount}`);

        // Check Appointment model
        const appointmentCount = await prisma.appointment.count();
        console.log(`Appointment model accessible. Count: ${appointmentCount}`);

        console.log('Verification Successful');
    } catch (e) {
        console.error('Verification Failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
