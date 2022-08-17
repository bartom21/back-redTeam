const express = require('express');

const router = express.Router();
const axios = require('axios');

function renameKey ( obj, oldKey, newKey ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
}

exports.loadClients = (req, res, next) => {
    axios.get('https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/754f50e8-20d8-4223-bbdc-56d50131d0ae/clientes-psa/1.0.0/m/api/clientes')
    .then(result => {
        result.data.forEach( obj => renameKey( obj, 'razon social', 'razonSocial' ) )
        res.status(201).json({
            clients: result.data
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.loadClientList = async () => {
    const clients = await axios.get('https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/754f50e8-20d8-4223-bbdc-56d50131d0ae/clientes-psa/1.0.0/m/api/clientes')
    clients.data.forEach( obj => renameKey( obj, 'razon social', 'razonSocial' ) );
    return clients.data;
}