const clientCredentials = require('./credentials').getCredentials();
const { Pool } = require('pg');
const clients = clientCredentials.map(e => {
    return new Pool({
        host: e.host,
        user: e.user,
        password: e.password,
        database: e.database,
        port: e.port
    });
});
let tabs = '';
async function executeCommand(client, command, values){
    try {
        const res = await client.query(command, values);
        return res.rows;
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

async function multipleClients(query, values){
    let data = [];
    console.log('ENVIANDO DATOS A UN TOTAL DE CLIENTES: ' + clients.length);
    for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        if(client.options.database.length > 12 && client.options.database.length < 21) tabs = '\t\t';
        else if (client.options.database.length < 13) tabs = '\t\t\t';
        else tabs = '\t';
        let _client = await client.connect();
        let result = await executeCommand(_client, query, values);
        //console.log('COMANDO ENVIADO A LA BASE DE DATOS ' + client.options.database + tabs + '| RESPUESTA: ' + JSON.stringify(result) + '\t| CLIENTE: ' + (i + 1) + '/' + clients.length);
        _client.end();
        if(result.length > 0) 
        data.push(result.map(e => ({ ...e, ClientName: clientCredentials.find(f => f.database === client.options.database).bqName})));
    }
    return data;
}

async function singleClient(query, values, clientName){
    const client = clients.find(e => { return e.options.database.toString().includes(clientName.toString()); });
    if(!client) throw new Error('EL CLIENTE SOLICITADO NO SE ENCUENTRA');
    let _client = await client.connect();
    let result = await executeCommand(_client, query, values);
    console.log('COMANDO ENVIADO A LA BASE DE DATOS ' + client.options.database + '\t| RESPUESTA: ' + JSON.stringify(result));
}

module.exports = {
    multipleClients,
    singleClient
}