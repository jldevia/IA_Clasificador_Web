'use strict'

const fs = require('fs');
const swipl = require('swipl-stdio');

//Función que recibe un string y devuelve una array con los terminos
//del string que se encuentran en el diccionario de términos.
module.exports.getTerms = function getTerms(data, sep) {

    if (!data) {
        //throw new Error('Parametro null!!');
        return "";
    }

    let words = data.toLowerCase().split(sep);

    let contentFile = fs.readFileSync('./terms.txt', 'utf8');
    contentFile.replace('\t', '');
    let dictionary = contentFile.split('\n');

    let result = [];
    words.forEach(element => {
        let i = dictionary.indexOf(element + '\t');

        if (i !== -1) {
            if (dictionary[i].match((/[+\-/_.*]/))) {
                result.push("'" + dictionary[i].trim() + "'");
            } else {
                result.push(dictionary[i].trim());
            }
        }
    });

    return [...new Set(result)];
}

module.exports.saveCaseTraining = function saveCase(data) {
    if (!data) {
        return -1;
    }

    let newCase = "\ncase([" + data.title + "],[" + data.keywords + "],["
        + data.description + "]," + data.topic + ").";

    fs.appendFileSync('./clasificador/training_data.pl', newCase);
}


module.exports.queryClassification = function (data, callback) {
    const engine = new swipl.Engine();

    (async () => {
        try {
            let result = await engine.call('working_directory(_,clasificador)');
            result = await engine.call('consult(engine)');
            let query = `classification([${data.title}],[${data.keywords}],[${data.description}], Class, Score).`;
            result = await engine.call(query);

            if (result) {
                callback(null, {
                    topic: result.Class,
                    score: result.Score
                });
            } else {
                console.error('La consulta fallo.');
            }
        } catch (error) {
            console.error(error);
        }

    })().catch((err) => console.error(err));

}


