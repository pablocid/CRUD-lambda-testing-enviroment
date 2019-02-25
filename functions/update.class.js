const { ObjectId } = require('bson');

class UpdateAttribute {
    static OIDChecker(string) { return /^[0-9a-fA-F]{24}$/.test(string); }
    static async build(event, db) {
        const { id, assessSchmId, attrId, value, options, userId } = event;
        // check if doesnt options exist
        if (!options) { options = {}; }

        // checking obligatory parameters format
        if (!UpdateAttribute.OIDChecker(id) || !UpdateAttribute.OIDChecker(attrId)) { throw new Error(" Error: idRef or attrId is not a hex string"); }

        // checking obligatory parameters format
        if (!UpdateAttribute.OIDChecker(userId)) { throw new Error(" Error: userId is not a hex string"); }

        // checking assessSchmId  parameter format
        if (!options.entity && !UpdateAttribute.OIDChecker(assessSchmId)) { throw new Error(" Error: assessSchmId is not a hex string"); }

        const promises = [
            db.collection('users').find({ _id: new ObjectId(userId) }).first(), //userInfo
            db.collection('records').find({ _id: new ObjectId(id) }).first(), // entity
            db.collection('schemas').find({ _id: new ObjectId(assessSchmId) }).first(), // assessment schema
            db.collection('schemas').find({ _id: new ObjectId(attrId) }).first(), // attribute schema
        ];

        let userRecord, entityRecord, entitySchema, assessmentRecord, assessmentSchema, attributeSchema;

        try {
            [userRecord, entityRecord, assessmentSchema, attributeSchema] = await Promise.all(promises);
        } catch (error) {
            throw new Error(error);
        }

        // checking user & role (user | admin)
        const role = ['guess', 'practitioner', 'user', 'admin'];
        if (!userRecord) { throw new Error('Error: User doesn\' exist'); }
        if (role.indexOf(userRecord.role) <= 0) { console.log(userRecord); throw new Error('Error: this user role is not allow for updating the database'); }

        // checking entityRecord
        if (!entityRecord || !Array.isArray(entityRecord.attributes)) { throw new Error('Error: the entity doesnt exist or do not have attributes'); }

        // checking attributeSchema
        if (!attributeSchema || !Array.isArray(attributeSchema.attributes)) { throw new Error('Error: the entity doesnt exist or do not have attributes'); }

        // checking assessmentSchema
        if (!options.entity && !assessmentSchema || !Array.isArray(assessmentSchema.attributes)) { throw new Error('Error: the assessment schema doesnt exist or do not have attributes'); }

        try {
            entitySchema = await db.collection('schemas').find({ _id: new ObjectId(entityRecord.schm) }).first();
        } catch (error) { throw new Error(error); }

        // set and checking assessment record
        if (!options.entity) {
            try {
                assessmentRecord = await db.collection('records').find({ schm: new ObjectId(assessSchmId), reference: ObjectId(id) }).first();
            } catch (error) { throw new Error(error); }
        }

        // checking if the attribute is part of the schema
        if (options.entity) {
            if (!entitySchema || !Array.isArray(entitySchema.attributes)) { throw new Error('Error: the entity schema doesnt exist or do not have attributes'); }
            const attrs = entitySchema.attributes.find(x => x.id === 'attributes');
            if (!attrs || !Array.isArray(attrs.list) || attrs.list.indexOf(attrId) === -1) { throw new Error('Error: the attribute is not part of the entity schema'); }
        } else {
            const attrs = assessmentSchema.attributes.find(x => x.id === 'attributes');
            if (!attrs || !Array.isArray(attrs.list) || attrs.list.indexOf(attrId) === -1) { throw new Error('Error: the attribute is not part of the assessment schema'); }
        }

        return new UpdateAttribute(userRecord, entityRecord, entitySchema, assessmentRecord, assessmentSchema, attributeSchema, value, options, db);
    }

    constructor(userRecord, entityRecord, entitySchema, assessmentRecord, assessmentSchema, attributeSchema, value, options, db) {
        this.userRecord = userRecord;
        this.entityRecord = entityRecord;
        this.entitySchema = entitySchema;
        this.assessmentRecord = assessmentRecord;
        this.assessmentSchema = assessmentSchema;
        this.attributeSchema = attributeSchema;
        this.value = value;
        this.options = options;
        this.entity = options.entity ? true : false;
        this.db = db;
        this.allowDataTypes = ['reference', 'string', 'number', 'boolean', 'date', 'list', 'listOfObj', 'value'];
        this.datatype = this.getAttr(this.attributeSchema.attributes, 'datatype', 'string');
        if (this.allowDataTypes.indexOf(this.datatype) === -1) { throw new Error(`The ${this.datatype} data type doesn't exist.`); }

        // checking the data type
        if (this.datatype === 'number' && isNaN(this.value)) { throw new Error(`value is not a number`); }
        if (this.datatype === 'string' && typeof this.value !== 'string') { throw new Error(`value is not a string`); }
        if (this.datatype === 'boolean' && typeof (this.value) !== 'boolean') { throw new Error(`value is not a boolean`); }
        if (this.datatype === 'date' && Object.prototype.toString.call(this.value) !== "[object Date]") { throw new Error(`value is not a date`); }
        // TODO: make a check for datatype list ( array of strings)
        if (this.datatype === 'list' && !Array.isArray(this.value)) { throw new Error(`value is not a array`); }
        // TODO: implement data type array (array of numbers)

        // checking the formtype
        this.formtypes = ['select', 'select-img', 'number-range'];
        this.formtype = this.getAttr(this.attributeSchema.attributes, 'formtype', 'string');
        if (this.formtypes.indexOf(this.formtype) === -1) { throw new Error('The form type doesn\' exist'); }
    }
    make() {
        if (this.entity) { return this.updateEntity(); }
        else { return this.updateAssessment(); }
    }
    updateEntity() {
        // console.log('updateEntity');
        if (this.datatype === 'string') { return this.attributeStringEntity(); }
        if (this.datatype === 'number') { return this.attributeNumberEntity(); }
        throw new Error(`There is no function for handling entity update for the data type: ${this.datatype}.`);
    }
    updateAssessment() {
        throw new Error(`There is no function for handling assessment update for this data type ${this.datatype}.`);
    }
    attributeNumberEntity() {
        if (this.formtype === 'number-range') { return this.attrNumberRangeEntity(); }
        throw new Error(`There is no function for handling entity update for this form type ${this.formtype}.`);
    }

    async attrNumberRangeEntity() {
        let min, max;
        try {
            min = this.attributeSchema.attributes.find(x => x.id === 'minimum')['number'];
            max = this.attributeSchema.attributes.find(x => x.id === 'maximum')['number'];
        } catch (error) {
            throw new Error(`Can't set min or max from ${this.attributeSchema._id.toString()} schema`);
        }

        // on delete
        if (this.options.delete) { return this.deleteAttributeEntity(); }

        // validate range min-max
        if (this.value < min || this.value > max) { throw new Error(`The value ${this.value} is out of range (${min}-${max})`); }

        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        else { return this.modifyAttributeEntity(index); }
    }

    deleteAttributeEntity() {
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        const query = { _id: this.entityRecord._id };

        if (index === -1) { return { message: "el atributo no se puede eliminar porque no existe" }; }
        else {
            const key = `attributes.${index}.${this.datatype}`;
            const up = `attributes.${index}.updates`;
            const updateData = { user: this.userRecord._id.toString(), date: new Date(), value: null, action: 'delete' };
            const updateObject = {
                $set: {
                    [key]: null, updated: new Date()
                }
            };
            if (
                this.entityRecord.attributes[index].updates &&
                Array.isArray(this.entityRecord.attributes[index].updates)
            ) {
                updateObject['$push'] = { [up]: updateData };
            } else {
                updateObject.$set[up] = [updateData];
            }

            return this.db.collection('records').updateOne(query, updateObject);
        }
    }
    createAttributeEntity() {
        const query = { _id: this.entityRecord._id };
        return this.db.collection('records').updateOne(query, {
            $set: { updated: new Date() },
            $push: {
                attributes: {
                    id: this.attributeSchema._id.toString(),
                    [this.datatype]: this.value,
                    updates: [{ user: this.userRecord._id.toString(), date: new Date(), value: this.value, action: 'create' }]
                },
            }
        });
    }
    modifyAttributeEntity(index) {
        const query = { _id: this.entityRecord._id };
        if (index === -1) { throw new Error(`modifyAttributeEntity: The index is no set`); }
        if (this.entityRecord.attributes[index][this.datatype] === this.value) { return { message: 'There is no modification' }; }
        const key = `attributes.${index}.${this.datatype}`;
        const up = `attributes.${index}.updates`;
        const updateData = { user: this.userRecord._id.toString(), date: new Date(), value: this.value, action: 'modify' };
        const updateObject = {
            $set: {
                [key]: this.value,
                updated: new Date()
            }
        };
        if (
            this.entityRecord.attributes[index].updates &&
            Array.isArray(this.entityRecord.attributes[index].updates)
        ) {
            updateObject['$push'] = { [up]: updateData };
        } else {
            updateObject.$set[up] = [updateData];
        }
        return this.db.collection('records').updateOne(query, updateObject);
    }

    attributeStringEntity() {
        // console.log('attributeStringEntity');
        if (this.formtype === 'select' || this.formtype === 'select-img') { return this.attributeSelectEntity(); }
        throw new Error(`There is no function for handling entity update for this form type ${this.formtype}.`);
    }
    async attributeSelectEntity() {
        // console.log('attributeSelectEntity');
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        const query = { _id: this.entityRecord._id };

        // on delete
        if (this.options.delete) {
            if (index === -1) { return { message: "el atributo no se puede eliminar porque no existe" }; }
            else {
                const key = `attributes.${index}.${this.datatype}`;
                const up = `attributes.${index}.updates`;
                const updateData = { user: this.userRecord._id.toString(), date: new Date(), value: null, action: 'delete' };
                const updateObject = {
                    $set: {
                        [key]: null, updated: new Date()
                    }
                };
                if (
                    this.entityRecord.attributes[index].updates &&
                    Array.isArray(this.entityRecord.attributes[index].updates)
                ) {
                    updateObject['$push'] = { [up]: updateData };
                } else {
                    updateObject.$set[up] = [updateData];
                }

                try {
                    return this.db.collection('records').updateOne(query, updateObject);
                    // return 'OK'
                } catch (error) {
                    console.log('Error en updateONE');
                    throw new Error('Errorsss');
                }
            }
        }

        // checking if the value is an available option
        const options = this.getAttr(this.attributeSchema.attributes, 'options', 'listOfObj');
        if (!Array.isArray(options) || options.map(x => x.id).indexOf(this.value) === -1) { throw new Error(`The attribute ${this.attributeSchema._id.toString()} don't have the option "${this.value}" in the list. Options available ${JSON.stringify(options.map(x => x.id))}`); }

        // on create
        if (index === -1) {
            return this.db.collection('records').updateOne(query, {
                $set: { updated: new Date() },
                $push: {
                    attributes: {
                        id: this.attributeSchema._id.toString(),
                        [this.datatype]: this.value,
                        updates: [{ user: this.userRecord._id.toString(), date: new Date(), value: this.value, action: 'create' }]
                    },
                }
            });
        } else {
            // on modify
            if (this.entityRecord.attributes[index][this.datatype] === this.value) { return { message: 'There is no modification' }; }
            const key2 = `attributes.${index}.${this.datatype}`;
            const up2 = `attributes.${index}.updates`;
            const updateData2 = { user: this.userRecord._id.toString(), date: new Date(), value: this.value, action: 'modify' };
            const updateObject2 = {
                $set: {
                    [key2]: this.value, updated: new Date()
                }
            };
            if (
                this.entityRecord.attributes[index].updates &&
                Array.isArray(this.entityRecord.attributes[index].updates)
            ) {
                updateObject2['$push'] = { [up2]: updateData2 };
            } else {
                updateObject2.$set[up2] = [updateData2];
            }
            return this.db.collection('records').updateOne(query, updateObject2);
        }
        console.log('log', this.entityRecord.attributes[index]);
    }
    getAttr(attrs, id, dd) {
        try { return attrs.find(x => x.id === id)[dd]; }
        catch (error) { return undefined; }
    }
}

module.exports = {
    UpdateAttribute
}