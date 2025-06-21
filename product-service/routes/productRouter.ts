import {Router} from 'express';
import {getAllProducts , getProductById} from '../controllers/productControllers'
import {cache} from '../middlewares/cache';

const productRouter = Router();

productRouter.get('/', cache(30), getAllProducts);         
productRouter.get("/:productID", cache(60), getProductById )

// productRouter.get("/", (req, res) => res.send("All products"));
// productRouter.get("/:productId", (req, res) => {
//     const { productID } = req.params;
//     res.send(`Product ID: ${productID}`) 
// })

export default productRouter