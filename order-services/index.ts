import express from 'express';
import orderRouter from './routes/orderRouter';

const app = express();

app.use(express.json());

app.use('/', orderRouter);

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})