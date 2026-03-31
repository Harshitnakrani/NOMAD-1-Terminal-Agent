import type { Express } from 'express';
import express from 'express';
import { agentRoute } from './agent/routes/agent.route.js';

const server: Express = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/api/v1', agentRoute);
export default server;
