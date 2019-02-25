
function ExcelDateToJSDate2(date) {
    return new Date(Math.round((date - 25569) * 86400 * 1000));
}

function sheetIdFromUrl(resourceUrl) {
    const matches = /\/([\w-_]{15,})\/(.*?gid=(\d+))?/.exec(resourceUrl);
    if (matches) { return matches[1]; }
    return '';
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

function makeMatch(data) {
    return data.variedades
        .map(variety => {
            const id = variety['id'];
            variety['plantel'] = data.temporada
            .filter(x => x.id === id)
            .map( temporada => {
                const plantel = temporada.plantel;
                temporada['poda'] = data.poda.filter(x => x.id === id && x.plantel ===plantel);
                temporada['raleo'] = data.raleo.filter(x => x.id === id && x.plantel ===plantel);
                temporada['floribundidad'] = data.floribundidad.filter(x => x.id === id && x.plantel ===plantel);
                temporada['fenologia'] = data.fenologia.filter(x => x.id === id && x.plantel ===plantel);
                temporada['fotos'] = data.fotos.filter(x => x.id === id && x.plantel ===plantel && !x.fecha_cosecha && !x.salida_frio);
                temporada['cosecha'] = data.cosecha.filter(x => x.id === id && x.plantel ===plantel)
                .map(cosecha => {
                    const fecha_cosecha = cosecha.fecha_cosecha;
                    cosecha['cosecha_defectos'] = data.cosecha_defectos.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha);
                    cosecha['cosecha_presiones'] = data.cosecha_presiones.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha);
                    cosecha['cosecha_calibre'] = data.cosecha_calibre.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha);
                    cosecha['cosecha_diametro'] = data.cosecha_diametro.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha);
                    cosecha['fotos'] = data.fotos.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha && !x.salida_frio);
                    cosecha['postcosecha'] = data.postcosecha.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha)
                    .map( postcosecha => {
                        const salida_frio = postcosecha.salida_frio;
                        postcosecha['postcosecha_presiones'] = data.postcosecha_presiones.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha && x.salida_frio === salida_frio);
                        postcosecha['postcosecha_defectos'] = data.postcosecha_defectos.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha && x.salida_frio === salida_frio);
                        postcosecha['fotos'] = data.fotos.filter(x => x.id === id && x.plantel ===plantel && x.fecha_cosecha === fecha_cosecha && x.salida_frio === salida_frio);
                        return postcosecha;
                    });
                    return cosecha;
                });
                return temporada;
            })
            return variety;
        });
}

function makeMatch2(data) {
    return data.identificacion //.filter(x => x.id === 'Extreme Delight')
        .map(variety => {
            const id = variety['id'];
            variety['centro_evaluativo'] = data.centro_evaluativo
                .filter(x => x.id === id)
                .map(centro => {
                    const name = centro.centro_evaluativo;
                    centro['ramillas'] = data.ramillas.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['fenologia'] = data.fenologia.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['floribundidad'] = data.floribundidad.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['vigor'] = data.vigor.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['raleo'] = data.raleo.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['fotos'] = data.fotos.filter(x => x.id === id && x.centro_evaluativo === name && !x.fecha_cosecha && !x.fecha_salida_frio);
                    centro['monitoreo_precosecha'] = data.monitoreo_precosecha.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['observaciones'] = data.observaciones.filter(x => x.id === id && x.centro_evaluativo === name);
                    centro['conclusiones'] = data.conclusiones.filter(x => x.id === id && x.centro_evaluativo === name)
                    centro['cosecha'] = data.cosecha.filter(x => x.id === id && x.centro_evaluativo === name)
                        .map(cosecha => {
                            const fecha_cosecha = cosecha.fecha_cosecha;
                            cosecha['cosecha_presiones'] = data.cosecha_presiones.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha);
                            cosecha['cosecha_pesaje'] = data.cosecha_pesaje.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha === fecha_cosecha);
                            cosecha['cosecha_defectos'] = data.cosecha_defectos.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha);
                            cosecha['fotos'] = data.fotos.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha && !x.fecha_salida_frio);
                            cosecha['postcosecha'] = data.postcosecha.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha)
                                .map(postcosecha => {
                                    const fecha_salida_frio = postcosecha.fecha_salida_frio;
                                    postcosecha['postcosecha_defectos'] = data.postcosecha_defectos.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha && x.fecha_salida_frio === fecha_salida_frio);
                                    postcosecha['postcosecha_presiones'] = data.postcosecha_presiones.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha && x.fecha_salida_frio === fecha_salida_frio);
                                    postcosecha['fotos'] = data.fotos.filter(x => x.id === id && x.centro_evaluativo === name && x.fecha_cosecha === fecha_cosecha && x.fecha_salida_frio === fecha_salida_frio);
                                    return postcosecha;
                                });
                            return cosecha;
                        });
                    return centro;
                });
            return variety;
        });
}

function getAttr(attrs, id, dd) {
    const index = attrs.map(x => x.id).indexOf(id);
    if (index === -1) { return undefined; }
    return attrs[index][dd];
}

function updateAttr(attrs, id, dd, value) {
    const index = attrs.map(x => x.id).indexOf(id);
    if (index === -1) { 
        attrs.push({ id, [dd]: value }); 
    } else{
        attrs[index][dd] = value;
    }
    
    return attrs;
}

const checkForHexRegExp = /^[0-9a-fA-F]{24}$/;

function OIDChecker( string ) {
    return checkForHexRegExp.test(string);
}

const allowDataTypes = ['reference', 'string', 'number', 'boolean', 'date', 'list', 'listOfObj', 'value'];

module.exports = {
    ExcelDateToJSDate2,
    sheetIdFromUrl,
    toJsonWithHeaders,
    makeMatch,
    getAttr,
    updateAttr,
    OIDChecker,
    allowDataTypes
}