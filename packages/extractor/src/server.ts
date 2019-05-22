import * as cors from '@koa/cors';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { configuration } from './config';
import { router } from './routes';
import { monthlyReportScheduler, validityCheckScheduler } from './scheduler';

validityCheckScheduler.start();
monthlyReportScheduler.start();

const app = new Koa();

app.use(bodyParser());
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(configuration.apiPort);
