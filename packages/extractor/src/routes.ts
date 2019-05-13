import * as Koa from 'koa';
import * as Router from 'koa-router';
import { configuration } from './config';
import { extractorService } from './extract.service';

const routeOptions: Router.IRouterOptions = {
    prefix: '/api'
}

const router = new Router(routeOptions);

// monthly-reports - launch global synchronisation
router.post(`/${configuration.apiPrefix}/monthly-reports/sync-all`, (ctx: Koa.Context) => {
    extractorService.launchGlobalMonthlyReportSynchro();
    ctx.status = 200;
    ctx.message = "[Monthly Reports] Global synchonisation launched"
});

export { router };

