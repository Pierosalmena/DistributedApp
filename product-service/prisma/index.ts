import {faker} from '@faker-js/faker';
import {PrismaClient} from '../generated/prisma'

const prisma = new PrismaClient();

const data = Array.from({length: 200}).map(()=> ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 5, max: 100, dec: 2 })),
    stock: faker.number.int({ min: 0, max: 50 }),
}))

async function main() {

    await prisma.product.createMany({data});

//   id          Int      @id @default(autoincrement())
//   name        String
//   description String?
//   price       Float
//   stock       Int      @default(0)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//     await prisma.product.updateMany({
//   data: {
//     stock: Math.random() * 4
//   }
// });

const allProducts = await prisma.product.findMany()
  console.log(allProducts)
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