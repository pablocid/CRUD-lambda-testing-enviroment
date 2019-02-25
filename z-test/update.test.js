const { auth, db, client } = require('../functions/stitch');
const { UpdateAttribute } = require('../functions/update.class');

var id = "57a8d8deef44961377521c86";
var assessSchmId = "5babd468509768341d0e990f";
// var attrId = "585185360cb9af0011197935"; //color de racimo
// var attrId = "5bd14b4bd71ef20014e4b327" // selection
var attrId = "5807afe331f55d0010aaffe6"; // posicion
var value = 97;//"black";
var userId = "5c6db0b4d37f300d1fed14ea";
// db.collection('asdf').updateOne()
// Entity test
var options = { entity: true, delete: false };

const event = { id, assessSchmId, attrId, value, options, userId };

auth().then(() => {

    UpdateAttribute.build(event, db)
        .then(x => {
            try {
                x.make().then(x => console.log(x));
            } catch (error) {
                console.log(error);
            }
            client.close();
        })
        .catch(x => {
            console.log(`Error: ${x}`);
            client.close();
        });

});
