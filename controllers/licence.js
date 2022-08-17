const Licence = require('../models/Licence');
const Product = require('../models/Product');
const Version = require('../models/Version');
const clientController = require('../controllers/client');

exports.storeLicence = (req, res, next) => {
    const licenceId = req.body.licenceId;
    const productId = req.body.productId;
    const versionId = req.body.versionId;
    const clientId = req.body.clientId;
    const expirationDate = req.body.expirationDate;
    const state = req.body.state;

    const licence = new Licence({
        id: licenceId,
        productId: productId,
        versionId: versionId,
        clientId: clientId,
        expirationDate: expirationDate,
        state: state
    });
    licence.save()
        .then(licence => {
            console.log(licence);
            res.status(201).json({
            message: 'licence OK'
            });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.loadLicences = (req, res, next) => {
    //console.log(req);

    Licence.find({})
          .then(result => {
            res.status(200).json({ message: 'licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};
exports.loadPopulatedLicences = async (req, res, next) => {
    try {
        const licences = await Licence.find({});
        const clients = await clientController.loadClientList();
        const updatedLicences = [];
        for(let licence of licences){
            const product = await Product.findOne({id: licence.productId});
            const version = await  Version.findOne({id: licence.versionId});
            const client = clients.find(client => client.id == licence.clientId);
            const updatedLicence = {
                id: licence.id,
                productName: product.name,
                versionName: version.name,
                clientName: client.razonSocial,
                expirationDate: licence.expirationDate,
                state: licence.state
            }
            updatedLicences.push(updatedLicence);
        }
        res.status(200).json({ message: 'licences succesfully loaded', licences: updatedLicences });
    }
    catch (err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.loadPopulatedLicence = async (req, res, next) => {
    try {
        const licenceId = req.params.licenceId;
        const licences = await Licence.find({id:licenceId});
        const clients = await clientController.loadClientList();
        const updatedLicences = [];
        for(let licence of licences){
            const product = await Product.findOne({id: licence.productId});
            const version = await  Version.findOne({id: licence.versionId});
            const client = clients.find(client => client.id == licence.clientId);
            const updatedLicence = {
                id: licence.id,
                productName: product.name,
                versionName: version.name,
                clientName: client.razonSocial,
                expirationDate: licence.expirationDate,
                state: licence.state
            }
            updatedLicences.push(updatedLicence);
        }
        res.status(200).json({ message: 'licence succesfully loaded', licences: updatedLicences });
    }
    catch (err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.loadClientLicences = (req, res, next) => {
    //console.log(req);
    const clientId = req.params.clientId;
    Licence.find({clientId: clientId})
          .then(result => {
            res.status(200).json({ message: 'client licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadProductLicences = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    Licence.find({productId: productId})
          .then(result => {
            res.status(200).json({ message: 'product licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadProductVersionLicences = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    const versionId = req.params.versionId;

    Licence.find({productId: productId, versionId: versionId})
          .then(result => {
            res.status(200).json({ message: 'product version licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadProductClientLicences = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    const clientId = req.params.clientId;

    Licence.find({productId: productId, clientId: clientId})
          .then(result => {
            res.status(200).json({ message: 'product client licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadProductVersionClientLicences = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    const clientId = req.params.clientId;
    const versionId = req.params.versionId;

    Licence.find({productId: productId, clientId: clientId, versionId: versionId})
          .then(result => {
            res.status(200).json({ message: 'product version client licences succesfully loaded', licences: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.updateLicence = (req, res, next) => {
     Licence.findOne({id: req.body.licenceId})
         .then(licence => {
         if (!licence) {
             const error = new Error('licence not found');
             error.statusCode = 404;
             throw error;
         }
         licence.state = req.body.state;
         return licence.save();
         })
         .then(result => {
             res.status(200).json({ message: 'licence updated', licence: result });
         })
         .catch(err => {
         if (!err.statusCode) {
             err.statusCode = 500;
         }
         next(err);
         });
 };

 exports.renewLicence = (req, res, next) => {
     Licence.findOne({_id: Types.ObjectId(req.body.licenceId)})
         .then(licence => {
         if (!licence) {
             const error = new Error('licence not found');
             error.statusCode = 404;
             throw error;
         }
         licence.expirationDate = req.body.expirationDate;
         return licence.save();
         })
         .then(result => {
             res.status(200).json({ message: 'licence updated', licence: result });
         })
         .catch(err => {
         if (!err.statusCode) {
             err.statusCode = 500;
         }
         next(err);
         });
 };