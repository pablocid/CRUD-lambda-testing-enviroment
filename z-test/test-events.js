const { ObjectId } = require('bson');
const entityRecordOID = '57a8d8deef44961377521c86';
const entitySchemaOID = '57a4e02ec830e2bdff1a1608';
const userId = "5c6db0b4d37f300d1fed14ea";

const resetingTestEvent = [
    {
        command: true,
        name: 'resetting the entity record',
        query: { _id: new ObjectId(entityRecordOID) },
        update: { $set: { attributes: [] } },
        collection: 'records',
    },
    {
        command: true,
        name: 'resetting the entity schema',
        query: { _id: new ObjectId(entitySchemaOID) },
        update: { created: new Date(), attributes: [{ id: 'attributes', value: [] }] },
        collection: 'schemas',
    }
];

// color attribute
const selectAttrOID = '585185360cb9af0011197935';
const selectOptions = [{ id: 'green', label: 'Verde' }, { id: 'red', label: 'Rojo' }];
const selectTestEvent = [
    {
        command: true,
        name: 'resetting the "color_racimo" attribute schema',
        query: { _id: new ObjectId(selectAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'pushing color attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': selectAttrOID } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting datatype in "color_racimo" attribute schema',
        query: { _id: new ObjectId(selectAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'string' } } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting formtype in "color_racimo" attribute schema',
        query: { _id: new ObjectId(selectAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'select-img' } } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting options in "color_racimo" attribute schema',
        query: { _id: new ObjectId(selectAttrOID) },
        update: { $push: { attributes: { id: 'options', value: [] } } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting green option in options array in "color_racimo" attribute schema',
        query: { _id: new ObjectId(selectAttrOID), 'attributes.id': 'options' },
        update: { $set: { 'attributes.$.value': selectOptions } },
        collection: 'schemas',
    },
    {
        name: 'color create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "green",
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'color modify',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "red",
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'color remove',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: selectAttrOID,
        value: "red",
        options: { entity: true, remove: true },
        userId
    },
];

// position attribute 
const numberRangeAttrOID = '5807afe331f55d0010aaffe6';
const numberRangeAttrMin = 0;
const numberRangeAttrMax = 100;
const numberRangeAttrSmaller = -5;
const numberRangeAttrGreater = 150;
const numberRangeAttrValue = 90;
const numberRangeAttrValueModify = 50;

const numberRangeTestEvent = [
    {
        command: true,
        name: 'resetting the numberRange attribute schema',
        query: { _id: new ObjectId(numberRangeAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'numberRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'pushing attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': numberRangeAttrOID } },
        collection: 'schemas',
    },
    {
        name: 'numberRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting numberRange datatype attribute schema',
        query: { _id: new ObjectId(numberRangeAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'number' } } },
        collection: 'schemas',
    },
    {
        name: 'numberRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting formtype in numberRange attribute schema',
        query: { _id: new ObjectId(numberRangeAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'number-range' } } },
        collection: 'schemas',
    },
    {
        name: 'numberRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting min in numberRange attribute schema',
        query: { _id: new ObjectId(numberRangeAttrOID) },
        update: { $push: { attributes: { id: 'minimum', value: numberRangeAttrMin } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting min in numberRange attribute schema',
        query: { _id: new ObjectId(numberRangeAttrOID) },
        update: { $push: { attributes: { id: 'maximum', value: numberRangeAttrMax } } },
        collection: 'schemas',
    },
    {
        name: 'numberRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'numberRange greater than max',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrGreater,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'numberRange smaller than min',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrSmaller,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'numberRange modify',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: numberRangeAttrValueModify,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'numberRange NaN',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: 'HOLA',
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'numberRange delete',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: numberRangeAttrOID,
        value: null,
        options: { entity: true, remove: true },
        userId
    },
];

const textareaAttrOID = '5c77f9098c65f3014e21ed5f';
const textareaRangeAttrValue = 'The text';
const textareaTestEvent = [
    {
        command: true,
        name: 'resetting the "textarea" attribute schema',
        query: { _id: new ObjectId(textareaAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'textarea create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: textareaAttrOID,
        value: textareaRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'pushing textarea attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': textareaAttrOID } },
        collection: 'schemas',
    },
    {
        name: 'textarea create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: textareaAttrOID,
        value: textareaRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting textarea datatype attribute schema',
        query: { _id: new ObjectId(textareaAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'string' } } },
        collection: 'schemas',
    },
    {
        name: 'textarea create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: textareaAttrOID,
        value: textareaRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting formtype in numberRange attribute schema',
        query: { _id: new ObjectId(textareaAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'textarea' } } },
        collection: 'schemas',
    },
    {
        name: 'textarea create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: textareaAttrOID,
        value: textareaRangeAttrValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'textarea create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: textareaAttrOID,
        value: textareaRangeAttrValue,
        options: { entity: true, remove: true },
        userId
    }
];

const dataRangeAttrOID = '5c781f3a8c65f3014e21ed61';
const dataRangeValue = '2018-10-29';
const dataRangeAttrModify = '2018-11-01';
const dataRangeWrongValue = 'hola';
const dataRangeAttrMin = '2018-10-01';
const dataRangeAttrMax = '2018-11-01';
const dataRangeAttrSmaller = '2018-09-01';
const dataRangeAttrGreater = '2018-12-01';

const dataRangeTestEvent = [
    {
        command: true,
        name: 'resetting the "dataRange" attribute schema',
        query: { _id: new ObjectId(dataRangeAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'dataRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'pushing dataRange attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': dataRangeAttrOID } },
        collection: 'schemas',
    },
    {
        name: 'dataRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting dataRange datatype attribute schema',
        query: { _id: new ObjectId(dataRangeAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'date' } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting formtype in dataRange attribute schema',
        query: { _id: new ObjectId(dataRangeAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'date-range' } } },
        collection: 'schemas',
    },
    {
        name: 'dataRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting min in dataRange attribute schema',
        query: { _id: new ObjectId(dataRangeAttrOID) },
        update: { $push: { attributes: { id: 'minimum', value: new Date(dataRangeAttrMin) } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting min in dataRange attribute schema',
        query: { _id: new ObjectId(dataRangeAttrOID) },
        update: { $push: { attributes: { id: 'maximum', value: new Date(dataRangeAttrMax) } } },
        collection: 'schemas',
    },
    {
        name: 'dataRange create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange WrongValue',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeWrongValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange Smaller',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeAttrSmaller,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange Greater',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeAttrGreater,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange remove',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: null,
        options: { entity: true, remove: true },
        userId
    },
    {
        name: 'dataRange Modify',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeAttrModify,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange Modify',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeAttrModify,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'dataRange Modify',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: dataRangeAttrOID,
        value: dataRangeValue,
        options: { entity: true, remove: false },
        userId
    },
];

const multichoiceAttrOID = '5c79732b8c65f3014e21ed77';
const multichoiceValue = ['no_plant'];
const multichoiceValuePush = ['russet', 'millarandaje'];
const multichoiceValuePop = ['no_plant'];
const multichoiceWrongValue = ['no_planta'];
const multichoiceOptions = [
    { id: 'no_plant', label: 'La planta no esta' },
    { id: 'millarandaje', label: 'Racimos con millaranje' },
    { id: 'russet', label: 'Bayas con russet' },
];
const multichoiceTestEvent = [
    {
        command: true,
        name: 'resetting the "multichoice" attribute schema',
        query: { _id: new ObjectId(multichoiceAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        name: 'multichoice create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'pushing multichoice attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': multichoiceAttrOID } },
        collection: 'schemas',
    },
    {
        name: 'multichoice create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting multichoice datatype attribute schema',
        query: { _id: new ObjectId(multichoiceAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'list' } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting formtype in multichoice attribute schema',
        query: { _id: new ObjectId(multichoiceAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'multichoice' } } },
        collection: 'schemas',
    },
    {
        name: 'multichoice create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        command: true,
        name: 'setting options in "multichoise" attribute schema',
        query: { _id: new ObjectId(multichoiceAttrOID) },
        update: { $push: { attributes: { id: 'options', value: multichoiceOptions } } },
        collection: 'schemas',
    },
    {
        name: 'multichoice create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValue,
        options: { entity: true, remove: false },
        userId
    },
    {
        name: 'multichoice push',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValuePush,
        options: { entity: true, remove: false, push: true },
        userId
    },
    {
        name: 'multichoice pop',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValuePop,
        options: { entity: true, remove: false, pop: true },
        userId
    },
    {
        name: 'multichoice wrong',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceWrongValue,
        options: { entity: true, remove: false, push: false },
        userId
    },
    {
        name: 'multichoice remove',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: null,
        options: { entity: true, remove: true, push: false },
        userId
    },
    {
        name: 'multichoice pop',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValuePop,
        options: { entity: true, remove: false, pop: true },
        userId
    },
    {
        name: 'multichoice push',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: multichoiceAttrOID,
        value: multichoiceValuePush,
        options: { entity: true, remove: false, push: true },
        userId
    },
];

const listAttrOID = '5c7d7ef25e5bfd015502fad2';
const listValues = [{ id: '1', value: 'hola' }, { id: '2', value: 'como' }, { id: '3', value: 'estas' }, { id: '3', value: 'estás' }];
const listValuePush = { id: '1928374981kh', value: 'bien' };
const listValuePop = { id: '1' };
const listReorder = { id: '3', index: 0 };
const listWrongValue = [];

const listTestEvent = [
    {
        command: true,
        name: 'resetting the "list" attribute schema',
        query: { _id: new ObjectId(listAttrOID) },
        update: { created: new Date(), attributes: [] },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'pushing list attributes in schema',
        query: { _id: new ObjectId(entitySchemaOID), 'attributes.id': 'attributes' },
        update: { $push: { 'attributes.$.value': listAttrOID } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting list datatype attribute schema',
        query: { _id: new ObjectId(listAttrOID) },
        update: { $push: { attributes: { id: 'datatype', value: 'value' } } },
        collection: 'schemas',
    },
    {
        command: true,
        name: 'setting formtype in list attribute schema',
        query: { _id: new ObjectId(listAttrOID) },
        update: { $push: { attributes: { id: 'formtype', value: 'list' } } },
        collection: 'schemas',
    },
    {
        name: 'multichoice create',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: listAttrOID,
        value: listValues[0],
        options: { entity: true, push: true },
        userId
    },
    {
        name: 'multichoice push',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: listAttrOID,
        value: listValues[1],
        options: { entity: true, push: true },
        userId
    },
    {
        name: 'multichoice push in 0 position',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: listAttrOID,
        value: listValues[2],
        options: { entity: true, push: true, position: 0 },
        userId
    },
    {
        name: 'multichoice modify a value',
        entityId: entityRecordOID,
        assessSchmId: "",
        attrId: listAttrOID,
        value: listValues[3],
        options: { entity: true, push: true, position: 0 },
        userId
    },
];
module.exports = {
    resetingTestEvent,
    selectTestEvent,
    numberRangeTestEvent,
    textareaTestEvent,
    dataRangeTestEvent,
    multichoiceTestEvent,
    listTestEvent
}