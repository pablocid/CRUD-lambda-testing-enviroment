const { getAttr, allowDataTypes } = require('./functions');
const { ObjectId } = require('bson');
const { updateEntityString } = require('./updateEntityString');

async function updateEntity(id, attrId, value, options, db) {

    // getting data type
    const schemasCollection = db.collection("schemas");
    const attrSchema = await schemasCollection.findOne({ _id: ObjectId(attrId) });

    if (!attrSchema || !Array.isArray(attrSchema.attributes)) { return { error: "the attribute schema doesnt exist or do not have data type" } }
    const dd = getAttr(attrSchema.attributes, 'datatype', 'string');

    if (allowDataTypes.indexOf(dd) === -1) { return { error: " Datatype " + dd + " is not allow: " }; }


    if (dd === 'number' && isNaN(value)) { return { error: "value is not a number" }; }
    if (dd === 'boolean' && typeof (value) !== "boolean") { return { error: "value is not a boolean" }; }
    if (dd === 'date' && Object.prototype.toString.call(value) !== "[object Date]") { return { error: "value is not a date" }; }
    if (dd === 'list' && !Array.isArray(value)) { return { error: "value is not an array" }; }


    if (dd === 'string') { return updateEntityString(id, attrId, value, options, db); }
    /*  
      if(dd === 'list'){ 
        return context.functions.execute("updateList", id, schm, attrId, value, options);
        
      }
      
      if(dd === 'number') {
        return context.functions.execute("updateNumber", id, schm, attrId, value, options);
      }
    */

    return { error: " dont exist function handler for this request" };

}




module.exports = {
    updateEntity
}