require('dotenv').config();
const {BigQuery} = require('@google-cloud/bigquery');
const bigQuery = new BigQuery({
    projectId:  process.env.BQ_PROJECT_ID,
    keyFilename: 'bigquery-jobs-datafusion-metrica.json'
});


async function sendData(data){
    try {
        let chuckSize = parseInt(process.env.CHUNCK_SIZE || 50);
        let query = 'CALL ' + process.env.BQ_DATASET + '.vehicle_mdvr_data_qa(@data)';
        let results = [];
        for (let i = 0; i < data.length; i+=chuckSize) {
            console.log('ENVIANDO PAQUETE DE DATOS: ' + (i/chuckSize + 1) + '/' + Math.ceil(data.length/chuckSize));
            const trimmedData = data.slice(i, i+chuckSize);
            let options = {
                query: query,
                location: 'us-central1',
                params: { data: JSON.stringify(trimmedData) }
            };
            results.push(await bigQuery
            .dataset(process.env.BQ_DATASET)
            .query(options));   
        }   
        return results;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    sendData
}