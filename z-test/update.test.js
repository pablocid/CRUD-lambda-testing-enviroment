const { auth, db, client } = require('../functions/stitch');
const { UpdateAttribute } = require('../functions/update.class');
const { ObjectId } = require('bson');
const { writeFileSync } = require('fs');
const events = [
    {
        command: true,
        name: 'resetting the entity record',
        query: { _id: new ObjectId('57a8d8deef44961377521c86') },
        update: { $set: { attributes: [] } },
        collection: 'records',
    },
    {
        command: true,
        name: 'resetting the entity schema',
        query: { _id: new ObjectId("57a4e02ec830e2bdff1a1608") },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'resetting the "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935") },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    }, // end RESTTING
    {
        name: 'color create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "green",
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'pushing color attributes in schema',
        query: { _id: new ObjectId("57a4e02ec830e2bdff1a1608") },
        update: { $set: { 'attributes': [{ id: 'attributes', value: ['585185360cb9af0011197935'] }] } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "green",
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'setting datatype in "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935") },
        update: { $push: { attributes: { id: 'datatype', value: 'string' } } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "green",
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'setting formtype in "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935") },
        update: { $push: { attributes: { id: 'formtype', value: 'select-img' } } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "green",
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    // {
    //     name: 'position create',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 90,
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     command: true,
    //     name: 'pushing color attributes in schema',
    //     query: { _id: new ObjectId("57a4e02ec830e2bdff1a1608"), 'attributes.id': 'attributes' },
    //     update: { $push: { 'attributes.$.value': '5807afe331f55d0010aaffe6' } },
    //     collection: 'schemas',
    // },
    // {
    //     name: 'position create',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 90,
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'position modify',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 97,
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'position large than max',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 500,
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'position smaller than min',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 0,
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'position NaN',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 'HOLA',
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'position remove',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5807afe331f55d0010aaffe6",
    //     value: 97,
    //     options: { entity: true, remove: true },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // }
]

async function testing(event, db) {
    try { await auth(); }
    catch (error) { return false; }

    let updater;
    try { updater = await UpdateAttribute.build(event, db); }
    catch (error) { return { ...error, from: 'UpdateAttribute.build' }; }

    try { return await updater.make(); }
    catch (error) { return { ...error, from: 'updater.make' }; }
}

async function updateCollection(collection, query, update) {
    return db.collection(collection).updateOne(query, update);
}

async function makeTest(events, db) {
    try { await auth(); }
    catch (error) {
        console.log('Error auth();', error);
        client.close();
        return;
    }

    for (let i = 0; i < events.length; i++) {
        console.log('Event ' + i);
        try {
            const e = events[i];
            if (e.bypass) {
                events[i] = { message: 'bypassing: ' + e.name };
                continue;
            };
            if (e.command) {
                events[i] = { name: e.name };
                await updateCollection(e.collection, e.query, e.update);
            } else {
                events[i] = { name: e.name, ...await testing(e, db) };
            }
        } catch (error) {
            console.log('Uncatch trhow error', error);
        }
    }

    console.log('getting the record & schema');
    const doc = await db.collection('records').find({ _id: new ObjectId('57a8d8deef44961377521c86') }).first();
    const schm = await db.collection('schemas').find({ _id: new ObjectId("57a4e02ec830e2bdff1a1608") }).first();
    client.close();
    console.log('writing the results');
    writeFileSync('z-test/results.json', JSON.stringify(events), { encoding: 'utf8' });
    writeFileSync('z-test/entity.json', JSON.stringify(doc), { encoding: 'utf8' });
    writeFileSync('z-test/entity-schema.json', JSON.stringify(schm), { encoding: 'utf8' });
    console.log('OK');
}

makeTest(events, db);












// {
    //     name: 'color modify',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "585185360cb9af0011197935",
    //     value: "red",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'color option error',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "585185360cb9af0011197935",
    //     value: "blue",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'color remove',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "585185360cb9af0011197935",
    //     value: "",
    //     options: { entity: true, remove: true },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'color modify',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "585185360cb9af0011197935",
    //     value: "black",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name: 'color message "No modification"',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "585185360cb9af0011197935",
    //     value: "black",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5bd14b4bd71ef20014e4b327",
    //     value: "selected",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5bd14b4bd71ef20014e4b327",
    //     value: "no-selected",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // {
    //     name:'selection modify',
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5bd14b4bd71ef20014e4b327",
    //     value: "no_selected",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // { // selection remove
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5bd14b4bd71ef20014e4b327",
    //     value: "",
    //     options: { entity: true, remove: true },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },
    // { // selection remove
    //     entityId: "57a8d8deef44961377521c86",
    //     assessSchmId: "",
    //     attrId: "5bd14b4bd71ef20014e4b327",
    //     value: "observation",
    //     options: { entity: true, remove: false },
    //     userId: "5c6db0b4d37f300d1fed14ea"
    // },