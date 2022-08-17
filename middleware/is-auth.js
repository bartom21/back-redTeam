//const jwt = require('jsonwebtoken');
const { Result } = require('express-validator');
const {OAuth2Client} = require('google-auth-library');
const axios = require('axios')

const client = new OAuth2Client('240699264519-873dk5k3kuonm6hi164af3bgugj3ca4i.apps.googleusercontent.com');//INGRESAR EL WEBCLIENTID DE GOOGLE DEVELOPER CONSOLE!! 
async function verify(token) {
        const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '240699264519-873dk5k3kuonm6hi164af3bgugj3ca4i.apps.googleusercontent.com',//INGRESAR EL WEBCLIENTID DE GOOGLE DEVELOPER CONSOLE!!  
        });
        return ticket;
};
async function userExists(token){
    const res = await axios.get('https://modulo-backoffice.herokuapp.com/users/user/exists', {
        headers: {
            'Authorization': token
        }
    })
     
    const result = res.data;
    if(result == true){
        return true
    }else {
        return false
    }
};

module.exports = (req, res, next) => {

    const token = req.header('Authorization');
    verify(token)
    //userExists(token)
    .then(result => {
        if(result != null && result != undefined){
            if(userExists(token)){
                next()
            }else{
                err.statusCode = 401;
                console.log('ELSEUSEREXISTS');
                next(err);
            }
        }
    })
    .catch(err => {
        err.statusCode = 401;
        console.log('ERROR');
        next(err);
     });

}