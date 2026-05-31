const AI_MODELS = [
  {
    id: "gemini",
    name: "Google Gemini (rozszerzenie Chrome)",
    buildUrl: (text) =>
      `https://gemini.google.com/app?prompt=${encodeURIComponent(text)}`,
    note: "Wymaga rozszerzenia Gemini URL Prompt w Chrome.",
    extensionUrl:
      "https://chromewebstore.google.com/detail/gemini-url-prompt/kdbgjkfdooaiompgeckjbegnnccchmma"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    buildUrl: (text) => `https://chatgpt.com/?q=${encodeURIComponent(text)}`
  },
  {
    id: "claude",
    name: "Claude",
    buildUrl: (text) => `https://claude.ai/new?q=${encodeURIComponent(text)}`
  },
  {
    id: "qwen",
    name: "Qwen 3.7 (通义千问)",
    buildUrl: (text) => `https://chat.qwen.ai/?q=${encodeURIComponent(text)}`
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    buildUrl: (text) => `https://copilot.microsoft.com/?q=${encodeURIComponent(text)}`
  },
  {
    id: "perplexity",
    name: "Perplexity",
    buildUrl: (text) => `https://www.perplexity.ai/search?q=${encodeURIComponent(text)}`
  },
  {
    id: "meta",
    name: "Meta AI",
    buildUrl: (text) => `https://www.meta.ai/?q=${encodeURIComponent(text)}`
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    buildUrl: (text) => `https://chat.deepseek.com/?q=${encodeURIComponent(text)}`
  }
];

const MODIFY_PREFIX =
  "Zmodyfikuj ten prompt do generowania tapety. Ulepsz opis, zachowaj proporcje i styl. Oryginalny prompt:\n\n";

const state = {
  prompts: { landscape_16_9: [], portrait_9_16: [] },
  activeTab: "landscape_16_9",
  search: "",
  pendingPrompt: null
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();
  setupAiModelModal();
  registerServiceWorker();
  setupInstallPrompt();
  setupFirstUseModal();

  try {
    const response = await fetch("./prompts.json");
    state.prompts = await response.json();
    renderPrompts();
    updateStats();
  } catch (error) {
    els.promptList.innerHTML =
      '<div class="empty-state">Nie udało się wczytać promptów. Uruchom aplikację przez lokalny serwer HTTP.</div>';
    console.error(error);
  }
}

function cacheElements() {
  els.promptList = document.getElementById("prompt-list");
  els.searchInput = document.getElementById("search-input");
  els.stats = document.getElementById("stats");
  els.toast = document.getElementById("toast");
  els.tabButtons = document.querySelectorAll(".tab-btn");
  els.installBanner = document.getElementById("install-banner");
  els.installBtn = document.getElementById("install-btn");
  els.aiModelModal = document.getElementById("ai-model-modal");
  els.aiModelList = document.getElementById("ai-model-list");
  els.aiModelCancel = document.getElementById("ai-model-cancel");
}

function setupAiModelModal() {
  if (!els.aiModelList) return;

  els.aiModelList.innerHTML = AI_MODELS.map(
    (model) => `
      <li>
        <button class="ai-model-option" type="button" data-model-id="${model.id}">
          ${escapeHtml(model.name)}
          ${model.note ? `<small>${escapeHtml(model.note)}</small>` : ""}
        </button>
      </li>
    `
  ).join("");

  els.aiModelList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-model-id]");
    if (!button || !state.pendingPrompt) return;

    const modelId = button.dataset.modelId;
    const prompt = state.pendingPrompt;
    closeAiModelModal();
    openInAi(prompt, modelId);
  });

  els.aiModelCancel.addEventListener("click", closeAiModelModal);
  els.aiModelModal.querySelectorAll("[data-close-ai-modal]").forEach((el) => {
    el.addEventListener("click", closeAiModelModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.aiModelModal && !els.aiModelModal.hidden) {
      closeAiModelModal();
    }
  });
}

function openAiModelModal(prompt) {
  state.pendingPrompt = prompt;
  els.aiModelModal.hidden = false;
  els.aiModelModal.setAttribute("aria-hidden", "false");
  els.aiModelList.querySelector(".ai-model-option")?.focus();
}

function closeAiModelModal() {
  state.pendingPrompt = null;
  els.aiModelModal.hidden = true;
  els.aiModelModal.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderPrompts();
    updateStats();
  });

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      els.tabButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      renderPrompts();
      updateStats();
    });
  });

  els.promptList.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest("[data-action='copy']");
    const aiBtn = event.target.closest("[data-action='modify-ai']");

    if (copyBtn) {
      const index = Number(copyBtn.dataset.index);
      const prompt = getActivePrompts()[index];
      await copyToClipboard(prompt);
      showToast("Skopiowano prompt do schowka");
      return;
    }

    if (aiBtn) {
      const index = Number(aiBtn.dataset.index);
      const prompt = getActivePrompts()[index];
      openAiModelModal(prompt);
    }
  });
}

function getActivePrompts() {
  return state.prompts[state.activeTab] || [];
}

function getFilteredPrompts() {
  const prompts = getActivePrompts();
  if (!state.search) return prompts;

  return prompts.filter((prompt) => prompt.toLowerCase().includes(state.search));
}

function renderPrompts() {
  const filtered = getFilteredPrompts();
  const formatLabel = state.activeTab === "landscape_16_9" ? "16:9 desktop" : "9:16 phone";

  if (!filtered.length) {
    els.promptList.innerHTML =
      '<div class="empty-state">Brak wyników dla podanej frazy. Spróbuj innego słowa kluczowego.</div>';
    return;
  }

  els.promptList.innerHTML = filtered
    .map((prompt, visibleIndex) => {
      const originalIndex = getActivePrompts().indexOf(prompt) + 1;
      return `
        <article class="prompt-card">
          <header>
            <span class="prompt-number">#${originalIndex}</span>
            <span class="format-badge">${formatLabel}</span>
          </header>
          <p class="prompt-text">${escapeHtml(prompt)}</p>
          <div class="prompt-actions">
            <button class="btn btn-copy" data-action="copy" data-index="${getActivePrompts().indexOf(prompt)}" type="button">Kopiuj do schowka</button>
            <button class="btn btn-ai" data-action="modify-ai" data-index="${getActivePrompts().indexOf(prompt)}" type="button">Modyfikuj z AI</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateStats() {
  const total = getActivePrompts().length;
  const visible = getFilteredPrompts().length;
  const label = state.activeTab === "landscape_16_9" ? "16:9" : "9:16";
  els.stats.textContent = `Widoczne: ${visible} / ${total} promptów (${label})`;
}

function openInAi(prompt, modelId) {
  const model = AI_MODELS.find((item) => item.id === modelId) || AI_MODELS[0];
  const fullPrompt = `${MODIFY_PREFIX}${prompt}`;
  const url = model.buildUrl(fullPrompt);
  window.open(url, "_blank", "noopener,noreferrer");

  if (model.id === "gemini") {
    showToast("Otwarto Gemini — upewnij się, że masz rozszerzenie Gemini URL Prompt");
  } else {
    showToast(`Wysłano prompt do ${model.name}`);
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

let deferredInstallPrompt = null;

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installBanner.classList.add("show");
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast("Użyj menu przeglądarki: Zainstaluj aplikację / Dodaj do ekranu głównego");
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installBanner.classList.remove("show");
  });
}

const FIRST_USE_KEY = "tapety-studio-first-use-v1";

function setupFirstUseModal() {
  const modal = document.getElementById("first-use-modal");
  const closeBtn = document.getElementById("first-use-close");
  if (!modal || !closeBtn) return;

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    localStorage.setItem(FIRST_USE_KEY, "1");
  };

  if (!localStorage.getItem(FIRST_USE_KEY)) {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  }

  closeBtn.addEventListener("click", closeModal);
  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}
