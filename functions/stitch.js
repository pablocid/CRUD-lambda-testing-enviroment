const { Stitch, ServerApiKeyCredential, RemoteMongoClient, StitchAppClientConfiguration } = require('mongodb-stitch-server-sdk');

const client = Stitch.initializeDefaultAppClient('testcms-dfjev', new StitchAppClientConfiguration.Builder().withDataDirectory('/tmp').build());
const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('TestCMS');
let authorization;

async function auth() {
    if (!authorization) {
        authorization = await client.auth.loginWithCredential(new ServerApiKeyCredential());
    }
    return db;
}


module.exports = {
    auth,
    db,
    client
}
