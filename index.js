const database = require('./database/queries');
const fs = require('fs');
const commands = fs.readdirSync('./scripts').filter(e => { return e.includes('.sql'); });
const bq_calls = require('./database/bq_calls');
async function start(){
    let data = [];
    //SE INICIA BUSCANDO SI EXISTEN COMANDOS QUE ENVIAR
    if(commands.length <= 0){
        console.log('NO HAY COMANDOS PARA ENVIAR');
        return;
    }
    //SI SE ENCUENTRA ALGÚN COMANDO, MANDARLO A TODOS LOS CLIENTES | EN CASO DE NO HABER VALORES, ENVIAR UN ARREGLO VACÍO
    
    for (let i = 0; i < commands.length; i++) {
        const script = fs.readFileSync('./scripts/' + commands[i], { encoding:'utf-8' });
        let res = await database.multipleClients(script, []);
        if(res.length > 0) data = res.flat();
    }

    //VALIDAR SI HAY DATOS DE CLIENTES
    if(data.length <= 0) {
        console.log('NO HAY DATOS PARA CONTINUAR');
        return;
    }
    
    //ENVÍO A BIG QUERY
    await bq_calls.sendData(data);
    console.log('FINALIZANDO APLICACIÓN');
    
}

start();