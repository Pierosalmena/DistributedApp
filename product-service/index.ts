import express from 'express';
import productRouter from "./routes/productRouter";
import './cache';                   // ← <-- this runs cache.ts top–level code
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma';
import {connectRabbit} from './messaging'

const prisma = new PrismaClient()

dotenv.config();

async function start() {
    // 1) Start HTTP server
    const app = express();

    app.use(express.json())

    app.use("/", productRouter);


    const PORT = 3001;

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })

    // 2) Then bootstrap Rabbit consumer
    const channel = await connectRabbit();
    await channel.assertExchange('order.events', 'fanout', {durable: true});
    const q = await channel.assertQueue('product-stock-queue', {durable: true});

    // Bind our queue to the exchange so we get every event
    await channel.bindQueue(q.queue, 'order.events', '');

    //Start consuming
    channel.consume(q.queue, async msg => {
        if(!msg) return;
        const {items} = JSON.parse(msg.content.toString());
        for (const {productId, quantity} of items) {
            await prisma.product.update({
                where: {id: productId},
                data: {stock: {decrement: quantity}}
            });
        }
        channel.ack(msg);
    })
}

start().catch(err => {
    console.error('Failed to start product-service:', err);
    process.exit(1);
})

