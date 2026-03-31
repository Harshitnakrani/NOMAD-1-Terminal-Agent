import { Router } from 'express';
import { runAgent } from '../agent.controller.js';

export const agentRoute: Router = Router();

agentRoute.post('/chat', runAgent);
