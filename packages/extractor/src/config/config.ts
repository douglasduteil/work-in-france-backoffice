import { config } from 'dotenv';

config();

export const configuration = {
    dsAPI: process.env.DS_API,
    dsApiLogin: process.env.DS_API_LOGIN,
    dsApiPasssword: process.env.DS_API_PWD,

    kintoAPI: process.env.KINTO_API,
    kintoLogin: process.env.KINTO_LOGIN,
    kintoPassword: process.env.KINTO_PASSWORD,
};

