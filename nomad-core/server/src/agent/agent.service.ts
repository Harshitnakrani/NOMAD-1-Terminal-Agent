import { tools } from '../tools/tools.js';

class AgentService {
  async runGeneratedCommand(command: string) {
    return await tools.runGeneratedCommand(command);
  }
}

export const agentService = new AgentService();
