import { createReadStream, createWriteStream } from "fs";
import * as Koa from "koa";
import * as Router from "koa-router";
import { fileSync } from "tmp";
import { configuration } from "./config";
import { extractorService } from "./extract.service";
import { monthlyreportService } from "./service";
import { alertService } from "./service/alert/alert.service";
import { getMonthlyReportFilename } from "./service/monthly-report/monthly-report.util";
import { mimeTypes } from "./util";

const routeOptions: Router.IRouterOptions = {
  prefix: "/api"
};

const router = new Router(routeOptions);

// monthly-reports - launch global synchronisation
router.post(
  `/${configuration.apiPrefix}/monthly-reports/sync-all`,
  (ctx: Koa.Context) => {
    extractorService.launchGlobalMonthlyReportSynchro();
    ctx.status = 200;
    ctx.message = "[Monthly Reports] Global synchonisation launched";
  }
);

router.get(
  `/${configuration.apiPrefix}/monthly-reports/:year/:month/:group/download`,
  async (ctx: Koa.Context) => {
    const groupId = ctx.params.group;
    const year = ctx.params.year;
    const month = ctx.params.month - 1;

    const tempFileName = fileSync();
    const writeStream = createWriteStream(tempFileName.name);
    await monthlyreportService.writeMonthlyReportExcel(
      year,
      month,
      groupId,
      writeStream
    );

    const readStream = createReadStream(tempFileName.name);
    ctx.res.setHeader(
      "Content-disposition",
      "attachment; filename=" + getMonthlyReportFilename(year, month, groupId)
    );
    ctx.res.setHeader("Content-type", mimeTypes.excel);
    ctx.body = readStream;

    tempFileName.removeCallback();
  }
);

router.get(
  `/${configuration.apiPrefix}/alerts/download`,
  async (ctx: Koa.Context) => {
    const tempFileName = fileSync();
    const writeStream = createWriteStream(tempFileName.name);
    await alertService.writeAlerts(writeStream);

    const readStream = createReadStream(tempFileName.name);
    ctx.res.setHeader(
      "Content-disposition",
      "attachment; filename=" + `WIF_dossiers-en-souffrance.xlsx`
    );
    ctx.res.setHeader("Content-type", mimeTypes.excel);
    ctx.body = readStream;

    tempFileName.removeCallback();
  }
);

export { router };
