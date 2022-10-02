const path = require('path');
const express = require('express');
const app = express();

const sessionRoute = require('./routes/sessionRoute');

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


app.use(sessionRoute);

app.get('/', (req, res) => {
	res.send('Hello World!')
  })

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

app.listen(process.env.PORT || 8080)