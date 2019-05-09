import * as cors from '@koa/cors';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import { schedule } from 'node-cron';
import { configuration } from './config';
import { extractorService } from './extract.service';

const app = new Koa();

schedule(configuration.cronValidityCheck, () => {
    extractorService.syncValidityChecks();
});

app.use(bodyParser());
app.use(cors());

const routeOptions: Router.IRouterOptions = {
    prefix: '/api'
}

const router = new Router(routeOptions);

router.get(`/hello-world`, (ctx: Koa.Context) => {
    ctx.status = 200;
    ctx.body = 'Hello World!!'
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(1338);
