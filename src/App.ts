import 'reflect-metadata';
import 'dotenv/config';
import {Container} from 'typedi';
import {RestAPI} from './adapters/api/RestAPI';

const restApiPort = process.env.REST_API_PORT;

const restApi = Container.get(RestAPI);

restApi.setup();

restApi.api.listen({ port: restApiPort, address: '0.0.0.0' }, () => {
  console.log(`Server running on port ${restApiPort}`);
});
