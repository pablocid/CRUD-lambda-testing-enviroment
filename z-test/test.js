// agroinformatica@labtracker-1533690068175.iam.gserviceaccount.com
const { handler } = require('../index');

const event = {
    _id: '5c37f25159be0156682e4271'
}

const { writeFileSync } = require('fs');
handler(event)
    .then(x => {
        console.log(x)
        // writeFileSync('./z-test/data.json', JSON.stringify(x), {encoding: 'utf8'});
    });

