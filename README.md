# 🗄️ LLMVault v0.1

> A highly secure, VS Code-styled AI Workspace for Hackers. 
> Run Local LLaMA models offline, or Bring Your Own Key (BYOK) for Cloud AIs.

![LLMVault UI](https://github.com/choihimchan/LLMVault/assets/YOUR_IMAGE_LINK) 

## 💡 Why I built this?
I wanted an AI chat interface that feels like my natural workspace (VS Code), respects my privacy, and doesn't lock me into a single cloud provider. **LLMVault** is a boilerplate that gives you full control over your AI interactions.

## ✨ Core Features
* **🕵️‍♂️ Stealth Mode (100% Offline):** Connects directly to `llama.cpp` server. Run Llama 3 or any GGUF models on your local machine without internet.
* **🔑 BYOK Cloud Mode:** Use Gemini 2.5 Pro, GPT-4, or Claude 3 by temporarily injecting your API key. (Keys are NEVER stored in the DB, they vanish on refresh).
* **💻 VS Code Aesthetic:** Designed for developers. Familiar layout, monospaced fonts, and terminal vibes.
* **🗃️ Transparent Logging:** Every conversation is logged into a local `SQLite` database. Open the right-panel terminal to monitor DB transactions in real-time.

## 🚀 Quick Start (How to run)

### 1. Frontend (React + Vite)
```bash
npm install
npm run dev
```

### 2. Backend (FastAPI)
```bash
pip install fastapi uvicorn litellm httpx pydantic python-dotenv
uvicorn main:app --reload
```

### 3. Local LLaMA Setup (Optional but highly recommended)
1. Download `llama-server` from [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
2. Download any `.gguf` model (e.g., Llama-3.2-3B) from HuggingFace.
3. Run the local server on port 8080:
```bash
./llama-server -m your-model.gguf --port 8080
```
4. Select `Local Mode` in the LLMVault UI and enjoy!

## 🛠️ Tech Stack
- Frontend: React, Tailwind CSS, Vite
- Backend: Python, FastAPI, SQLite, LiteLLM, httpx
- Local AI Engine: llama.cpp

## 🤝 Contributing
This is v0.1. It's raw and hackable. PRs for streaming responses, new UI themes, or RAG integrations are deeply welcome!
