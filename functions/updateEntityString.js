const { getAttr, allowDataTypes } = require('./functions');
const { ObjectId } = require('bson');

async function updateEntityString(id, schm, attrId, value, options, db) {
    const recordCollectionName = "records";
    schm = ObjectId(schm);

    const recordCollection = db.collection(recordCollectionName);
    const users = db.collection("users");
    if (!context.user) { return { message: 'unknown user' }; }
    const user = await users.findOne({ email: context.user.data.email });

    if (!options || options && !options.delete) {
        // validate value option

        // select 57fe942a45be360010073dbc
        // check if attribute have input id
        const select = "57fe942a45be360010073dbc";
        const schmCollection = context.services.get("mongodb-atlas").db("TestCMS").collection("schemas");
        const attributeSchm = await schmCollection.findOne({ _id: BSON.ObjectId(attrId) });
        if (!attributeSchm) { return { message: 'Attribute doesn\' exist ' }; }
        const inputId = getAttr(attributeSchm.attributes, 'input', 'reference');

        if (inputId || inputId.toString || inputId.toString() === select) {
            const options = getAttr(attributeSchm.attributes, 'options', 'listOfObj');
            if (Array.isArray(options)) {
                if (options.map(x => x.id).indexOf(value) === -1) {
                    return { error: "the value is not part of the options" }
                }
            }
        }

    }


    const dd = 'string';
    const plantRefAttrId = '57c42f77c8307cd5b82f4486';

    // get registro de la evaluación
    let doc = await recordCollection.findOne({ schm, attributes: { $elemMatch: { id: plantRefAttrId, reference: BSON.ObjectId(id) } } });

    if (!doc) {

        if (options && options.delete) { return { message: "no se puede eliminar el atributo porque no existe el registro" }; }

        doc = {
            schm,
            created: new Date(),
            updated: [{ user: user._id.toString(), date: new Date(), attr: attrId, action: 'create' }],
            attributes: [
                { id: plantRefAttrId, reference: BSON.ObjectId(id) },
                { id: attrId, [dd]: value }
            ]
        };
        return recordCollection.insertOne(doc);
    }

    // si el array attributes no existe  
    if (doc && !Array.isArray(doc.attributes)) { doc.attributes = []; }
    // indice del atributo
    const index = doc.attributes.map(x => x.id).indexOf(attrId);

    // delete attribute | TODO: test
    if (options && options.delete) {
        if (index === -1) { return { message: "el atributo no se puede eliminar porque no existe" } }
        else {
            return recordCollection.updateOne({ _id: doc._id },
                {
                    $pull: { attributes: { id: attrId } },
                    $push: {
                        updated: { user: user._id.toString(), date: new Date(), attr: attrId, action: 'delete' }
                    },
                }
            );
        }
    }

    // update attribute
    if (index === -1) { // if attr don't exist
        return recordCollection.updateOne(
            { _id: doc._id },
            {
                $push: {
                    attributes: { id: attrId, [dd]: value },
                    updated: { user: user._id.toString(), date: new Date(), attr: attrId, action: 'create' }
                },
            }
        );
    } else { // if attr exist
        return recordCollection.updateOne(
            { _id: doc._id, attributes: { $elemMatch: { id: attrId } } },
            {
                $set: { "attributes.$.string": value },
                $push: {
                    updated: { user: user._id.toString(), date: new Date(), attr: attrId, action: 'update' }
                },
            }
        );
    }
}
module.exports = {
    updateEntityString
}