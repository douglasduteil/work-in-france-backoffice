import * as cors from '@koa/cors';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import { extractorService } from './extract.service';
import { logger } from './util';

const app = new Koa();

extractorService.syncValidityChecks().subscribe({
    complete: () => logger.info(`[ExtractorService.syncValidityChecks] completed`),
    next: next => logger.info(`[ExtractorService.syncValidityChecks] check `, next)
})

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
