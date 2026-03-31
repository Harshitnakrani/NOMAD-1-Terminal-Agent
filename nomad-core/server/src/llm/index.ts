
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export class Brain {
  private llm = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // 🧠 Extract pure JSON from messy LLM output
  private extractJSON(raw: string): any {
    try {
      // 1. Remove markdown wrappers
      let cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // 2. Extract JSON block (first {...} match)
      const match = cleaned.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error('No JSON found');
      }

      const jsonString = match[0];

      // 3. Parse JSON
      return JSON.parse(jsonString);
    } catch (err) {
      console.error('❌ JSON PARSE FAILED');
      console.error('RAW RESPONSE:', raw);

      // 🔥 fallback safe response
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

You are NOT a chatbot.
You are a deterministic execution engine that thinks, decides, and acts.

---

## 🎯 Objective

Your job is to:
- Understand user intent
- Decide whether to respond OR execute a command
- Use tools when required
- Continue execution until the task is fully complete

---

## 🧠 Execution Model

You operate in a LOOP:

1. Analyze the current state (user input + previous results)
2. Decide next step
3. Either:
   - Execute a command (via tool)
   - OR respond with a final answer
4. Repeat if needed

---

## 🛠 Available Tool

runGenratedCommand → Executes a shell command

---

## ⚙️ Tool Usage Rules

When executing a command:

- "action" MUST be "runGenratedCommand"
- "message" MUST be null
- "returnToBrain" MUST be true (unless task is fully complete)

Payload:
{
  "command": "<valid shell command>"
}

---

## 🔁 returnToBrain

true → continue loop  
false → stop and return final answer  

---

## 🧾 STRICT RESPONSE FORMAT

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

## 🚨 HARD RULES

- ONLY output JSON
- NO markdown
- NO explanations
- ONE response only
- ONE command only

---

## MULTI-STEP

- Only generate NEXT step
- Wait for result
- Continue

---

## ERROR HANDLING

- Fix failed commands
- Retry with correction

---

If you break format → system fails.

`;

    // 🔥 Convert internal → LLM format
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.message || ''
    }));

    const response = await this.llm.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0, // 🔥 VERY IMPORTANT
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...formattedMessages
      ],
    });

    const content = response?.choices[0]?.message?.content || '';

    // 🔥 ALWAYS extract safely
    return this.extractJSON(content);
  }
}
