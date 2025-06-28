import { PrismaClient } from './generated/prisma';
import { connectRabbit } from './messaging';

const prisma = new PrismaClient();

const PRODUCT_URL = process.env.PRODUCT_URL!; // e.g. http://localhost:3001

async function startWorker() {
  // 1) Get your RabbitMQ channel
  const channel = await connectRabbit();

  // 2) Declare the queue that *will* receive those requests
  await channel.assertQueue('order.requests.queue', { durable: true });

  // 3) Fair‐dispatch: one unacked message at a time
  channel.prefetch(1);

  // 4) Start consuming from the now‐bound queue
  channel.consume('order.requests.queue', async msg => {
    if (!msg) return;
    const { requestId, userId, productId, quantity } =
      JSON.parse(msg.content.toString());

    try {
      // 5a) Fetch price
      const resp = await fetch(`${PRODUCT_URL}/${productId}`);
      if (!resp.ok) throw new Error('Product not found');
      const product = (await resp.json()) as { price: number };
      const total = product.price * quantity;

      // 5b) Persist the order
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          products: { create: [{ productId, quantity }] }
        },
        include: { products: true },
      });

      // 5c) Mark the original request as complete
      await prisma.orderRequest.update({
        where: { requestId },
        data: { orderId: order.id }
      });

      // 5d) Emit the order.created event for downstream services
      await channel.assertExchange('order.events','fanout',{ durable: true });
      channel.publish(
        'order.events',
        '',
        Buffer.from(JSON.stringify({
          orderId: order.id,
          userId:  order.userId,
          items:   order.products.map(p => ({
            productId: p.productId,
            quantity:  p.quantity
          }))
        })),
        { persistent: true }
      );

      // 5e) Acknowledge so RabbitMQ can remove this message
      channel.ack(msg);

    } catch (err) {
      console.error(`Failed to process request ${requestId}:`, err);
      // Even on error, ack to avoid infinite redelivery;
      // you could nack(msg, false, true) to requeue if you prefer retries.
      channel.ack(msg);
    }
  });

  console.log('Order-processor worker started');
}

startWorker().catch(err => {
  console.error('Order-processor crashed', err);
  process.exit(1);
});


