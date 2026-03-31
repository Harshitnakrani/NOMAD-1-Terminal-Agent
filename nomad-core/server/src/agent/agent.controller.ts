import type { Response } from 'express';
import { taskManager } from './taskmanager.service.js';

export const runAgent = async (req: any, res: Response) => {
  const { chat } = req.body;

  if (!chat) {
    return res.send({ status: 400, message: 'chat is required' });
  }

  const response = await taskManager.runAgentTask(chat);

  if (!response.success) {
    return res.send({ status: 501, message: 'server error' });
  }

  return res.send({
    status: 200,
    message: response.message,
    data: response.data,
  });
};
