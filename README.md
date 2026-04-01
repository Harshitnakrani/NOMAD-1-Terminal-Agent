
# 🚀 NOMAD-1 — AI Terminal Execution Agent

## 🧠 Overview

**NOMAD-1** is an autonomous AI-powered terminal agent that can:

* Understand a user's goal
* Break it into structured tasks (TODO list)
* Execute commands step-by-step
* Learn from execution results
* Iterate until completion

It follows a **looped agent architecture**:

> **Observe → Plan → Execute → Evaluate → Repeat**

---

## 🎯 Vision

To build a **developer-grade AI execution agent** that can:

* Automate terminal workflows
* Assist in development tasks
* Act as a foundation for future autonomous systems

---

## 🏗️ Architecture

### 🔷 High-Level Flow

```
Client → Server → Brain → Planner → Executor → Memory → Brain (loop)
```

---

## 🧩 Core Modules

### 1. 🧠 Brain (LLM Interface)

Responsible for reasoning and decision-making.

**Functions:**

* Understand user goal
* Generate structured JSON output
* Decide next action
* Control loop (`returnToBrain`)

---

### 2. 📋 Planner

First step of execution.

**Responsibilities:**

* Convert user goal into structured TODO list

**Example Output:**

```json
[
  {
    "id": 1,
    "task": "Create project folder",
    "status": "pending",
    "tool": "shell"
  },
  {
    "id": 2,
    "task": "Create index.js file",
    "status": "pending",
    "tool": "file"
  }
]
```

---

### 3. ⚙️ Executor

Handles actual system execution.

**Supports:**

* Shell commands
* File operations
* Future: APIs, scripts, tools

**Example:**

```json
{
  "type": "shell",
  "command": "mkdir my-project"
}
```

---

### 4. 🛡️ Safety Layer (Validator)

Prevents dangerous execution.

**Validates:**

* Unsafe commands (`rm -rf /`)
* Invalid paths
* Infinite loops
* Restricted operations

---

### 5. 📜 Memory Module

#### 🔹 Short-Term Memory

* Current step
* Last output
* Errors

#### 🔹 Long-Term Memory (optional)

* Stored in database
* Session history
* Execution logs

---

### 6. 🗄️ Database (MongoDB)

Stores session state.

**Schema Example:**

```json
{
  "sessionId": "string",
  "goal": "string",
  "todo_list": [],
  "current_step": 0,
  "history": [],
  "status": "running"
}
```

---

### 7. 🔁 Agent Loop Controller

Controls execution lifecycle.

**Flow:**

```
1. Receive user input
2. Check/Create session
3. Generate TODO list (Planner)
4. Loop:
   - Pick next task
   - Execute task
   - Store result
   - Send result back to Brain
   - Brain decides next step
5. End when complete
```

---

## 🔄 Execution Flow

### Step-by-Step

1. User sends a task

2. Server checks session:

   * If exists → load
   * Else → create new

3. Brain generates TODO list

4. Loop begins:

   * Select next task
   * Execute via Executor
   * Store result in DB
   * Send feedback to Brain

5. Brain decides:

   * Continue
   * Modify plan
   * Retry
   * Finish

6. Final conclusion returned to user

---

## 🧾 Brain Output Format

```json
{
  "type": "create_todo" | "execute_task" | "final_answer",
  "todo": [],
  "task_id": 1,
  "command": {
    "type": "shell",
    "command": "mkdir test"
  },
  "returnToBrain": true
}
```

---

## 📁 Project Structure

```
nomad/
│
├── brain/
│   └── llm_client.py
│
├── planner/
│   └── planner.py
│
├── executor/
│   ├── shell.py
│   ├── file_ops.py
│   └── registry.py
│
├── safety/
│   └── validator.py
│
├── memory/
│   ├── short_term.py
│   └── long_term.py
│
├── agent/
│   └── loop.py
│
├── db/
│   └── mongo.py
│
└── main.py
```

---

## ⚡ Tech Stack

* **Language:** Python
* **LLM:** any local model via ollama and for development :- Groq (llama-3.1-8b-instant)
* **Database:** MongoDB
* **Execution:** subprocess
* **Validation:** Pydantic
* **CLI UI (optional):** Rich

---

## 🧠 Design Principles

* Modular architecture
* Clear separation of concerns
* Structured communication (JSON)
* Safe execution
* Iterative reasoning loop

---

## 🚀 Future Enhancements

* 🔌 Plugin/tool system
* 🌐 Web browsing capability
* 🧑‍💻 Code generation + editing
* 🐛 Self-debugging loops
* 🧠 Vector memory (semantic recall)
* 🔄 Parallel task execution

---

## ⚠️ Limitations (v1)

* Limited toolset
* No sandboxed execution (yet)
* Basic error recovery
* Linear task execution

---

## 🧪 Example Use Case

**Input:**

```
Create a Node.js project with index.js and install express
```

**Execution:**

* Create folder
* Initialize npm
* Install express
* Create index.js

---

## 💡 Philosophy

NOMAD is not just a script runner.

It is:

> 🧠 A thinking system
> ⚙️ A doing system
> 🔁 A learning loop

---

## 👨‍💻 Author

**Harshit Nakrani**

---

## ⭐ Final Note

This is the foundation of something powerful.

If built correctly, NOMAD can evolve into:

* a developer assistant
* an autonomous coding agent
* a full AI operating layer

---

**Build smart. Build safe. Build powerful. 🚀**
