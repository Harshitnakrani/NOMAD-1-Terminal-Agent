import { exec } from 'child_process';

class Tools {
  async runGeneratedCommand(command: string) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
}

export const tools = new Tools();
