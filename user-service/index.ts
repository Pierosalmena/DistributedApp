import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

//Middleware, routes setup, etc.

app.use(express.json());
app.use('/users', userRoutes)


const PORT = 3002;
app.listen(PORT, () => {
    console.log(`User service running on ${PORT}!`)
})