import {Router} from 'express';

const productRouter = Router();

import {getAllProducts , getProductById} from '../controllers/productControllers'

productRouter.get("/", getAllProducts )
productRouter.get("/:productID", getProductById )

// productRouter.get("/", (req, res) => res.send("All products"));
// productRouter.get("/:productId", (req, res) => {
//     const { productID } = req.params;
//     res.send(`Product ID: ${productID}`) 
// })

export default productRouter