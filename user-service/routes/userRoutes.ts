import {Router} from 'express';
import {getUserById, getAllUsers} from '../controllers/userController'

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:userID", getUserById);

export default userRouter