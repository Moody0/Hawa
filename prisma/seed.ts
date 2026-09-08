import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const username = process.env.ADMIN_SEED_USERNAME?.trim().normalize('NFKC').toLocaleLowerCase('en-US')
    const password = process.env.ADMIN_SEED_PASSWORD
    if (!username || !password) {
        throw new Error('ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD are required')
    }
    if (password.length < 12 || password.length > 128) {
        throw new Error('ADMIN_SEED_PASSWORD must contain 12 to 128 characters')
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.upsert({
        where: { username },
        update: { password: hashedPassword, disabledAt: null, archivedAt: null },
        create: {
            username,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    console.log(`Administrator ${username} created or updated without exposing credentials.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
