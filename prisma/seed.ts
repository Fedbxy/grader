import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function initRootUser() {
    const password = process.env.NEXT_PRIVATE_ROOT_PASSWORD || "00000000";
    const passwordHash = await hash(password, 10);

    await prisma.user.upsert({
        where: {
            id: 1,
        },
        update: {
            password: passwordHash,
            role: "admin",
            isBanned: false,
        },
        create: {
            id: 1,
            username: "root",
            displayName: "root",
            password: passwordHash,
            role: "admin",
        },
    });
}

initRootUser()
    .then(async () => {
        await prisma.$disconnect();
    }).catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    })