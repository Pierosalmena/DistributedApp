import {Router} from 'express';
import {getAllOrders, createOrder} from '../controllers/orderController';

const orderRouter = Router();

orderRouter.get('/', getAllOrders);
orderRouter.post('/', createOrder);

export default orderRouter;

