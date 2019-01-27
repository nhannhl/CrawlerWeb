import express from 'express';
import bodyParser from 'body-parser';
import crawlRoute from './routes/crawler.route';

const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: false
}));

server.use(crawlRoute);

server.use((e, req, res, next) => {
	console.error(e);
	return res.status(400).json({
		isSuccess: false,
		message: e.message || 'Have error',
	})
});

server.listen(3000, () => {
    console.log('Server started at: 3000');
});

server.timeout = 1800000;