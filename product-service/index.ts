import express from 'express';
import productRouter from "./routes/productRouter";

const app = express();

app.use(express.json())

app.use("/products", productRouter);


const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})