import * as cors from '@koa/cors';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { schedule } from 'node-cron';
import { configuration } from './config';
import { extractorService } from './extract.service';
import { router } from './routes';

const app = new Koa();

schedule(configuration.cronValidityCheck, () => {
    extractorService.syncValidityChecks();
});

schedule(configuration.cronMontlyReport, () => {
    extractorService.syncMonthlyReportsForPreviousMonth();
});

app.use(bodyParser());
app.use(cors());

router.get(`/hello-world`, (ctx: Koa.Context) => {
    ctx.status = 200;
    ctx.body = 'Hello World!!'
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(configuration.apiPort);
