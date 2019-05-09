import { config } from 'dotenv';

config(); 

const asString = (arg: any): string => {
    const res = process.env[arg]
    if (!res) {
        throw new Error(`env variable ${arg} is required`);
    }
    return res;
}

export const configuration = {
    dsAPI: asString('DS_API'),
    dsApiLogin: asString('DS_API_LOGIN'),
    dsApiPasssword: asString('DS_API_PASSWORD'),

    kintoAPI: asString('KINTO_API'),
    kintoLogin: asString('KINTO_LOGIN'),
    kintoPassword: asString('KINTO_PASSWORD'),
};

