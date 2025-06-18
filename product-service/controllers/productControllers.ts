import { PrismaClient } from '../generated/prisma';
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function getAllProducts(req: Request,res: Response) {
    try{
    const all = await prisma.product.findMany()
    res.json(all);
    } catch (e) {
        console.error(e)
        res.status(500).json({error: 'Could not fetch products'})
    }
}

export async function getProductById(req: Request, res: Response) {
    const { productID } = req.params;
    const id = Number(productID);
    if (isNaN(id)) {
        return res.status(400).json({error: 'Invalid product ID'});
    }

    const product = await prisma.product.findUnique({where: {id}});
    if (!product) {
        return res.status(404).json({error: 'Product not found'})
    }

    return res.json(product)
}



// productRouter.get("/", (req, res) => res.send("All products"));
// productRouter.get("/:productId", (req, res) => {
//     const { productID } = req.params;
//     res.send(`Product ID: ${productID}`) 
// })