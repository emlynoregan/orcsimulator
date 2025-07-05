**Title: Running a Chat-Orc NPC Entirely in the Browser Using Qwen 0.5B and WASM**

**Overview**
This document describes an implementation strategy for embedding a small language model (LLM) in a browser-based roleplaying game (RPG) to power a non-player character (NPC) named Munch, an angry orc. The character engages players in dynamic dialogue, staying in-character with improvised responses, including reacting to threats or offers of food. The entire interaction runs client-side, with no server or API dependencies.

**Objective**
To create a browser-based RPG chat interface where the user can roleplay with an angry orc ("Munch") who guards a magic amulet. The orc is reactive, short-tempered, and softens only when offered food. All AI inference is performed in the user's browser using WebAssembly.

**Model Selection**
We use **Qwen2-0.5B-Instruct**, a 500 million parameter instruction-tuned transformer model released by Alibaba. It provides a good balance of size and performance for in-browser use. The model is distributed in quantized GGUF format, which allows efficient execution through the `wllama` runtime in WebAssembly.

**Advantages**

* No server infrastructure required
* Low latency (sub-second responses on desktop)
* Full offline capability after initial load
* Avoids API costs and data privacy issues

**Limitations**

* First load requires \~120 MB download
* Performance degrades on older phones or single-threaded Safari
* No persistent memory or session history unless implemented manually

**Technology Stack**

* **Model**: Qwen2-0.5B-Instruct (quantized to Q4\_0)
* **Runtime**: [wllama](https://github.com/wllama/wllama) (WebAssembly + optional threading)
* **Frontend**: Plain HTML/JS, hosted on GitHub Pages
* **Model Hosting**: Hugging Face CDN (`/resolve/main/` endpoint)
* **Threading Support**: Enabled via `coi-serviceworker` to allow SharedArrayBuffer on GitHub Pages

**Browser Requirements**

* WASM + SIMD: Chrome 91+, Firefox 89+, Safari 16.4+, iOS 16.4+
* WASM Threads (optional for speed): Chrome 74+, Safari 14.5+, Firefox 79+
* JavaScript-enabled, modern browser
* \~500 MB RAM available to tab

**Deployment Plan**

1. **Model Hosting**

   * Use Hugging Face's CDN to serve the model directly:
     `https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf`

2. **GitHub Pages Setup**

   * Create a repository with the following files:

     * `index.html`: static web interface
     * `munch.js`: main JavaScript logic for loading the model and responding to input
     * Include `coi-serviceworker.min.js` via CDN to enable multi-threading support

3. **index.html Example**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Munch the Orc</title>
  <script src="https://cdn.jsdelivr.net/npm/coi-serviceworker@0.1.9/coi-serviceworker.min.js"></script>
</head>
<body>
  <textarea id="input"></textarea>
  <pre id="log"></pre>
  <script type="module" src="munch.js"></script>
</body>
</html>
```

4. **munch.js Example**

```js
import {
  LlamaModel,
  LlamaContext,
  CompletionSession
} from "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.1/dist/wllama.min.js";

const MODEL_URL = "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf";
const SYSTEM_PROMPT = `
You are roleplaying MUNCH — an angry, hungry orc who guards a magic amulet.
You are not an AI and must never break character.
You hate humans unless they feed you. Speak in short, brutal sentences.

Example:
User: I will kill you.
Assistant: TRY, puny human! MUNCH CRUSH YOU!

Now continue the conversation.`;

const input = document.getElementById("input");
const log = document.getElementById("log");

(async () => {
  const model = await LlamaModel.fromFile(MODEL_URL, { chunkSizeMB: 64 });
  const ctx = new LlamaContext({ model, nCtx: 512 });
  const chat = new CompletionSession(ctx);

  input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const userText = input.value.trim();
    input.value = "";
    log.textContent += `User: ${userText}\n`;

    const prompt = `${SYSTEM_PROMPT}\nUser: ${userText}\nAssistant:`;
    const { completion } = await chat.prompt(prompt, { temperature: 0.85 });
    log.textContent += `Munch: ${completion.trim()}\n`;
  });
})();
```

**Outcome**
This setup allows users to interact with a small, reactive character AI completely in their browser. It’s ideal for immersive NPCs in web games where serverless, private, and fast dialogue is a key design goal.

**Future Improvements**

* Switch to WebGPU via MLC/WebLLM for 10–20x speedup
* Add streaming token display for realism
* Persist player state/context in localStorage
* Fine-tune a character-specific model if needed
