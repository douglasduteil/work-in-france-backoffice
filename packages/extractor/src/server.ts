import * as cors from '@koa/cors';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { schedule } from 'node-cron';
import { configuration } from './config';
import { extractorService } from './extract.service';
import { router } from './routes';
import { monthlyreportService } from './service/monthly-report.service';

const app = new Koa();

if (configuration.validityCheckEnable) {
    schedule(configuration.validityCheckCron, () => {
        extractorService.syncValidityChecks();
    });
}

schedule(configuration.cronMontlyReport, () => {
    extractorService.syncMonthlyReportsForPreviousMonth();
});

monthlyreportService.generateMonthlyReports();

app.use(bodyParser());
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(configuration.apiPort);
