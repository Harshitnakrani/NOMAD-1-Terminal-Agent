import { Brain } from '../llm/index.js';
import { agentService } from './agent.service.js';
import { tools, type ApiResponse, type Messages } from './types/types.js';

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

        console.log(response)

        switch (response.action) {
    
            case 'runGenratedCommand':
                const result = await agentService.runGeneratedCommand(response.payload.command);
        
                if (response.returnToBrain) {
                    return await this.runAgentTask([
                        ...chat,
                        response,
                        {
                            role: 'system',
                            message: `Command result: ${result}`,
                            returnToBrain: false,
                            payload: {}
                        }
                    ]);
                }
        
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
