import { exec } from 'child_process';

class Tools {
  async runGeneratedCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error.message}`);
          return resolve(`Error: ${error.message}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return resolve(`Stderr: ${stderr}\nStdout: ${stdout}`);
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      });
    });
  }
}

export const tools = new Tools();
