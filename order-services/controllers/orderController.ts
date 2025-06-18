import {Request, Response} from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function getAllOrders (req: Request, res: Response) {
    try {
        const all = await prisma.order.findMany();
        res.json(all);
    } catch (e) {
        console.error(e)
        res.status(500).json({error: 'Could not fetch orders'})
    }
}

export async function createOrder(req: Request, res: Response) {
    const {userId, productId, quantity} = req.body;

      // 1. validate user exists

    const userRes = await fetch(`http://localhost:3002/users/${userId}`)
    if (!userRes.ok) return res.status(404).json({error:'User not found'})

    // 2. Fetch
    const prodRes = await fetch(`http://localhost:3001/products/${productId}`)
    if (!prodRes.ok) return res.status(404).json({error:'Product not found'});
    const product = await prodRes.json();

    // 3. Compute total
    const total = product.price  * quantity

    // 4. save order
    const order = await prisma.order.create({
        data: {
            userId,
            total,
            products: {create: [{productId, quantity}]},
        },
        include: {products: true},
    })
    res.status(201).json(order);
}