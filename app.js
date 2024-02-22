const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

const sessionRoute = require('./routes/sessionRoute');
const userRoute = require('./routes/userRoute');
const resourceRoute = require('./routes/resourceRoute');
const notificationsRoute = require('./routes/notificationRoute');
const billingRoute = require('./routes/billingRoutes');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(cors());

app.use(billingRoute);
app.use(resourceRoute);
app.use(sessionRoute);
app.use(userRoute);
app.use(notificationsRoute);


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