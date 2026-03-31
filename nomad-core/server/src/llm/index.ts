
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

      // 🔥 1. Remove ALL known garbage tokens
      let cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/<\|.*?\|>/g, '') // remove <|python_tag|> etc
        .replace(/assistant/g, '')
        .trim();

      // 🔥 2. Extract ALL JSON objects
      const matches = cleaned.match(/\{[\s\S]*?\}/g);

      if (!matches || matches.length === 0) {
        throw new Error('No JSON found');
      }

      // 🔥 3. Take LAST JSON (most important)
      const lastJson = matches[matches.length - 1];

      // 🔥 4. Fix invalid JSON (single quotes → double quotes)
      const safeJson = lastJson
        .replace(/(\w+):/g, '"$1":') // keys to "key"
        .replace(/'/g, '"') + "}"; // values to ""
      log(safeJson) 

        return JSON.parse(safeJson);
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
      
      STRICT RULE:
      Return ONLY valid JSON.
      No text before or after JSON.
      Response MUST start with '{' and end with '}'.
      
      ---
      
      ## 🎯 Behavior
      
      - Understand user intent
      - Decide → Respond OR Execute
      - Use runGenratedCommand when terminal action is required
      - Always act ONE step at a time
      
      ---
      
      ## 🛠 Tool
      
      runGenratedCommand
      
      ---
      
      ## 🔁 returnToBrain (CRITICAL CONTROL SIGNAL)
      
      returnToBrain controls whether the agent CONTINUES or STOPS.
      
      ### returnToBrain = true
      - The system WILL:
        1. Execute your command
        2. Capture output
        3. Send result back to you
      - You MUST continue the task in the next step
      - Use this when:
        - Task requires multiple steps
        - You need to verify output
        - Setup/install/build processes
      
      ### returnToBrain = false
      - The system WILL STOP execution
      - Final response is returned to the user
      - Use this when:
        - Task is COMPLETE
        - No more commands are needed
        - You are giving final answer
      
      ⚠️ IMPORTANT:
      If you set returnToBrain = true, you are expected to CONTINUE in the next iteration.
      If task is complete → NEVER set it to true.
      
      ---
      
      ## 🧾 Format
      
      {
        "role": "agent",
        "message": string | null,
        "action": string | null,
        "returnToBrain": boolean,
        "payload": {
          "command": string
        } | {}
      }
      
      ---
      
      ## 🚨 Rules
      
      - NO markdown
      - NO explanation
      - ONLY ONE JSON object
      - NEVER output multiple responses
      - NEVER mix "message" and "action"
      - ALWAYS generate ONE command only
      - If multiple commands needed → chain using && ONLY if they are truly one step
      - In "action" field → ONLY use available tools
      
      ---
      
      ## 🧠 Decision Logic
      
      - If task requires terminal → use tool
      - If task is informational → respond with message
      - If unsure → ask via message (DO NOT execute blindly)
      
      ---
      
      ## 🔄 Multi-Step Discipline
      
      - ONLY generate NEXT step
      - DO NOT describe future steps
      - WAIT for system to return result
      - CONTINUE based on result
      
      ---
      
      ## ❗ Failure Handling
      
      - If command fails → analyze error
      - Generate corrected command
      - Continue with returnToBrain = true
      
      ---
      
      ## 🧠 Example: Create React Project "test"
      
      User: "create a react project named test"
      
      Step 1 (create project):
      {
        "role": "agent",
        "message": cd into test and install depandany in test folder (your next step instrunction),
        "action": "runGenratedCommand",
        "returnToBrain": true,
        "payload": {
          "command": "npm create vite@latest test -- --template react"
        }
      }
      
      Step 2 (after system sends result):
      {
        "role": "agent",
        "message": cd into test and run react projet test (your next step instaruction,)
        "action": "runGenratedCommand",
        "returnToBrain": true,
        "payload": {
          "command": "cd test && npm install"
        }
      }
      
      Step 3 (final step):
      {
        "role": "agent",
        "message": ypur next step instrunction,
        "action": "runGenratedCommand",
        "returnToBrain": false,
        "payload": {
          "command": "cd test && npm run dev"
        }
      }
      
      ---
      
      ⚠️ IMPORTANT:
      - Do NOT generate all steps at once
      - Do NOT explain steps
      - ONLY return ONE step per response
      - Always be aware where are you runing commands
      -alwaly pass message feild
      
      when you have completed all steps than set action to be done
      i am using your api so new response have no contex of old ones so message feild will tell old context
      ---
      
      If you break format → system will crash.
      
      Think → Decide → Act → Wait → Repeat
      `;



    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.message || ''
    }));

    const response = await this.llm.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages
      ],
    });

    const content = response?.choices[0]?.message?.content || '';

    return this.extractJSON(content);
  }
}
