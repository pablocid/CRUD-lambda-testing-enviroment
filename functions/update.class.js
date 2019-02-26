const { ObjectId } = require('bson');

class UpdateAttribute {
    static OIDChecker(string) { return /^[0-9a-fA-F]{24}$/.test(string); }
    static findById(db, collection, id) {
        return db.collection(collection).find({ _id: new ObjectId(id) }).first();
    }
    static findAssessmentRecord(db, idEntity, assessSchmId) {
        return db.collection('records').find({ schm: new ObjectId(assessSchmId), reference: ObjectId(idEntity) }).first();
    }
    static async build(event, db) {
        const { entityId, assessSchmId, attrId, value, options, userId } = event;
        // check if doesnt options exist
        if (!options) { options = {}; }

        // checking obligatory parameters format
        if (!UpdateAttribute.OIDChecker(entityId) || !UpdateAttribute.OIDChecker(attrId)) { throw { error: "idRef or attrId is not a hex string", message: 'Method: static async build, stage: checking obligatory parameters format' }; }

        // checking obligatory parameters format
        if (!UpdateAttribute.OIDChecker(userId)) { throw { error: 'UserId is not a hex string', message: 'Method: static async build, stage: checking obligatory parameters format' }; }

        // checking assessSchmId  parameter format
        if (!options.entity && !UpdateAttribute.OIDChecker(assessSchmId)) { throw { error: "Error: assessSchmId is not a hex string", message: 'Method: static async build, stage: checking obligatory parameters format' }; }

        const promises = [
            UpdateAttribute.findById(db, 'users', userId),
            UpdateAttribute.findById(db, 'records', entityId),
            UpdateAttribute.findById(db, 'schemas', attrId),
        ];
        if (!options.entity) {
            // assessment schema
            promises.push(UpdateAttribute.findById(db, 'schemas', assessSchmId));
        }

        let userRecord, entityRecord, entitySchema, assessmentRecord, attributeSchema, assessmentSchema;

        // make async calling to database
        try {
            [userRecord, entityRecord, attributeSchema, assessmentSchema] = await Promise.all(promises);
        } catch (error) {
            throw { error: 'Problem obtaining user, record or schema from database.', message: 'Method: static async build, stage: make async calling to database' };
        }

        // checking user & role (user | admin)
        const role = ['guess', 'practitioner', 'user', 'admin'];
        if (!userRecord) { throw new Error('Error: User doesn\' exist'); }
        if (role.indexOf(userRecord.role) <= 0) { console.log(userRecord); throw { error: 'Error: this user role is not allow for updating the database', message: 'Method: static async build, stage: checking user & role (user | admin)' }; }

        // checking entityRecord
        if (!entityRecord || !Array.isArray(entityRecord.attributes)) { throw { error: 'Error: the entity doesnt exist or do not have attributes', message: 'Method: static async build, stage: checking entityRecord' }; }

        // checking attributeSchema
        if (!attributeSchema || !Array.isArray(attributeSchema.attributes)) { throw { error: 'Error: the entity doesnt exist or do not have attributes', message: 'Method: static async build, stage: checking attributeSchema' }; }

        // checking assessmentSchema
        if (!options.entity && (!assessmentSchema || !Array.isArray(assessmentSchema.attributes))) { throw { error: 'Error: the assessment schema doesnt exist or do not have attributes', message: 'Method: static async build, stage: checking assessmentSchema' }; }

        // getting entity schema
        try {
            entitySchema = await UpdateAttribute.findById(db, 'schemas', entityRecord.schm);
        } catch (error) { throw { error: 'Problem gettring entity schema', message: 'Method: static async build, stage: getting entity schema' } }

        // set and checking assessment record
        if (!options.entity) {
            try {
                assessmentRecord = await UpdateAttribute.findAssessmentRecord(db, entityId, assessSchmId);
            } catch (error) {
                throw { error: 'Problem gettring assessment record', message: 'Method: static async build, stage: set and checking assessment record' }
            }
        }

        // checking if the attribute is part of the schema
        if (options.entity) {
            if (!entitySchema || !Array.isArray(entitySchema.attributes)) { throw { error: 'Error: the entity schema doesnt exist or do not have attributes', message: 'Method: static async build, stage: checking if the attribute is part of the schema' }; }
            const attrs = entitySchema.attributes.find(x => x.id === 'attributes');
            if (!attrs || !Array.isArray(attrs.value) || attrs.value.indexOf(attrId) === -1) { throw { error: 'Error: the attribute is not part of the entity schema', message: 'Method: static async build, stage: checking if the attribute is part of the schema' }; }
        } else {
            const attrs = assessmentSchema.attributes.find(x => x.id === 'attributes');
            if (!attrs || !Array.isArray(attrs.value) || attrs.value.indexOf(attrId) === -1) { throw { error: 'Error: the attribute is not part of the assessment schema', message: 'Method: static async build, stage: checking if the attribute is part of the schema' }; }
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
        this.datatype = this.getAttr(this.attributeSchema.attributes, 'datatype', 'value');
        // checking allow data type
        if (this.allowDataTypes.indexOf(this.datatype) === -1) { throw { error: `The ${this.datatype} data type doesn't exist.`, message: 'Method: constructor, stage: checking allow data type' } }

        // checking the data type
        if (this.datatype === 'number' && isNaN(this.value)) { throw { error: `value is not a number`, message: 'Method: constructor, stage: checking the data type' }; }
        if (this.datatype === 'string' && typeof this.value !== 'string') { throw { error: `value is not a string`, message: 'Method: constructor, stage: checking the data type' }; }
        if (this.datatype === 'boolean' && typeof (this.value) !== 'boolean') { throw { error: `value is not a boolean`, message: 'Method: constructor, stage: checking the data type' }; }
        if (this.datatype === 'date' && Object.prototype.toString.call(this.value) !== "[object Date]") { throw { error: `value is not a date`, message: 'Method: constructor, stage: checking the data type' }; }
        // TODO: make a check for datatype list ( array of strings)
        if (this.datatype === 'list' && !Array.isArray(this.value)) { throw { error: `value is not a array`, message: 'Method: constructor, stage: checking the data type' }; }
        // TODO: implement data type array (array of numbers)

        // checking the formtype
        this.formtypes = ['select', 'select-img', 'number-range'];
        this.formtype = this.getAttr(this.attributeSchema.attributes, 'formtype', 'value');
        if (this.formtypes.indexOf(this.formtype) === -1) { throw { error: 'The form type doesn\' exist', message: 'Method: constructor, stage: checking the formtype' }; }
    }
    updateRecord(query, updateSetting, options) {
        return this.db.collection('records').updateOne(query, updateSetting, options);
    }
    make() {
        if (this.entity) { return this.updateEntity(); }
        else { return this.updateAssessment(); }
    }
    /******** EDIT ENTITY *********/
    updateEntity() {
        // console.log('updateEntity');
        if (this.datatype === 'string') {
            if (this.formtype === 'select' || this.formtype === 'select-img') { return this.attributeSelectEntity(); }
            if (this.formtype === 'textarea') { return this.attributeSelectEntity(); }
            console.log(new Error(`There is no function for handling entity update for this form type ${this.formtype}.`));
            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.` };
        }
        if (this.datatype === 'number') {
            if (this.formtype === 'number-range') { return this.attrNumberRangeEntity(); }
            console.log(new Error(`There is no function for handling entity update for this form type ${this.formtype}.`));
            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.` };
        }

        console.log(new Error(`There is no function for handling entity update for the data type: ${this.datatype}.`));
        throw { error: `There is no function for handling entity update for the data type: ${this.datatype}.` };
    }
    // ENTITY CRUD
    createAttributeEntity() {
        const query = { _id: this.entityRecord._id };
        return this.updateRecord(query, {
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
        return this.updateRecord(query, updateObject);
    }
    removeAttributeEntity() {
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        const query = { _id: this.entityRecord._id };

        if (index === -1) { return { message: "el atributo no se puede eliminar porque no existe" }; }
        else {
            const key = `attributes.${index}.${this.datatype}`;
            const up = `attributes.${index}.updates`;
            const updateData = { user: this.userRecord._id.toString(), date: new Date(), value: null, action: 'remove' };
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
            return this.updateRecord(query, updateObject);
        }
    }
    // END ENTITY CRUD

    attributeSelectEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // checking if the value is an available option
        const options = this.getAttr(this.attributeSchema.attributes, 'options', 'listOfObj');
        if (!Array.isArray(options)) { throw { error: `The attribute ${this.attributeSchema._id.toString()} don't have the option's variable or is not an array`, message: `Method: attributeSelectEntity(), stage: checking if the value is an available option ` }; }
        if (options.map(x => x.id).indexOf(this.value) === -1) {
            console.log('options is not an array')
            throw { error: `The attribute ${this.attributeSchema._id.toString()} don't have the option "${this.value}" in the list. Options available ${JSON.stringify(options.map(x => x.id))}`, message: `Method: attributeSelectEntity(), stage: checking if the value is an available option ` };
        }
        // on create
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        // on modify
        else { return this.modifyAttributeEntity(index); }
    }
    attrNumberRangeEntity() {
        // checking if min max range is set
        let min, max;
        try {
            min = this.attributeSchema.attributes.find(x => x.id === 'minimum')['number'];
            max = this.attributeSchema.attributes.find(x => x.id === 'maximum')['number'];
        } catch (error) {
            throw { error: `Can't set min or max from ${this.attributeSchema._id.toString()} schema`, message: `Method: attrNumberRangeEntity, stage: checking if min max range is set` }
        }

        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // validate range min-max
        if (this.value < min || this.value > max) {
            throw { error: `The value ${this.value} is out of range (${min}-${max})`, message: `Method: attrNumberRangeEntity, stage: validate range min-max` };
        }

        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        else { return this.modifyAttributeEntity(index); }
    }
    attrTextareaEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }
        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        else { return this.modifyAttributeEntity(index); }
    }
    /******** EDIT ASSESSMENT *********/
    updateAssessment() {
        throw new Error(`There is no function for handling assessment update for this data type ${this.datatype}.`);
    }
    getAttr(attrs, id, dd) {
        try { return attrs.find(x => x.id === id)[dd]; }
        catch (error) { return undefined; }
    }
}

module.exports = {
    UpdateAttribute
}