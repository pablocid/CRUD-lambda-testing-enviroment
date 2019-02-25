const { getAttr, OIDChecker, allowDataTypes } = require('./functions/functions');
const { updateEntity } = require('./functions/updateEntity');
const { db, auth, client } = require('./functions/stitch');
const { ObjectId } = require('bson');
const { Update } = require('./functions/update.class')

exports.handler = async (event) => {
  // check if event is set
  if (!event) { client.close(); return 'Error: no event'; }
  const { id, schm, attrId, value, options, userId } = event;

  // ckeck login
  await auth();

  const updater = await Update.build(event, db);

  // check if doesnt options exist
  if (!options) { options = {}; }

  // checking obligatory parameters format
  if (!OIDChecker(id) || !OIDChecker(attrId)) { return { error: " Error: idRef or attrId is not a hex string" }; }

  // execute function if is update entity
  if (options.entity) { return updateEntity(id, attrId, value, options, db); }

  // checking schm  parameter format
  if (!OIDChecker(schm)) { return { error: " Error: schm is not a hex string" }; }

  // getting data type
  const schemasCollection = db.collection("schemas");
  const schema = await schemasCollection.find({ _id: ObjectId(schm) }).first();

  // checking if attribute is part of schema
  if (!schema || !Array.isArray(schema.attributes)) { return { error: "Error: the schema doesnt exist in database or do not have attributes" } }
  const attributeList = getAttr(schema.attributes, "attributes", "list");
  if (attributeList.indexOf(attrId) === -1) { return { error: "Error: the attribute is no part of the schema" }; }

  const attrSchema = await schemasCollection.find({ _id: ObjectId(attrId) }).first();
  // checking if attribute is part of schema
  if (!attrSchema || !Array.isArray(attrSchema.attributes)) { return { error: "Error: the attrSchema doesnt exist in database or do not have attributes" }; }
  const dd = getAttr(attrSchema.attributes, 'datatype', 'string');
  if (allowDataTypes.indexOf(dd) === -1) { return { error: " Datatype " + dd + " is not allow: " }; }

  // checking the data type
  if (dd === 'number' && isNaN(value)) { return { error: "value is not a number" }; }
  if (dd === 'boolean' && typeof (value) !== "boolean") { return { error: "value is not a boolean" }; }
  if (dd === 'date' && Object.prototype.toString.call(value) !== "[object Date]") { return { error: "value is not a date" }; }
  if (dd === 'list' && !Array.isArray(value)) { return { error: "value is not an array" }; }

  // executing the right function
  if (dd === 'string') { return context.functions.execute("updateString", id, schm, attrId, value, options); }
  if (dd === 'list') { return context.functions.execute("updateList", id, schm, attrId, value, options); }
  if (dd === 'number') { return context.functions.execute("updateNumber", id, schm, attrId, value, options); }

  // const _id = new ObjectId(event._id);
  // await auth();
  // const record = await db.collection('records').find({ _id }).first();

  // if (!record) { client.close(); return 'Error: no record'; }
  // const sheetUrl = getAttr(record.attributes, "sheetUrl", "string");
  // const worksheetNames = getAttr(record.attributes, "worksheets", "list");
  // const temporada = getAttr(record.attributes, "temporada", "string");
  // const season = getAttr(record.attributes, "season", "number");

  // const worksheetsValues = await gs_download_worksheets(sheetIdFromUrl(sheetUrl), worksheetNames);

  // const match = makeMatch(worksheetsValues).map(x => {
  //   x.temporada = temporada;
  //   x.season = season;
  //   x.reference = _id;
  //   x.schema = 'variety';
  //   return x;
  // });

  // // return match;


  // await db.collection('records').deleteMany({ reference: _id });
  // await db.collection('records').insertMany(match);

  // const headers = await gs_download_worksheets_headers(sheetIdFromUrl(sheetUrl), worksheetNames);
  // const categories = await gs_column_worksheet(sheetIdFromUrl(sheetUrl), 'categories');

  // record.attributes = updateAttr(record.attributes, 'headers', 'value', headers);
  // record.attributes = updateAttr(record.attributes, 'categories', 'value', categories);

  // const update = await db.collection('records').updateOne(
  //   { _id },
  //   {
  //     $set: {
  //       updated: new Date(),
  //       attributes: record.attributes
  //     }
  //   }
  // );

  // client.close();
  // return 'ok';

};

