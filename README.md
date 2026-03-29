

# 🛠️ NOMAD Core: The Zero-Quota Coding Agent

**NOMAD Core** is a high-performance, terminal-based AI coding assistant designed to run 100% locally using Ollama. Built to bypass the "Quota Wall" of cloud-based AI, NOMAD gives you an infinite "Vibe Coding" loop directly on your machine.

> **The Philosophy:** Cloud for the heavy lifting, Local for the flow.

---

## 🏗️ System Design

NOMAD operates on a **Stateless-to-Stateful Loop**. It doesn't just predict text; it observes the filesystem, plans an architecture, and executes commands.

### The Agentic Loop
1.  **Ingest:** User prompt + Current Directory Map.
2.  **Think:** Internal monologue to determine which files to read/write.
3.  **Act:** JSON-based tool calls (Read, Write, List, Exec).
4.  **Observe:** Capture the output of the tool and feed it back into the brain.



---

## ⚙️ Tech Stack

*   **Runtime:** Node.js (ESM)
*   **Inference:** Ollama (Local)
*   **Recommended Model:** `qwen2.5-coder:3b` (Optimized for speed/logic balance)
*   **Validation:** Zod (Strict JSON Schema enforcement)
*   **Interface:** Clack (Terminal UI/UX)

---

## 📦 Project Structure

```bash
nomad-core/
├── src/
│   ├── agent/
│   │   ├── brain.js       # LLM Orchestrator & System Prompts
│   │   └── loop.js        # The Thought-Action-Observation cycle
│   ├── tools/
│   │   ├── filesystem.js  # read_file, write_file, list_dir
│   │   └── terminal.js    # execute_command (The "Hands")
│   ├── utils/
│   │   ├── json.js        # Regex-based JSON extraction & Repair
│   │   └── logger.js      # Chalk-based terminal styling
│   └── index.js           # CLI Entry Point
├── .nomad/                # Hidden local session memory
└── package.json
```

---

## 🧠 Tool Capabilities

| Tool | Action | Description |
| :--- | :--- | :--- |
| `list_files` | Observation | Returns a recursive tree of the current project. |
| `read_file` | Context | Pulls the full content of a file into the LLM context. |
| `write_file` | Execution | Creates or overwrites files with generated code. |
| `shell_exec` | Power | Runs terminal commands (npm install, git commit, etc). |

---

## 🚦 One-Day Development Roadmap

### **Morning: The Hardware (I/O)**
*   [ ] Implement **Filesystem Tools**: Securely read/write to the local disk.
*   [ ] Implement **Terminal Tool**: Execute shell commands with `child_process`.
*   [ ] Connect **Ollama**: Build the streaming bridge to `localhost:11434`.

### **Afternoon: The Brain (Logic)**
*   [ ] The **System Prompt**: Fine-tune the "Thinking" instructions for small models.
*   [ ] The **JSON Parser**: Build a robust "Extractor" that handles LLM yapping.
*   [ ] The **Recursive Loop**: Implement the logic that allows the agent to self-correct.

### **Evening: The Vibe (UX)**
*   [ ] **Terminal Styling**: Add spinners, success checkmarks, and error alerts.
*   [ ] **Safety Layer**: Implement a "Permission Prompt" for sensitive shell commands.
*   [ ] **Session Export**: Save the "Thought Trace" to a log file for debugging.

---

## 💡 Why NOMAD?

Most agents are "Chat-First." NOMAD is **"Project-First."** It understands that code isn't just a string; it's a living directory of interconnected logic. By using local models, you never have to worry about hitting a rate limit in the middle of a breakthrough.

**Built for speed. Built for local. Built for the T480. 🚀**

