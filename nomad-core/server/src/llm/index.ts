import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

export class Brain {
  private llm = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // 🧠 Ultra-robust JSON extractor
 
  private extractJSON(raw: string): any {
    try {
      if (!raw) throw new Error('Empty response');

      // 1. Clean up common LLM artifacts
      let cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/<\|.*?\|>/g, '') 
        .replace(/assistant/g, '')
        .trim();

      // 2. Extract the JSON object block
      const matches = cleaned.match(/\{[\s\S]*?\}/g);

      if (!matches || matches.length === 0) {
        throw new Error('No JSON found');
      }

      // 3. Take the last JSON block (usually the final answer)
      const lastJson = matches[matches.length - 1];
      if (!lastJson) return;

      // 4. Basic normalization (handling missing quotes on keys if LLM slipped up)
      // Note: We avoid aggressive global single-to-double quote replacement here 
      // as it often breaks valid strings containing apostrophes.
      const normalizedJson = lastJson
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Ensure keys are double-quoted

      log('Parsing JSON:', normalizedJson);
      return JSON.parse(normalizedJson + "}");
    } catch (err) {
      console.error('❌ JSON PARSE FAILED');
      console.error('RAW RESPONSE:', raw);

      return {
        role: 'agent',
        message: 'Failed to parse LLM response',
        action: null,
        returnToBrain: false,
        payload: {}
      };
    }
  }


  async runLlm(messages: any) {
   
      const systemPrompt = `
      You are NOMAD-1, an AI terminal execution agent.
      
      STRICT OUTPUT RULE:
      - Output ONLY valid JSON
      - No text before or after JSON
      - Response MUST start with { and end with }
      - JSON must be strictly parseable by JSON.parse()
      
      ---
      
      ## 🎯 ROLE
      
      You are NOT a chatbot. You are a deterministic execution engine.
      Your job is to understand intent, decide the next step, and execute commands.
      
      ---
      
      ## 🧾 RESPONSE FORMAT
      
      {
        "role": "agent",
        "message": "CLEAN_STRING",
        "action": "runGenratedCommand" | null,
        "returnToBrain": boolean,
        "payload": {
          "command": "string"
        } | {}
      }
      
      ---
      
      ## 🧠 MESSAGE RULES (CRITICAL FOR JSON.PARSE)
      
      To ensure the message doesn't break JSON parsing:
      1. Use ONLY alphanumeric characters, spaces, and simple punctuation (., ! -).
      2. ABSOLUTELY NO double quotes (") inside the message string.
      3. ABSOLUTELY NO backslashes (\\) or newlines (\\n).
      4. Keep the message as a single-line summary.
      5. If you must refer to a file or path, do not use quotes.
      
      GOOD: message: "Installing dependencies in the test folder"
      BAD: message: "Installing \"dependencies\" in \\test\\ folder\\nDone."
      
      ---
      
      ## 🔁 returnToBrain
      
      - Set to true if more steps are needed (e.g., command output required for next decision).
      - Set to false if the task is finished or you are providing a final answer.
      
      ---
      
      ## ⚙️ ACTION RULES
      
      If action = "runGenratedCommand":
      - payload.command must be a valid, executable shell command.
      - returnToBrain should usually be true to process the result.
      
      ---
      
      ## 🧠 EXAMPLE: List files
      
      {
        "role": "agent",
        "message": "Listing files in the current directory",
        "action": "runGenratedCommand",
        "returnToBrain": true,
        "payload": {
          "command": "ls -la"
        }
      }
      
      Think → Decide → Act → Wait → Repeat
      `;

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.message || '',
    }));

    const response = await this.llm.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages,
      ],
    });

    const content = response?.choices[0]?.message?.content || '';

    return this.extractJSON(content);
  }
}
