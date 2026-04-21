# 🚀 NOMAD-1 — AI Terminal Execution Agent

**NOMAD-1** is an autonomous AI-powered terminal agent designed to automate complex, multi-step system tasks. It understands high-level user goals, breaks them down into strict JSON-based execution plans, interacts with your local filesystem/terminal, and learns from real-time evaluation of its actions.

It operates on a fully autonomous **Cognitive Loop**:
> **Observe → Plan → Execute → Evaluate → Repeat**

---

## 🏗️ System Architecture

The project is built on a decoupled, full-stack architecture to ensure scalability, safety, and persistent memory.

### The Stack
- **Backend**: Python (FastAPI)
- **Database**: MongoDB (Persists session state and long-term history)
- **Clients**: 
  - 🖥️ **Web UI**: A sleek, glassmorphism HTML/JS frontend (`client/index.html`).
  - 💻 **Terminal CLI**: A beautiful, rich Python command-line interface (`client/cli.py`).
- **Default LLM**: Groq API (`llama-3.1-8b-instant`), easily swappable for local models.

### Advanced Features
- **Live Directory Context (No Blind Spots)**: Before planning or executing any task, NOMAD takes a live snapshot of the target Working Directory and injects it into the prompt. This ensures the agent never hallucinates file structures and knows exactly what files actually exist.
- **Native File Operations (FileOps)**: Instead of relying on fragile bash commands (like `echo > file` or `mkdir`), NOMAD natively routes `file` tools to the `FileExecutor`, leveraging Python's built-in `os` and `shutil` modules for safe, robust filesystem manipulation.
- **Rich Execution Logging**: Both the Web UI and CLI stream the exact terminal outputs (`stdout`/`stderr`) and raw file contents written by the agent directly to your screen in real-time.

---

## 🧩 The Cognitive Loop

1. **Planner (`planner.py`)**: Receives the user goal and the live directory context, outputting a strict JSON `TODO` list.
2. **Executor (`loop.py`)**: 
   - **ShellExecutor (`shell.py`)**: Executes terminal commands safely.
   - **FileExecutor (`file_ops.py`)**: Executes native python file/folder operations.
3. **Safety Validator (`validator.py`)**: Blocks known destructive commands (e.g., `rm -rf /`) before they hit the OS.
4. **Memory (`memory.py`)**: Records the exact command run and the resulting output into MongoDB.
5. **Evaluator (`brain.py`)**: Analyzes the terminal output/errors and decides whether to mark the task as `completed`, `failed`, or to modify the plan and retry.

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- MongoDB instance running locally (or via MongoDB Atlas)

### 1. Install Dependencies
```bash
cd nomad-core
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install fastapi uvicorn pydantic pymongo groq rich requests python-dotenv
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_api_key_here
MONGODB_URL=mongodb://localhost:27017/
MONGODB_NAME=NOMAD-cluster
```

### 3. Start the Server
Run the FastAPI backend on port 8080:
```bash
uvicorn server.app.main:app --reload --port 8080
```

### 4. Launch a Client
**Option A: Terminal CLI (Recommended)**
```bash
python client/cli.py
```

**Option B: Web UI**
Simply open `client/index.html` in your web browser.

---

## 🔌 Using a Local Model (Ollama / LM Studio)

NOMAD-1 is designed to be easily modified to run entirely offline using local LLMs. 

If you want to use **Ollama** or **LM Studio**, you just need to swap out the Groq client for the standard OpenAI Python client in the Brain module.

### How to modify:
1. Install the OpenAI SDK: `pip install openai`
2. Open `nomad-core/server/app/brain/llm_client.py`.
3. Replace the `Groq` initialization with the local endpoint.

**Example for Ollama (`http://localhost:11434`):**
```python
from openai import OpenAI

class LLMClient:
    def __init__(self):
        # Point to your local Ollama instance
        self.client = OpenAI(
            base_url="http://localhost:11434/v1/",
            api_key="ollama" # API key is required but ignored by Ollama
        )
        self.model = "llama3" # Or whatever model you have pulled in Ollama
```

**Example for LM Studio (`http://localhost:1234`):**
```python
from openai import OpenAI

class LLMClient:
    def __init__(self):
        # Point to your local LM Studio instance
        self.client = OpenAI(
            base_url="http://localhost:1234/v1/",
            api_key="lm-studio"
        )
        self.model = "local-model"
```
*Note: Local models must be highly capable of strict JSON output formatting (like Llama-3 8B Instruct) to ensure the Agent Loop does not break.*

---

## 👨‍💻 Author

**Harshit Nakrani**

**Build smart. Build safe. Build powerful. 🚀**
