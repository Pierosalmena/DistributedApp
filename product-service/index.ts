import express from 'express';
import productRouter from "./routes/productRouter";
import './cache';                   // ← <-- this runs cache.ts top–level code

const app = express();

app.use(express.json())

app.use("/", productRouter);


const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})