# 🚀 NOMAD-1 Project Phases

This document outlines the step-by-step development roadmap for the NOMAD-1 AI Terminal Execution Agent.

---

## ✅ Phase 1: Foundation & Skeleton (Current State - Completed)

The goal of this phase was to establish the modular architecture and build the basic infrastructure needed for the agent to operate.

*   [x] Establish project directory structure (`brain`, `planner`, `executer`, `memory`, `safety`, `db`, `agent`).
*   [x] Set up database connection (MongoDB) for session storage (`db/mongo.py`).
*   [x] Create foundational schemas for memory components (`memory/memory.py`).
*   [x] Build the base LLM interface and API client wrapper (`brain/brain.py`, `brain/llm_client.py`).
*   [x] Define the main API server entry point using FastAPI (`main.py`).

---

## ✅ Phase 2: Core Agent Loop & Planning (Completed)

This phase focuses on the cognitive side: taking a user's goal, converting it into a plan, and setting up the control loop.

*   [x] **Fix Entry Point:** Resolve syntax errors in `main.py` and ensure the FastAPI server runs correctly.
*   [x] **Implement Planner (`planner/planner.py`):** 
    *   Write prompts and logic to convert user intent into a structured JSON `TODO list`.
    *   Test JSON parsing and validation from the LLM.
*   [x] **Build the Agent Loop (`agent/loop.py`):**
    *   Create the central controller that receives a session/goal.
    *   Connect the controller to the Planner to generate tasks.
    *   Set up the basic iteration logic over the pending tasks.

---

## 🏃 Phase 3: Execution & Safety Validator (Next Steps)

This phase introduces the physical capabilities of the agent: executing commands and ensuring it does so safely.

*   [ ] **Develop Safety Validator (`safety/validator.py`):**
    *   Create a denylist of dangerous commands (e.g., `rm -rf /`).
    *   Validate execution paths.
*   [ ] **Implement Executor (`executer/shell.py`):**
    *   Use Python's `subprocess` module to run basic shell commands.
    *   Integrate the safety validator before any execution.
    *   Capture standard output (stdout), errors (stderr), and exit codes.
*   [ ] **Connect Executor to Loop:** 
    *   Have the Agent Loop pass planned tasks to the Executor and receive the result.

---

## 🧠 Phase 4: Feedback Loop & Refinement

Here, the agent gains its "learning" loop. It evaluates what it just did and decides how to proceed.

*   [ ] **Implement Feedback to Brain:** Send the execution result (stdout/stderr) back to the LLM.
*   [ ] **Dynamic Re-planning:** Enable the agent to modify its `TODO list` if a step fails or if new information is discovered.
*   [ ] **Context Management:** Ensure short-term memory is updated correctly without overwhelming the LLM's context window.
*   [ ] **Error Recovery:** Teach the agent to try alternative commands if an initial command fails.

---

## 🚀 Phase 5: Polish & V1 Release

Finalizing the core agent for its first functional release.

*   [ ] **CLI / UI Implementation:** Build a clean way to visualize the agent's thoughts and actions (e.g., using `rich` for CLI, or a simple Web UI since you have FastAPI).
*   [ ] **Sandboxing (Optional for V1):** Explore executing commands in a restricted Docker environment for maximum safety.
*   [ ] **End-to-End Testing:** Run full tasks (like creating a Node.js project) and verify the loop completes autonomously.
*   [ ] **Documentation:** Update README and inline code docs.

---

## 🔮 Phase 6: Future Enhancements (Post V1)

*   [ ] 🔌 Plugin / Tool System (e.g., browser tools, API tools).
*   [ ] 🧑‍💻 Advanced Code Generation & editing capabilities.
*   [ ] 🧠 Vector memory for semantic recall of past solutions.
*   [ ] 🔄 Parallel task execution for independent steps.
