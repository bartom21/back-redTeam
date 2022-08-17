const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const productRoute = require('./routes/productRoute');
const licenceRoute = require('./routes/licenceRoute');
const versionRoute = require('./routes/versionRoute');
const clientRoute = require('./routes/clientRoute');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
	  'Access-Control-Allow-Methods',
	  'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
  });
  
app.use(productRoute);
app.use(licenceRoute);
app.use(versionRoute);
app.use(clientRoute);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((req, res, next) => {
	const error = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
		error: {
			message: error.message
		}
	});
});



mongoose
	.connect(
		process.env.MONGODB_URI,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(result => {
		app.listen(process.env.PORT || 8080);
	})
	.catch(err => {
		console.log(err);
	});
