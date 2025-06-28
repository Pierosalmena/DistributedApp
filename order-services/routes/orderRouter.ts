import {Router} from 'express';
import {getAllOrders, requestOrder, getRequestStatus, getOrderById} from '../controllers/orderController';
import {cache} from '../middlewares/cache'

const orderRouter = Router();

orderRouter.get('/', cache(60), getAllOrders);
orderRouter.get('/:orderId', cache(60), getOrderById)
orderRouter.post('/', requestOrder);
orderRouter.get('/requests/:requestId', getRequestStatus);


export default orderRouter;

