import http from 'http-server';
import path from 'path';
import { TEST_SERVER_PORT } from '../util/constants';

const server = http.createServer({
  root: path.join(__dirname, '..', 'test', 'images', 'input'),
});

server.listen(TEST_SERVER_PORT, '127.0.0.1', () => {
  console.log(`Test image server running at http://127.0.0.1:${TEST_SERVER_PORT}`);
});
