const Version= require('../models/Version');
const mongoose = require('mongoose');

const Types = mongoose.Types;
const Schema = mongoose.Schema;

exports.storeVersion = (req, res, next) => {

    const versionId = req.body.versionId;
    const productId = req.body.productId;
    const versionName = req.body.versionName;
    const versionState = req.body.state;

    const version = new Version({
        id: versionId,
        name: versionName,
        state: versionState,
        productId: productId
    });
    version.save()
    .then(version => {
        console.log(version);
        res.status(201).json({
        message: 'version OK'
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.loadVersions = (req, res, next) => {
    const productId = req.params.productId;
    Version.find({productId: productId})
          .then(result => {
            res.status(200).json({ message: 'versions succesfully loaded', versions: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadVersion = (req, res, next) => {
    const versionId = req.params.versionId;
    Version.find({id: versionId})
          .then(result => {
            res.status(200).json({ message: 'version succesfully loaded', version: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadActiveVersions = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    Version.find({productId: productId, state: "Active"})
          .then(result => {
            res.status(200).json({ message: 'active versions succesfully loaded', versions: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadStateVersions = (req, res, next) => {
    //console.log(req);
    const productId = req.params.productId;
    const state = req.params.state;
    Version.find({productId: productId, state: state})
          .then(result => {
            res.status(200).json({ message: 'state versions succesfully loaded', versions: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.updateVersion = (req, res, next) => {
    console.log(req.body.versionId);
     Version.findOne({id: req.body.versionId})
         .then(version => {
         if (!version) {
             const error = new Error('version not found');
             error.statusCode = 404;
             throw error;
         }
         if(req.body.state === "Deprecada"){
            Version.find({productId: version.productId, createdAt: {$lte: version.createdAt}})
            .then(versions => {
                console.log(versions)
                if (!versions) {
                    const error = new Error('version not found');
                    error.statusCode = 404;
                    throw error;
                }
                versions.forEach(ver => {
                    ver.state = req.body.state;
                    ver.save();
                });
            })
         }
         version.state = req.body.state;
         version.name = req.body.versionName;
         return version.save();
         })
         .then(result => {
             res.status(200).json({ message: 'version updated', version: result });
         })
         .catch(err => {
         if (!err.statusCode) {
             err.statusCode = 500;
         }
         next(err);
         });
 };