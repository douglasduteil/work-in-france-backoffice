global.fetch = require("node-fetch");
global.Headers = fetch.Headers;

const configs = require('./config');
const api = require('./kinto-api');

const init = async () => {
    await api.createAdmin(configs.adminLogin, configs.adminPassword);
    await api.createBucket('wif_public');
    await api.createCollection('wif_public','alerts');
    await api.createCollection('wif_public','monthly_reports');
    await api.createCollection('wif_public','synchro_histories');
    await api.createCollection('wif_public','validity_checks');
}

init();

