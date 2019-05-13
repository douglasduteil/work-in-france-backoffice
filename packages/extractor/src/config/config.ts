import { config } from 'dotenv';

config();

const asString = (arg: any): string => {
    const res = process.env[arg]
    if (!res) {
        throw new Error(`env variable ${arg} is required`);
    }
    return res;
}

const asNumber = (arg: any): number => {
    const res = process.env[arg]
    if (!res) {
        throw new Error(`env variable ${arg} is required`);
    }
    return Number.parseInt(res, 10);
}

export const configuration = {
    dsAPI: asString('DS_API'),
    dsApiLogin: asString('DS_API_LOGIN'),
    dsApiPasssword: asString('DS_API_PASSWORD'),

    kintoAPI: asString('KINTO_API'),
    kintoLogin: asString('KINTO_LOGIN'),
    kintoPassword: asString('KINTO_PASSWORD'),

    apiPrefix: asString('API_PREFIX'),
    // tslint:disable-next-line: object-literal-sort-keys
    apiPort: asNumber('API_PORT'),

    cronValidityCheck: asString('CRON_VALIDITY_CHECK'),
    // tslint:disable-next-line: object-literal-sort-keys
    cronMontlyReport: asString('CRON_MONTHLY_REPORT'),
};

