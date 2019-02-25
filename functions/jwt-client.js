const { google } = require('googleapis');
const privatekey = require('../privatekey.json');

exports.jwtClient = new google.auth.JWT(
    privatekey.client_email, null, privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar']
);
