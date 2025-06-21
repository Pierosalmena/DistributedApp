import {Router} from 'express';
import {getAllOrders, createOrder, getOrderById} from '../controllers/orderController';
import {cache} from '../middlewares/cache'

const orderRouter = Router();

orderRouter.get('/', cache(60), getAllOrders);
orderRouter.get('/:orderId', cache(60), getOrderById)
orderRouter.post('/', createOrder);

export default orderRouter;

