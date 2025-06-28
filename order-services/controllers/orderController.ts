import {Request, Response} from 'express';
import { PrismaClient } from '../generated/prisma';
import {redis} from '../cache';
import {connectRabbit} from '../messaging';
import { v4 as uuidv4 } from 'uuid';


const prisma = new PrismaClient();

export async function requestOrder(req: Request, res: Response) {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const requestId = uuidv4();
  await prisma.orderRequest.create({ data: { requestId } });

  const channel = await connectRabbit();

  // 1) Declare the work queue
  await channel.assertQueue('order.requests.queue', { durable: true });

  // 2) Enqueue the job—worker will `consume` from the same queue
  channel.sendToQueue(
    'order.requests.queue',
    Buffer.from(JSON.stringify({ requestId, userId, productId, quantity })),
    { persistent: true }
  );

  // 3) Tell client where to poll
  res
    .status(202)
    .location(`/orders/requests/${requestId}`)
    .json({ requestId, status: 'pending' });
}


export async function getRequestStatus(req:Request, res: Response) {
    const {requestId} = req.params;
    const rec = await prisma.orderRequest.findUnique({
        where: {requestId},
    });
    if (!rec) {
        return res.status(404).json({error: 'Unknown requestId'});
    }
    if (!rec.orderId) {
        return res.json({requestId, status: 'pending'})
    }
    // once completed, return the full order
    const order = await prisma.order.findUnique({
        where: {id: rec.orderId},
        include: { products: true},
    })
    return res.json({requestId, status: 'complete', order});
}


export async function getAllOrders (req: Request, res: Response) {
    try {
        const all = await prisma.order.findMany();
        res.json(all);
    } catch (e) {
        console.error(e)
        res.status(500).json({error: 'Could not fetch orders'})
    }
}

export async function getOrderById (req: Request, res: Response) {
    const {orderId }  = req.params;
    const id = Number(orderId);
    if (isNaN(id)) {
        return res.status(400).json({error: 'Invalid order ID'});
    }

        const order = await prisma.order.findUnique({where: {id}})
        if(!order) {
            return res.status(404).json({error: 'Product not found'})
        }
        return res.json(order);
    
}


// const { PRODUCT_URL = 'http://localhost:3001' } = process.env;

// export async function createOrder(req: Request, res: Response) {
//   try {
//     const { userId, productId, quantity } = req.body;
//     if (!userId || !productId || !quantity) {
//       return res.status(400).json({ error: 'Missing parameters' });
//     }

//     // 1) Fetch latest price from product-service via HTTP
//     const prodRes = await fetch(`${PRODUCT_URL}/${productId}`);
//     if (!prodRes.ok) {
//       return res.status(prodRes.status).json({ error: 'Product not found' });
//     }
//     const product = await prodRes.json() as { price: number };

//     // 2) Compute total and write order in one go
//     const total = product.price * quantity;
//     const order = await prisma.order.create({
//       data: {
//         userId,
//         total,
//         products: { create: [{ productId, quantity }] }
//       },
//       include: { products: true },
//     });

//     // 3) Invalidate order-service Redis caches
//     await redis.del('GET:/orders');
//     await redis.del(`GET:/orders/${order.id}`);

//     // 4) Publish `order.created` event to RabbitMQ
//     const channel = await connectRabbit();
//     await channel.assertExchange('order.events', 'fanout', { durable: true });
//     channel.publish(
//       'order.events',
//       '',
//       Buffer.from(JSON.stringify({
//         orderId: order.id,
//         userId:  order.userId,
//         items:   order.products.map(p => ({
//           productId: p.productId,
//           quantity:  p.quantity
//         }))
//       })),
//       { persistent: true }
//     );

//     // 5) Send back the newly created order (with computed `total`)
//     return res.status(201).json(order);

//   } catch (err) {
//     console.error('createOrder error', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// function before RabittMQ
// export async function createOrder(req: Request, res: Response) {
//     const {userId, productId, quantity} = req.body;

//       // 1. validate user exists

//     const userRes = await fetch(`http://localhost:3002/${userId}`)
//     if (!userRes.ok) return res.status(404).json({error:'User not found'})

//     // 2. Fetch
//     const prodRes = await fetch(`http://localhost:3001/${productId}`)
//     if (!prodRes.ok) return res.status(404).json({error:'Product not found'});
//     const product = await prodRes.json();

//     // 3. Compute total
//     const total = product.price  * quantity

//     // 4. save order
//     const order = await prisma.order.create({
//         data: {
//             userId,
//             total,
//             products: {create: [{productId, quantity}]},
//         },
//         include: {products: true},
//     })

//         // Invalidate caches:
//     await redis.del('GET:/');             // list cache
//     await redis.del(`GET:/${order.id}`);        // single‐item cache (service mounted at '/')


//     res.status(201).json(order);
// }