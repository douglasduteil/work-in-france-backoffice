import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { configuration } from "./config";
import { router } from "./routes";
import { monthlyReportScheduler, validityCheckScheduler } from "./scheduler";
import { alertScheduler } from "./scheduler/alert.scheduler";
import { logger } from "./util";

validityCheckScheduler.start();
monthlyReportScheduler.start();
alertScheduler.start();

const app = new Koa();

app.use(bodyParser());
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

app.on("error", (err, ctx: Koa.Context) => {
  logger.error(`[error] ${ctx.originalUrl} `, err);
});

app.listen(configuration.apiPort);
