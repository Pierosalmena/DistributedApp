import { faker } from '@faker-js/faker';
import {PrismaClient} from '../generated/prisma'

const prisma = new PrismaClient();

const data = Array.from({length: 100}).map(()=> ({
    name: faker.person.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    createdAt: faker.date.recent(),
}))

async function main() {
    // queries here
    //   await prisma.user.create({
    // data: {
    //   name: 'Alice',
    //   email: 'alice@prisma.io',
    //   password: '123',
    //   createdAt: new Date(),
    // },
    await prisma.user.createMany({ data });
  
    const allUsers = await prisma.user.findMany()
    console.log(allUsers)
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