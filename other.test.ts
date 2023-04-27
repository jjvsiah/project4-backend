import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('/clear/v1 root test', () => {
  test('Success clear', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/clear/v1'
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({});
  });
});
