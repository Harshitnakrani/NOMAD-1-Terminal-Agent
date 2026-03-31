# 🛠️ NOMAD Core: The Zero-Quota Coding Agent

**NOMAD Core** is a high-performance coding assistant designed for local and cloud-based inference. Built to bypass the "Quota Wall" of cloud-based AI, NOMAD gives you an infinite "Vibe Coding" loop directly on your machine.

> **The Philosophy:** Cloud (Groq) for the heavy lifting in development, Local (Ollama) for the flow in production.

---

## 🏗️ System Design

NOMAD operates on a **Stateless-to-Stateful Loop**. It doesn't just predict text; it observes the filesystem, plans actions, and executes terminal commands.

### The Agentic Loop
1.  **Ingest:** User prompt + Message History.
2.  **Think:** Internal monologue via LLM (Groq/Ollama) to determine the next step.
3.  **Act:** JSON-based tool calls (currently supporting terminal execution).
4.  **Observe:** Capture the output of the terminal command and feed it back into the brain via `returnToBrain`.

---

## ⚙️ Tech Stack

*   **Runtime:** Node.js (TypeScript)
*   **Inference (Dev):** Groq (Llama-3.1-8b-instant)
*   **Inference (Prod):** Ollama (Recommended: `qwen2.5-coder`)
*   **Communication:** JSON-based RPC

---

## 📦 Project Structure

```bash
nomad-core/
├── client/                # Frontend/CLI Interface
│   └── src/
│       └── index.ts
└── server/                # Backend Agent Logic
    └── src/
        ├── agent/         # Agent Service & Task Management
        ├── llm/           # Brain & Prompt Engineering
        ├── tools/         # Terminal & Filesystem Tools
        ├── utils/         # Helper Functions
        ├── index.ts       # Entry Point
        └── server.ts      # API Server
```

---

## 🧠 Tool Capabilities

| Tool | Action | Description |
| :--- | :--- | :--- |
| `runGeneratedCommand` | Execution | Runs terminal commands (npm install, git commit, etc) via `child_process`. |

---

## 🚦 Roadmap

### **Current Status**
*   [x] **Terminal Tool**: Execute shell commands with `child_process`.
*   [x] **Groq Integration**: Fast development inference.
*   [x] **Agentic Loop**: Multi-step task execution with state persistence.

### **Next Steps**
*   [ ] **Local Production Bridge**: Connect Ollama for local-first execution.
*   [ ] **Filesystem Tools**: Specialized `read_file`, `write_file`, and `list_dir` tools.
*   [ ] **Enhanced Brain**: Improved JSON parsing and error recovery.

---

## 💡 Why NOMAD?

Most agents are "Chat-First." NOMAD is **"Task-First."** It understands that code execution is the key to progress. By utilizing Groq for rapid development and Qwen (via Ollama) for local production, NOMAD provides a flexible, cost-effective, and powerful alternative to cloud-only agents.

**Built for speed. Built for local. Built for the flow. 🚀**
