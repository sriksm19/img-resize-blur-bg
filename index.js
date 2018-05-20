#!/usr/bin/env node

'use strict';

const express = require('express');
const path = require('path');
const fs = require('mz/fs');
const handlebars = require('handlebars');
const crypto = require('crypto');

handlebars.registerHelper('ifNotEq', function(a, b, opts) {
	if (a !== b) {
		return opts.fn(this);
	}
});

const app = express();

app.get(/\/$|\/([^\/]+)(\/|\/index.html)$/i, (req, res) => {
	req.item = req.params[0] || '';
	if (process.env.NODE_ENV === 'development') {
		req.brURL = process.env.BROWSER_REFRESH_URL;
	}

	let files;
	if ('partial' in req.query) {
		files = [fs.readFile(`app/${req.item}/index.html`)];
	} else {
		files = [
			fs.readFile(`app/partials/header.html`),
			fs.readFile(`app/${req.item}/index.html`),
			fs.readFile(`app/partials/footer.html`),
		];
	}

	Promise.all(files)
		.then(files => files.map(f => f.toString('utf-8')))
		.then(files => files.map(f => handlebars.compile(f)(req)))
		.then(files => {
			const content = files.join('');
			const hash = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			res.set({
				ETag: hash,
				'Cache-Control': 'public, no-cache',
			});

			res.send(content);
		})
		.catch(error => res.status(500).send(error.toString()));
});

app.use(
	'/static',
	express.static(path.join(__dirname, 'app/static'), { maxAge: '1y' })
);
const port = process.env.PORT || 8080;
require('http')
	.createServer(app)
	.listen(port);
console.log('Listening to port: ' + port);
