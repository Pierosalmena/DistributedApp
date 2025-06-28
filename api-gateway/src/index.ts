import express from 'express';
import { createProxyMiddleware} from 'http-proxy-middleware'
import dotenv from 'dotenv';

const result = dotenv.config();

if (result.error) {
  console.error('⚠️  Could not load .env file', result.error);
} else {
  console.log('✅  Loaded env:', result.parsed);
}

const app = express();

const {
    PORT = '8080',
    USER_URL,
    PRODUCT_URL,
    ORDER_URL
} = process.env;


app.use((req, _res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
    '/users',
    createProxyMiddleware({
        target: USER_URL,
        changeOrigin: true,
        pathRewrite: {'^/users': ''},
    })
)

app.use(
  '/products',
  createProxyMiddleware({
    target: PRODUCT_URL,
    changeOrigin: true,
    pathRewrite: { '^/products': '' },
  })
  );


app.use(
    '/orders',
    createProxyMiddleware({
        target: ORDER_URL,
        changeOrigin: true,
        pathRewrite: { '^/orders': ''},
    })
);

app.use(
  ''
)

// Fallback for unmatched
//app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(parseInt(PORT, 10), () => {
    console.log(`API Gateway listening on port ${PORT}`)
})

