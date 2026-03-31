import readlineSync from 'readline-sync';
import axios from 'axios';
import pc from 'picocolors';
import { spinner } from '@clack/prompts';

const API_URL = 'http://localhost:8000/api/v1/chat';

interface Message {
  role: 'user' | 'agent' | 'system';
  message?: string;
  action?: string;
  returnToBrain?: boolean;
  payload?: any;
}

const BANNER = `
 ███╗   ██╗ ██████╗ ███╗   ███╗ █████╗ ██████╗ 
 ████╗  ██║██╔═══██╗████╗ ████║██╔══██╗██╔══██╗
 ██╔██╗ ██║██║   ██║██╔████╔██║███████║██║  ██║
 ██║╚██╗██║██║   ██║██║╚██╔╝██║██╔══██║██║  ██║
 ██║ ╚████║╚██████╔╝██║ ╚═╝ ██║██║  ██║██████╔╝
 ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ 
`;

function printBanner() {
  // console.clear();
  console.log(pc.white(BANNER));
  console.log(pc.gray('  Tips for getting started:'));
  console.log(pc.gray('  1. Ask questions, edit files, or run commands.'));
  console.log(pc.gray('  2. Be specific for the best results.'));
  console.log(pc.gray('  3. Create NOMAD.md files to customize your interactions.'));
  console.log(pc.gray('  4. /help for more information.'));
  console.log();
  console.log(pc.gray('  Using 1 MCP server (ctrl+t to view)'));
  console.log();
}

function printAgentResponse(message: string) {
  const lines = message.split('\n');
  const width = Math.max(...lines.map(l => l.length), 60);
  const border = pc.gray('─'.repeat(width + 4));

  console.log();
  console.log(border);
  console.log(pc.gray('  Agent Response'));
  console.log(border);
  for (const line of lines) {
    console.log(pc.white('  ' + line));
  }
  console.log(border);
  console.log();
}

async function main() {
  printBanner();
  const chat: Message[] = [];

  while (true) {
    const userInput = readlineSync.question(pc.white('> '));
    console.log(userInput)
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      process.exit(0);
    }

    if (!userInput.trim()) continue;

    chat.push({
      role: 'user',
      message: userInput,
      // returnToBrain: true
    });
    
    const s = spinner();
    s.start(pc.gray('Thinking...'));

    try {
      const response = await axios.post(API_URL, { chat }, { 
        timeout: 120000,
        headers: { 'Content-Type': 'application/json' }
      });

      s.stop(pc.gray('Done'));

      if (response.data && (response.data.status === 200 || response.status === 200)) {
        const agentMessage = response.data.message || 'No message returned';
        printAgentResponse(agentMessage);

        chat.push({
          role: 'agent',
          message: agentMessage,
          returnToBrain: false,
          payload: response.data.data,
        });
      } else {
        console.log(pc.red(`\n  API Error: ${response.data?.message || 'Unknown status'}`));
      }
    } catch (error: any) {
      s.stop(pc.red('Failed'));
      console.log(pc.red(`\n  Error: ${error.message}`));
      if (error.response) {
        console.log(pc.red(`  Details: ${JSON.stringify(error.response.data)}`));
      }
    }
  }
}

main().catch((err) => {
  console.error(pc.red('Fatal: ' + err.message));
  process.exit(1);
});