const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://query1.finance.yahoo.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/v7/finance/chart", // Replace '/api' with '/v7/finance/chart' in the request path
      },
      onProxyReq(proxyReq) {
        // Modify the request headers if needed
        proxyReq.setHeader("Referer", "http://localhost:3000");
      },
    })
  );
};
