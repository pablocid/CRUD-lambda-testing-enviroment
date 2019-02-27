const { ObjectId } = require('bson');
const resetingTestEvent = [
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
        update: { created: new Date(), attributes: [{ id: 'attributes', value: [] }] },
        collection: 'schemas',
    }
];
const selectTestEvent = [
    {
        command: true,
        name: 'resetting the "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935") },
        update: { created: new Date(), attributes: [] },
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
        name: 'pushing color attributes in schema',
        query: { _id: new ObjectId("57a4e02ec830e2bdff1a1608"), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': '585185360cb9af0011197935' } },
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
    {
        command: true,
        name: 'setting options in "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935") },
        update: { $push: { attributes: { id: 'options', value: [] } } },
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
        name: 'setting green option in options array in "color_racimo" attribute schema',
        query: { _id: new ObjectId("585185360cb9af0011197935"), 'attributes.id': 'options' },
        update: { $set: { 'attributes.$.value': [{ id: 'green', label: 'Verde' }, { id: 'red', label: 'Rojo' }] } },
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
        name: 'color modify',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "red",
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'color remove',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "585185360cb9af0011197935",
        value: "red",
        options: { entity: true, remove: true },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
];
const numberRangeTestEvent = [
    {
        command: true,
        name: 'resetting the "position" attribute schema',
        query: { _id: new ObjectId("5807afe331f55d0010aaffe6") },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'position create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 90,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'pushing position attributes in schema',
        query: { _id: new ObjectId("57a4e02ec830e2bdff1a1608"), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': '5807afe331f55d0010aaffe6' } },
        collection: 'schemas',
    },
    {
        name: 'position create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 90,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'setting datatype in "position" attribute schema',
        query: { _id: new ObjectId("5807afe331f55d0010aaffe6") },
        update: { $push: { attributes: { id: 'datatype', value: 'number' } } },
        collection: 'schemas',
    },
    {
        name: 'position create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 90,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'setting formtype in "position" attribute schema',
        query: { _id: new ObjectId("5807afe331f55d0010aaffe6") },
        update: { $push: { attributes: { id: 'formtype', value: 'number-range' } } },
        collection: 'schemas',
    },
    {
        name: 'position create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 90,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        command: true,
        name: 'setting min in "position" attribute schema',
        query: { _id: new ObjectId("5807afe331f55d0010aaffe6") },
        update: { $push: { attributes: { id: 'minimum', value: 0 } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting min in "position" attribute schema',
        query: { _id: new ObjectId("5807afe331f55d0010aaffe6") },
        update: { $push: { attributes: { id: 'maximum', value: 100 } } },
        collection: 'schemas',
    },
    {
        name: 'position create',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 90,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'position greater than max',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 190,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'position smaller than min',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: -10,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'position modify',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 50,
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'position NaN',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: 'HOLA',
        options: { entity: true, remove: false },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
    {
        name: 'position delete',
        entityId: "57a8d8deef44961377521c86",
        assessSchmId: "",
        attrId: "5807afe331f55d0010aaffe6",
        value: null,
        options: { entity: true, remove: true },
        userId: "5c6db0b4d37f300d1fed14ea"
    },
];


module.exports = {
    resetingTestEvent,
    selectTestEvent,
    numberRangeTestEvent,
}