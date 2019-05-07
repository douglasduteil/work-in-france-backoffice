"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("@koa/cors");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const Router = require("koa-router");
const app = new Koa();
app.use(bodyParser());
app.use(cors());
const routeOptions = {
    prefix: '/api'
};
const router = new Router(routeOptions);
router.get(`/hello-world`, (ctx) => {
    ctx.status = 200;
    ctx.body = 'Hello World!!';
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(1337);
//# sourceMappingURL=server.js.map