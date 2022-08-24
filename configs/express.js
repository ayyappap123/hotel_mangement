const express = require('express');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const compress = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors'); //For cross domain error
const fs = require('file-system');
const path = require('path');
const timeout = require('connect-timeout');
const glob = require('glob');

module.exports = function () {

	const app = express();

	// Create a write stream (in append mode)
	const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

	// Setup the logger
	app.use(morgan(':remote-addr :method :url :status - :date', { stream: accessLogStream }));

	if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
	else if (process.env.NODE_ENV === 'production') app.use(compress({ threshold: 2 }));

	app.use(bodyParser.urlencoded({
		limit: "50mb",
		extended: true
	}));

	app.use(bodyParser.json());
	morganBody(app, { logReqDateTime: false, logReqUserAgent: false, theme: 'dimmed', stream: accessLogStream });

	app.use(methodOverride());

	app.use(cors());

	//	Settings for CORS
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.use(timeout(120000));
	app.use(haltOnTimedout);

	function haltOnTimedout(req, res, next) {
		if (!req.timedout) next();
	}

	app.use((err, req, res, next) => {
		return res.send({
			status: 0,
			statusCode: 500,
			message: err.message,
			error: err
		});
	})

	app.use(express.json());

	//	Routing
	const modules = '/../app/modules';
	glob(__dirname + modules + '/**/*Routes.js', {}, (err, files) => {
		files.forEach((route) => {
			const stats = fs.statSync(route);
			const fileSizeInBytes = stats.size;
			if (fileSizeInBytes) {
				require(route)(app, express);
			}
		});
	});

	return app;
};