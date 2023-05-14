const express = require('express');
const morgan = require("morgan");
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
  exposedHeaders: ['x-credentials-request-token'],
}));

app.use(morgan('dev'));

app.use('/green_api', createProxyMiddleware({
  target: "https://api.green-api.com",
  secure: false,
  changeOrigin: true,
  pathRewrite: {
    [`^/green_api`]: '',
  },
}));

const PORT = 3001;
const HOST = "localhost";

app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
