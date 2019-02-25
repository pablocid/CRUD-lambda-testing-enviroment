const { google } = require('googleapis');
const { jwtClient } = require('./jwt-client');
const sheets = google.sheets('v4');

exports.gs_write_data = async function (spreadsheetId, range, values) {
    return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
        auth: jwtClient
    });
}

exports.gs_clean_worksheet = function (spreadsheetId, range) {

    return sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
        auth: jwtClient
    });

}

exports.gs_create_worksheet = async function (spreadsheetId, title) {

    let requests = [];

    requests.push({
        "addSheet": {
            "properties": {
                title
            }
        }
    });
    const batchUpdateRequest = { requests };
    const result = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: batchUpdateRequest,
        auth: jwtClient
    })

    return result.status;
}

exports.gs_download_worksheets = async function (spreadsheetId, ranges) {

    const result = await sheets.spreadsheets.values
        .batchGet({
            spreadsheetId,
            auth: jwtClient,
            ranges,
            majorDimension: "ROWS",
            dateTimeRenderOption: "SERIAL_NUMBER",
            valueRenderOption: "UNFORMATTED_VALUE",
        })

    const jsonArr = result.data.valueRanges.map(range => toJsonWithHeaders(range.values));

    const response ={};
    for (let i = 0; i < ranges.length; i++) {
        const name = ranges[i];
        response[name] = jsonArr[i];   
    }

    return response;
}

exports.gs_download_worksheets_headers = async function (spreadsheetId, ranges) {

    const result = await sheets.spreadsheets.values
        .batchGet({
            spreadsheetId,
            auth: jwtClient,
            ranges,
            majorDimension: "ROWS",
            dateTimeRenderOption: "SERIAL_NUMBER",
            valueRenderOption: "UNFORMATTED_VALUE",
        })

    const jsonArr = result.data.valueRanges.map(range => range.values[0]);

    const response ={};
    for (let i = 0; i < ranges.length; i++) {
        const name = ranges[i];
        response[name] = jsonArr[i];   
    }

    return response;
}

exports.gs_column_worksheet = async function (spreadsheetId, range) {

    const result = await sheets.spreadsheets.values
        .get({
            spreadsheetId,
            auth: jwtClient,
            range,
            majorDimension: "COLUMNS",
            dateTimeRenderOption: "SERIAL_NUMBER",
            valueRenderOption: "UNFORMATTED_VALUE",
        })

    const values = result.data.values;

    const response ={};
    for (let i = 0; i < values.length; i++) {
        const name = values[i][0];
        values[i].splice(0, 1);
        response[name] = values[i];   
    }
    return response;
}

function toJsonWithHeaders(array) {
    if (!Array.isArray(array)) { return; }
    const headers = array[0];
    array.splice(0, 1);

    return array.map(x => {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            const key = headers[i];
            obj[key] = x[i];
        }
        return obj;
    });
}
