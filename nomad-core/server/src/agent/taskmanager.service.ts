import { log } from 'console';
import { Brain } from '../llm/index.js';
import { agentService } from './agent.service.js';
import {
  Entities,
  tools,
  type ApiResponse,
  type Messages,
} from './types/types.js';

class TaskManager {
  private brain;
  constructor() {
    this.brain = new Brain();
  }
  async runAgentTask(chat: Messages[]): Promise<ApiResponse<any>> {
    const response = await this.brain.runLlm(chat);

    if (!response) {
      return {
        success: false,
      };
    }

    if (!response.action || response.action === 'done') {
      return {
        success: true,
        message: response.message,
        data: response.payload,
      };
    }

    switch (response.action) {
      case 'runGenratedCommand':
        log(chat);
        const result = await agentService.runGeneratedCommand(
          response.payload.command,
        );

        chat.push(response);
        chat.push({
          role: Entities.system,
          message: `Command result: ${result}`,
          returnToBrain: true,
          payload: {},
        });

        if (response.returnToBrain) {
          return await this.runAgentTask(chat);
        }

        return {
          success: true,
          message: response.message,
          data: result,
        };
      default:
        return {
          success: true,
          message: response.message,
        };
    }
    return {
      success: false,
    };
  }
}

export const taskManager = new TaskManager();
