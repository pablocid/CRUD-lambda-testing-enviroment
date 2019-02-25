const { Stitch, ServerApiKeyCredential, RemoteMongoClient, StitchAppClientConfiguration } = require('mongodb-stitch-server-sdk');

// JzouWlkF5W7s3iNgPkq4sEwIzoQkQAyBnK6hM1e9rBtL3UML86ytGrKMEi1Uj8lT

const client = Stitch.initializeDefaultAppClient('testcms-dfjev', new StitchAppClientConfiguration.Builder().withDataDirectory('/tmp').build());
const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('TestCMS');
let authorization;

async function auth() {
    if (!authorization) {
        authorization = await client.auth.loginWithCredential(new ServerApiKeyCredential('JzouWlkF5W7s3iNgPkq4sEwIzoQkQAyBnK6hM1e9rBtL3UML86ytGrKMEi1Uj8lT'));
    }
    return db;
}


module.exports = {
    auth,
    db,
    client
}