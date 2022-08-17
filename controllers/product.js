const Product= require('../models/Product');
const Version= require('../models/Version');

exports.storeProduct = (req, res, next) => {

    const productName = req.body.productName;
    const productId = req.body.id;
    const versionId = req.body.versionId;
    const versionName = req.body.versionName;
    const versionState = req.body.versionState;

    const product = new Product({
        id: productId,
        name: productName
    });
    product.save()
        .then(product => {
            if (product){
                const version = new Version({
                    id: versionId,
                    name: versionName,
                    state: versionState,
                    productId: productId
                });
                version.save()
                .then(version => {
                    res.status(201).json({
                    message: 'producto y version OK'
                    });
                })
            }
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.loadProducts = (req, res, next) => {

    Product.find({})
          .then(result => {
            res.status(200).json({ message: 'products succesfully loaded', products: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.loadProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.find({id:productId})
          .then(result => {
            res.status(200).json({ message: 'product succesfully loaded', product: result });
          })
          .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          });
};

exports.updateProduct = (req, res, next) => {
    console.log(req.body.id);
     Product.findOne({id: req.body.id})
         .then(product => {
         if (!product) {
             const error = new Error('version not found');
             error.statusCode = 404;
             throw error;
         }
         product.name = req.body.productName;
         return product.save();
         })
         .then(result => {
             res.status(200).json({ message: 'product updated', product: result });
         })
         .catch(err => {
         if (!err.statusCode) {
             err.statusCode = 500;
         }
         next(err);
         });
 };