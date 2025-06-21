import {Router} from 'express';
import {getUserById, getAllUsers} from '../controllers/userController'
import {cache} from '../middleware/cache'

const userRouter = Router();

userRouter.get("/", cache(30), getAllUsers);
userRouter.get("/:userID", cache(60), getUserById);

export default userRouter