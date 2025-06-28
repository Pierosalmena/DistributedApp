import express from 'express';
import orderRouter from './routes/orderRouter';
import dotenv from 'dotenv';
import './orderProcessor';  // fire up the background consumer

import { connectRabbit } from './messaging';

dotenv.config();

async function start() {
    // 1) Establish Rabbit connection
    await connectRabbit();

    // 2 Start Express
const app = express();
app.use(express.json());
app.use('/', orderRouter);

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
}

start().catch(err => {
    console.error('Failed to start order-service', err);
    process.exit(1);
})

