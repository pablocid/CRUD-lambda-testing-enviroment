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
        let { entityId, assessSchmId, attrId, value, options, userId } = event;
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
        if (role.indexOf(userRecord.role) <= 0) { throw { error: 'Error: this user role is not allow for updating the database', message: 'Method: static async build, stage: checking user & role (user | admin)' }; }

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
        if (!this.options.remove && this.datatype === 'number' && isNaN(this.value)) { throw { error: `value is not a number`, message: 'Method: constructor, stage: checking the data type' }; }
        if (!this.options.remove && this.datatype === 'string' && typeof this.value !== 'string') { throw { error: `value is not a string`, message: 'Method: constructor, stage: checking the data type' }; }
        if (!this.options.remove && this.datatype === 'boolean' && typeof (this.value) !== 'boolean') { throw { error: `value is not a boolean`, message: 'Method: constructor, stage: checking the data type' }; }
        // transforming date
        if (!this.options.remove && this.datatype === 'date') { try { this.value = new Date(this.value); } catch (error) { } }
        if (!this.options.remove && this.datatype === 'date' && Object.prototype.toString.call(this.value) !== "[object Date]") { throw { error: `value is not a date`, message: 'Method: constructor, stage: checking the data type' }; }
        // TODO: make a check for datatype list ( array of strings)
        if (!this.options.remove && this.datatype === 'list' && !Array.isArray(this.value)) { throw { error: `value is not a array`, message: 'Method: constructor, stage: checking the data type' }; }
        // TODO: implement data type array (array of numbers)

        // checking the formtype
        this.formtypes = ['select', 'select-img', 'number-range', 'textarea', 'date-range', 'multichoice', 'list'];
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
        // checking the datatype
        if (this.datatype === 'string') {
            // checking the formType
            if (this.formtype === 'select' || this.formtype === 'select-img') { return this.attributeSelectEntity(); }
            if (this.formtype === 'textarea') { return this.attrTextareaEntity(); }

            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.`, message: `Method: updateEntity , stage: checking the formType` };
        }

        if (this.datatype === 'number') {
            if (this.formtype === 'number-range') { return this.attrNumberRangeEntity(); }

            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.`, message: `Method: updateEntity, stage: checking the formType` };
        }

        if (this.datatype === 'date') {
            if (this.formtype === 'date-range') { return this.attrDataRangeEntity(); }

            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.`, message: `Method: updateEntity, stage: checking the formType` };
        }

        if (this.datatype === 'list') {
            if (this.formtype === 'multichoice') { return this.attrMultichoiceEntity(); }

            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.`, message: `Method: updateEntity, stage: checking the formType` };
        }

        if (this.datatype === 'value') {
            if (this.formtype === 'list') { return this.attrListEntity(); }

            throw { error: `There is no function for handling entity update for this form type ${this.formtype}.`, message: `Method: updateEntity, stage: checking the formType` };
        }

        throw { error: `There is no function for handling entity update for the data type: ${this.datatype}.`, message: `Method: updateEntity, stage: checking the datatype` };
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
    modifyAttributeEntity(index, actionName) {
        const action = actionName ? actionName : 'modify';
        const query = { _id: this.entityRecord._id };
        if (index === -1) { throw new Error(`modifyAttributeEntity: The index is no set`); }
        const key = `attributes.${index}.${this.datatype}`;
        const up = `attributes.${index}.updates`;
        const updateData = { user: this.userRecord._id.toString(), date: new Date(), value: this.value, action };
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
    listPushAttributeEntity(index) {
        const indexAttr = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        const action = 'push';
        const query = { _id: this.entityRecord._id };

        // checking if the attribute is set and its index
        if (indexAttr === -1) {
            return this.updateRecord(query, {
                $set: { updated: new Date() },
                $push: {
                    attributes: {
                        id: this.attributeSchema._id.toString(),
                        [this.datatype]: [this.value],
                        updates: [{ user: this.userRecord._id.toString(), date: new Date(), action: 'create' }]
                    },
                }
            });
        }

        const key = `attributes.${indexAttr}.${this.datatype}`;
        const up = `attributes.${indexAttr}.updates`;
        const updateData = { user: this.userRecord._id.toString(), date: new Date(), action };
        const updateObject = { $set: { updated: new Date() } };

        if (
            this.entityRecord.attributes[indexAttr].updates &&
            Array.isArray(this.entityRecord.attributes[indexAttr].updates)
        ) {
            updateObject['$push'] = { [up]: updateData };
        } else {
            updateObject['$set'][up] = [updateData];
        }
        if (Array.isArray(this.entityRecord.attributes[indexAttr].value)) {
            // checking if the value exist
            const indexList = this.entityRecord.attributes[indexAttr].value.map(x => x.id).indexOf(this.value.id);
            if (indexList === -1) {
                updateObject['$push'][key] = { $each: [this.value] };
                if (index !== -1) { updateObject['$push'][key]['$position'] = index }
            } else {
                updateObject['$set'][key + '.' + indexList] = this.value;
            }

        } else {
            updateObject['$set'][key] = [this.value];
        }

        return this.updateRecord(query, updateObject);
    }

    // ENTITY FORMTYPES
    attributeSelectEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // checking if the value is an available option
        const options = this.getAttr(this.attributeSchema.attributes, 'options', 'value');
        if (!Array.isArray(options)) { throw { error: `The attribute ${this.attributeSchema._id.toString()} don't have the option's variable or is not an array`, message: `Method: attributeSelectEntity(), stage: checking if the value is an available option ` }; }
        if (options.map(x => x.id).indexOf(this.value) === -1) {
            throw { error: `The attribute ${this.attributeSchema._id.toString()} don't have the option "${this.value}" in the list. Options available ${JSON.stringify(options.map(x => x.id))}`, message: `Method: attributeSelectEntity(), stage: checking if the value is an available option ` };
        }
        // on create
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        // on modify
        else {
            if (this.entityRecord.attributes[index][this.datatype] === this.value) { return { message: 'There is no modification' }; }
            return this.modifyAttributeEntity(index);
        }
    }
    attrNumberRangeEntity() {
        // checking if min max range is set
        let min, max;
        try {
            min = this.attributeSchema.attributes.find(x => x.id === 'minimum')['value'];
            max = this.attributeSchema.attributes.find(x => x.id === 'maximum')['value'];
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
        else {
            if (this.entityRecord.attributes[index][this.datatype] === this.value) { return { message: 'There is no modification' }; }
            return this.modifyAttributeEntity(index);
        }
    }
    attrTextareaEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }
        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        else {
            if (this.entityRecord.attributes[index][this.datatype] === this.value) { return { message: 'There is no modification' }; }
            return this.modifyAttributeEntity(index);
        }
    }
    attrDataRangeEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // checking if min max range is set
        let min, max;
        try {
            min = this.attributeSchema.attributes.find(x => x.id === 'minimum')['value'];
            max = this.attributeSchema.attributes.find(x => x.id === 'maximum')['value'];
        } catch (error) {
            throw { error: `Can't set min or max from ${this.attributeSchema._id.toString()} schema`, message: `Method: attrDataRangeEntity, stage: checking if min max range is set` }
        }
        // checking if min and max are Date
        if (min !== 0 && Object.prototype.toString.call(min) !== "[object Date]") {
            throw { error: `min or max from ${this.attributeSchema._id.toString()} schema are not Date`, message: `Method: attrDataRangeEntity, stage: checking if min are Date.` }
        }
        if (max !== 0 && Object.prototype.toString.call(max) !== "[object Date]") {
            throw { error: `min or max from ${this.attributeSchema._id.toString()} schema are not Date`, message: `Method: attrDataRangeEntity, stage: checking if max are Date.` }
        }

        // validate range min-max
        if (min !== 0 && this.value.getTime() < min) {
            throw { error: `The value ${this.value} is out of min range (${min}-${max})`, message: `Method: attrDataRangeEntity, stage: validate range min` };
        }
        if (max !== 0 && this.value.getTime() > max) {
            throw { error: `The value ${this.value} is out of max range (${min}-${max})`, message: `Method: attrDataRangeEntity, stage: validate range max` };
        }

        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) { return this.createAttributeEntity(); }
        else {
            try {
                if (this.entityRecord.attributes[index][this.datatype] && this.entityRecord.attributes[index][this.datatype].getTime() === this.value.getTime()) { return { message: 'There is no modification' }; }
            } catch (error) { return { message: 'There is no modification' }; }
            return this.modifyAttributeEntity(index);
        }
    }
    attrMultichoiceEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // checking if the options are set
        let options;
        try {
            options = this.attributeSchema.attributes.find(x => x.id === 'options')['value'].map(x => x.id);
        } catch (error) {
            throw { error: `The options of multichoice are not set`, message: `Method: attrMultichoiceEntity, stage: checking if the options are set` };
        }
        // checking if the list value exist in the options
        const notOpt = this.value.filter(x => options.indexOf(x) === -1);
        if (notOpt.length) {
            throw { error: `The value have options that not exist`, message: `Method: attrMultichoiceEntity, stage: checking if the list value exist in the options` };
        }

        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) {
            if (this.options.pop) {
                throw { message: `The attribute do not exist in the entity` };
            }
            if (this.options.push) {
                // TODO
            }
            // order values
            this.value = options.filter(x => this.value.indexOf(x) !== -1);
            return this.createAttributeEntity();
        }
        else {
            const oldValue = Array.isArray(this.entityRecord.attributes[index].list) ? this.entityRecord.attributes[index].list : [];
            if (this.options.push) {
                try {
                    this.value = options.filter(x => oldValue.concat(this.value).indexOf(x) !== -1);
                    return this.modifyAttributeEntity(index, 'push');
                } catch (error) {
                    console.log(error);
                }
            }
            if (this.options.pop) {
                this.value = options.filter(x => oldValue.filter(function (e) { return this.indexOf(e) === -1; }, this.value).indexOf(x) !== -1);
                return this.modifyAttributeEntity(index, 'pop');
            }
            this.value = options.filter(x => this.value.indexOf(x) !== -1);
            return this.modifyAttributeEntity(index);
        }
    }
    attrListEntity() {
        // on remove
        if (this.options.remove) { return this.removeAttributeEntity(); }

        // create or modify
        const index = this.entityRecord.attributes.map(x => x.id).indexOf(this.attributeSchema._id.toString());
        if (index === -1) {
            if (this.options.pop) {
                throw { message: `The attribute do not exist in the entity` };
            }
            if (this.options.push) {
                // TODO
            }
            // order values

            return this.listPushAttributeEntity(-1);
        }
        else {
            if (this.options.push) {
                try {
                    const index = isNaN(this.options.position) ? -1 : this.options.position;
                    return this.listPushAttributeEntity(index);
                } catch (error) {
                    console.log(error);
                }
            }
            if (this.options.pop) {

            }

            throw { error: 'There is no push or pop option', message: `Method: attrListEntity` }
        }
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