const EVENTS = {
  PROMPT_COPY: "prompt_copy",
  PROMPT_MODIFY: "prompt_modify_ai",
  AI_MODEL: "ai_model_pick",
  PROMPBASE: "prompbase_click",
  PWA_INSTALL: "pwa_install",
  IMAGE_TOOL: "image_tool_open",
  PROMPT_RANDOM: "prompt_random",
  CUSTOM_WALLPAPER_AI: "custom_wallpaper_ai"
};

const STORAGE_KEYS = {
  ONBOARDING: "tapety-studio-onboarding-v2",
  AI_MODEL: "tapety-studio-ai-model",
  AI_SKIP_MODAL: "tapety-studio-ai-skip-modal",
  ACTIONS: "tapety-studio-actions",
  PROMPBASE_DISMISS: "tapety-studio-prompbase-dismiss"
};

const PROMPBASE_URL =
  "https://github.com/zetmar-collab/PrompBase-Python/releases/download/v2.4.0/PrompBase.exe";

const PAGE_SIZE = 24;

const CATEGORIES = [
  { id: "all", label: "Wszystkie" },
  { id: "minimal", label: "Minimal" },
  { id: "anime", label: "Anime / pixel" },
  { id: "cyberpunk", label: "Cyberpunk / neon" },
  { id: "natura", label: "Natura" },
  { id: "tech", label: "Tech" },
  { id: "abstract", label: "Abstrakcja" },
  { id: "fantasy", label: "Fantasy" },
  { id: "inne", label: "Inne" }
];

/** prefillMode: gemini | url_query | url_search | clipboard — zawsze kopiujemy też do schowka */
const AI_MODELS = [
  {
    id: "gemini",
    name: "Google Gemini",
    openUrl: "https://gemini.google.com/app",
    prefillMode: "gemini",
    note: "Prompt w schowku + URL. Wymaga rozszerzenia Gemini URL Prompt w Chrome."
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    openUrl: "https://chatgpt.com/",
    prefillMode: "url_query",
    note: "Prompt w schowku; często wypełnia też pole z parametru URL."
  },
  {
    id: "claude",
    name: "Claude",
    openUrl: "https://claude.ai/new",
    prefillMode: "url_query",
    note: "Prompt w schowku; jeśli pole puste — wklej Ctrl+V."
  },
  {
    id: "qwen",
    name: "Qwen 3.7 (通义千问)",
    openUrl: "https://chat.qwen.ai/",
    prefillMode: "clipboard",
    note: "Prompt w schowku — wklej Ctrl+V (Qwen nie obsługuje URL z tekstem)."
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    openUrl: "https://copilot.microsoft.com/",
    prefillMode: "clipboard",
    note: "Prompt w schowku — wklej Ctrl+V w polu wiadomości."
  },
  {
    id: "perplexity",
    name: "Perplexity (inspiracje)",
    openUrl: "https://www.perplexity.ai/search",
    prefillMode: "url_search",
    note: "Prompt w schowku + wyszukiwanie. Do inspiracji, nie pełnej edycji."
  },
  {
    id: "meta",
    name: "Meta AI",
    openUrl: "https://www.meta.ai/",
    prefillMode: "clipboard",
    note: "Prompt w schowku — wklej Ctrl+V."
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    openUrl: "https://chat.deepseek.com/",
    prefillMode: "clipboard",
    note: "Prompt w schowku — wklej Ctrl+V."
  }
];

function buildModelUrl(model, fullPrompt) {
  const encoded = encodeURIComponent(fullPrompt);

  switch (model.prefillMode) {
    case "gemini":
      return `${model.openUrl}?prompt=${encoded}`;
    case "url_query":
      return `${model.openUrl}?q=${encoded}`;
    case "url_search":
      return `${model.openUrl}?q=${encoded}`;
    default:
      return model.openUrl;
  }
}

function getModifyToastMessage(model) {
  switch (model.prefillMode) {
    case "gemini":
      return "Skopiowano prompt. Gemini: wklej Ctrl+V lub użyj rozszerzenia Gemini URL Prompt.";
    case "url_query":
      return `Skopiowano do schowka — otwarto ${model.name}. Jeśli pole jest puste, wklej Ctrl+V.`;
    case "url_search":
      return "Skopiowano prompt — otwarto Perplexity. W razie potrzeby wklej Ctrl+V.";
    default:
      return `Skopiowano prompt — otwarto ${model.name}. Wklej w polu wiadomości: Ctrl+V.`;
  }
}

const IMAGE_TOOLS = [
  {
    id: "bing",
    name: "Microsoft Copilot / Designer",
    url: "https://copilot.microsoft.com/"
  },
  {
    id: "leonardo",
    name: "Leonardo.ai",
    url: "https://app.leonardo.ai/"
  },
  {
    id: "ideogram",
    name: "Ideogram",
    url: "https://ideogram.ai/"
  }
];

const MODIFY_PREFIX =
  "Zmodyfikuj ten prompt do generowania tapety. Ulepsz opis, zachowaj proporcje i styl. Oryginalny prompt:\n\n";

const CUSTOM_FORMATS = {
  landscape_16_9: {
    label: "16:9 Desktop",
    suffix: "4K, horizontal 16:9 desktop wallpaper",
    aspectHint: "poziomy format 16:9 na pulpit"
  },
  portrait_9_16: {
    label: "9:16 Telefon",
    suffix: "4K, vertical 9:16 phone wallpaper",
    aspectHint: "pionowy format 9:16 na telefon"
  }
};

const CUSTOM_STYLES = {
  realistic: {
    label: "Realistyczne",
    directive:
      "styl fotorealistyczny, naturalne światło, wysoki poziom detalu, jak profesjonalna fotografia / render 4K"
  },
  illustration: {
    label: "Ilustracja",
    directive:
      "styl cyfrowej ilustracji, artystyczna kompozycja, żywe kolory, dopracowane detale, estetyka nowoczesnej grafiki"
  },
  anime: {
    label: "Anime",
    directive:
      "styl anime, miękkie światło, czyste kolory, inspiracja Studio Ghibli lub nowoczesne anime, bez fotorealizmu"
  }
};

const state = {
  prompts: { landscape_16_9: [], portrait_9_16: [] },
  activeTab: "landscape_16_9",
  search: "",
  category: "all",
  visibleCount: PAGE_SIZE,
  pendingPrompt: null,
  pendingAiMode: "modify",
  customFormat: "landscape_16_9",
  customStyle: "realistic",
  highlightIndex: null
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function track(name, props = {}) {
  if (typeof window.plausible === "function") {
    window.plausible(name, { props });
  }
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.debug("[track]", name, props);
  }
}

function getActionCount() {
  return Number(localStorage.getItem(STORAGE_KEYS.ACTIONS) || "0");
}

function incrementActionCount() {
  const next = getActionCount() + 1;
  localStorage.setItem(STORAGE_KEYS.ACTIONS, String(next));
  maybeShowPrompbaseBanner(next);
  return next;
}

function maybeShowPrompbaseBanner(count) {
  if (!els.prompbaseBanner) return;
  if (localStorage.getItem(STORAGE_KEYS.PROMPBASE_DISMISS)) return;
  if (count >= 3) els.prompbaseBanner.classList.add("show");
}

async function init() {
  cacheElements();
  bindEvents();
  setupAiModelModal();
  setupImageToolModal();
  registerServiceWorker();
  setupInstallPrompt();
  setupFirstUseModal();
  setupPrompbaseBanner();
  setupCustomWallpaper();
  renderCategoryChips();
  maybeShowPrompbaseBanner(getActionCount());

  try {
    const response = await fetch("./prompts.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.prompts = await response.json();
    renderPrompts();
    updateStats();
  } catch (error) {
    showLoadError(error);
    console.error(error);
  }
}

function showLoadError(error) {
  const isFileProtocol = window.location.protocol === "file:";
  els.promptList.innerHTML = `
    <div class="empty-state empty-state--error">
      <p><strong>Nie udało się wczytać promptów.</strong></p>
      <p>${
        isFileProtocol
          ? "Otworzyłeś plik bezpośrednio z dysku — uruchom aplikację przez lokalny serwer HTTP lub wersję online (GitHub Pages)."
          : "Sprawdź połączenie lub uruchom aplikację przez skrypt setup/run z folderu <code>scripts</code>."
      }</p>
      <p class="empty-state-actions">
        <a class="btn btn-primary" href="scripts/PIERWSZE-URUCHOMIENIE.txt">Instrukcja pierwszego uruchomienia</a>
      </p>
      <p class="empty-state-hint">Szczegóły: ${escapeHtml(error?.message || "nieznany błąd")}</p>
    </div>
  `;
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
  els.aiSkipModal = document.getElementById("ai-skip-modal");
  els.categoryChips = document.getElementById("category-chips");
  els.loadMoreBtn = document.getElementById("load-more-btn");
  els.prompbaseBanner = document.getElementById("prompbase-banner");
  els.imageToolModal = document.getElementById("image-tool-modal");
  els.imageToolList = document.getElementById("image-tool-list");
  els.imageToolCancel = document.getElementById("image-tool-cancel");
  els.menuCreateWallpaper = document.getElementById("menu-create-wallpaper");
  els.menuLibrary = document.getElementById("menu-library");
  els.menuRandom = document.getElementById("menu-random");
  els.customWallpaperModal = document.getElementById("custom-wallpaper-modal");
  els.customWallpaperCancel = document.getElementById("custom-wallpaper-cancel");
  els.customDescription = document.getElementById("custom-description");
  els.customSendAi = document.getElementById("custom-send-ai");
  els.customFormatButtons = document.querySelectorAll("[data-custom-format]");
  els.customStyleButtons = document.querySelectorAll("[data-custom-style]");
  els.aiModelSubtitle = document.getElementById("ai-model-subtitle");
}

function openCustomWallpaperModal() {
  if (!els.customWallpaperModal) return;
  els.customWallpaperModal.hidden = false;
  els.customWallpaperModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  window.setTimeout(() => els.customDescription?.focus(), 50);
}

function closeCustomWallpaperModal() {
  if (!els.customWallpaperModal) return;
  els.customWallpaperModal.hidden = true;
  els.customWallpaperModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function buildCustomWallpaperInstruction(formatId, styleId, description) {
  const format = CUSTOM_FORMATS[formatId] || CUSTOM_FORMATS.landscape_16_9;
  const style = CUSTOM_STYLES[styleId] || CUSTOM_STYLES.realistic;

  return `Jesteś ekspertem od promptów do generatorów obrazów AI (tapety na urządzenia).

ZADANIE: Na podstawie opisu użytkownika napisz JEDEN gotowy prompt do wygenerowania tapety. Prompt ma być gotowy do wklejenia w Midjourney, DALL·E, Leonardo, Ideogram, Copilot Designer itp.

WYMAGANIA TECHNICZNE:
- ${format.aspectHint}
- Na końcu promptu MUSI być dokładnie ten fragment (bez zmian): "${format.suffix}"
- Styl grafiki: ${style.directive}
- Jakość: 4K, ultra-detailed, wallpaper composition
- Bez tekstu na obrazie, bez logo, bez znaku wodnego, bez ramki telefonu, bez interfejsu UI
- Kompozycja czytelna jako tapeta (główny motyw, spokojne tło, miejsce na ikony na telefonie jeśli 9:16)

FORMAT ODPOWIEDZI:
- Zwróć WYŁĄCZNIE gotowy prompt (jeden akapit, po angielsku — lepiej działa w generatorach obrazów)
- Bez wstępu, bez listy, bez wyjaśnień, bez cudzysłowów wokół całości

OPIS UŻYTKOWNIKA (PL):
${description.trim()}`;
}

function setupCustomWallpaper() {
  const setOptionGroup = (buttons, attr, stateKey) => {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute(attr);
        state[stateKey] = value;
        buttons.forEach((b) => {
          const active = b.getAttribute(attr) === value;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    });
  };

  setOptionGroup(els.customFormatButtons, "data-custom-format", "customFormat");
  setOptionGroup(els.customStyleButtons, "data-custom-style", "customStyle");

  els.customSendAi?.addEventListener("click", handleCustomWallpaperSubmit);

  els.menuCreateWallpaper?.addEventListener("click", openCustomWallpaperModal);
  els.customWallpaperCancel?.addEventListener("click", closeCustomWallpaperModal);
  els.customWallpaperModal?.querySelectorAll("[data-close-custom-modal]").forEach((el) => {
    el.addEventListener("click", closeCustomWallpaperModal);
  });

  els.menuLibrary?.addEventListener("click", () => {
    document.getElementById("prompt-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    els.searchInput?.focus();
  });

  els.menuRandom?.addEventListener("click", () => pickRandomPrompt());

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      els.customWallpaperModal &&
      !els.customWallpaperModal.hidden
    ) {
      closeCustomWallpaperModal();
    }
  });
}

function handleCustomWallpaperSubmit() {
  const description = els.customDescription?.value.trim() || "";

  if (description.length < 10) {
    showToast("Opisz tapetę — minimum 10 znaków.", 3500);
    els.customDescription?.focus();
    return;
  }

  const instruction = buildCustomWallpaperInstruction(
    state.customFormat,
    state.customStyle,
    description
  );

  incrementActionCount();
  track(EVENTS.CUSTOM_WALLPAPER_AI, {
    format: state.customFormat,
    style: state.customStyle
  });

  const skipModal = localStorage.getItem(STORAGE_KEYS.AI_SKIP_MODAL) === "1";
  const savedModel = localStorage.getItem(STORAGE_KEYS.AI_MODEL);

  closeCustomWallpaperModal();

  if (skipModal && savedModel) {
    void openInAi(instruction, savedModel, "custom");
    return;
  }

  openAiModelModal(instruction, "custom");
}

function inferCategory(prompt) {
  const t = prompt.toLowerCase();
  if (/minimal|gradient|geometryczn|pustej przestrzeni|clean design|glassmorphism|bauhaus/.test(t)) {
    return "minimal";
  }
  if (/anime|ghibli|pixel art|manga|kawaii/.test(t)) return "anime";
  if (/cyberpunk|neon|vaporwave|synthwave|hologram/.test(t)) return "cyberpunk";
  if (/gór|las|jezior|natura|plaż|kwiat|lawend|sakur|ocean|pustyn|mglisty|jesien/.test(t)) {
    return "natura";
  }
  if (/tech|programist|monitor|obwod|cloud|cyfrow|ui wallpaper|it /.test(t)) return "tech";
  if (/abstrakcyj|abstract|holograficzn|low poly|izometryczn|3d/.test(t)) return "abstract";
  if (/fantasy|zamek|smok|rycerz|wysp|baśn|magic/.test(t)) return "fantasy";
  return "inne";
}

function renderCategoryChips() {
  if (!els.categoryChips) return;

  els.categoryChips.innerHTML = CATEGORIES.map(
    (cat) => `
      <button type="button" class="chip ${cat.id === state.category ? "active" : ""}" data-category="${cat.id}">
        ${escapeHtml(cat.label)}
      </button>
    `
  ).join("");
}

function setupPrompbaseBanner() {
  const dismissBtn = document.getElementById("prompbase-dismiss");
  const link = document.querySelector("[data-prompbase-link]");

  dismissBtn?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.PROMPBASE_DISMISS, "1");
    els.prompbaseBanner?.classList.remove("show");
  });

  link?.addEventListener("click", () => track(EVENTS.PROMPBASE));
  document.querySelectorAll("[data-prompbase-link]").forEach((el) => {
    el.addEventListener("click", () => track(EVENTS.PROMPBASE));
  });
}

function setupAiModelModal() {
  if (!els.aiModelList) return;

  const savedModel = localStorage.getItem(STORAGE_KEYS.AI_MODEL);
  const skipModal = localStorage.getItem(STORAGE_KEYS.AI_SKIP_MODAL) === "1";

  if (els.aiSkipModal) {
    els.aiSkipModal.checked = skipModal;
    els.aiSkipModal.addEventListener("change", () => {
      localStorage.setItem(
        STORAGE_KEYS.AI_SKIP_MODAL,
        els.aiSkipModal.checked ? "1" : "0"
      );
    });
  }

  els.aiModelList.innerHTML = AI_MODELS.map((model) => {
    const selected = model.id === savedModel ? " ai-model-option--saved" : "";
    return `
      <li>
        <button class="ai-model-option${selected}" type="button" data-model-id="${model.id}">
          ${escapeHtml(model.name)}
          ${model.note ? `<small>${escapeHtml(model.note)}</small>` : ""}
        </button>
      </li>
    `;
  }).join("");

  els.aiModelList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-model-id]");
    if (!button || !state.pendingPrompt) return;

    const modelId = button.dataset.modelId;
    const prompt = state.pendingPrompt;
    localStorage.setItem(STORAGE_KEYS.AI_MODEL, modelId);
    track(EVENTS.AI_MODEL, { model: modelId });
    const mode = state.pendingAiMode;
    closeAiModelModal();
    void openInAi(prompt, modelId, mode);
  });

  els.aiModelCancel?.addEventListener("click", closeAiModelModal);
  els.aiModelModal?.querySelectorAll("[data-close-ai-modal]").forEach((el) => {
    el.addEventListener("click", closeAiModelModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.aiModelModal && !els.aiModelModal.hidden) {
      closeAiModelModal();
    }
  });
}

function setupImageToolModal() {
  if (!els.imageToolList) return;

  els.imageToolList.innerHTML = IMAGE_TOOLS.map(
    (tool) => `
      <li>
        <button class="ai-model-option" type="button" data-image-tool="${tool.id}">
          ${escapeHtml(tool.name)}
          <small>Otwórz stronę — prompt jest już w schowku</small>
        </button>
      </li>
    `
  ).join("");

  els.imageToolList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-image-tool]");
    if (!button || state.pendingPrompt == null) return;

    const tool = IMAGE_TOOLS.find((t) => t.id === button.dataset.imageTool);
    if (!tool) return;

    await copyToClipboard(state.pendingPrompt);
    track(EVENTS.IMAGE_TOOL, { tool: tool.id });
    window.open(tool.url, "_blank", "noopener,noreferrer");
    closeImageToolModal();
    showToast(`Skopiowano prompt — wklej w ${tool.name}`);
  });

  els.imageToolCancel?.addEventListener("click", closeImageToolModal);
  els.imageToolModal?.querySelectorAll("[data-close-image-modal]").forEach((el) => {
    el.addEventListener("click", closeImageToolModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.imageToolModal && !els.imageToolModal.hidden) {
      closeImageToolModal();
    }
  });
}

function openImageToolModal(prompt) {
  state.pendingPrompt = prompt;
  els.imageToolModal.hidden = false;
  els.imageToolModal.setAttribute("aria-hidden", "false");
}

function closeImageToolModal() {
  state.pendingPrompt = null;
  els.imageToolModal.hidden = true;
  els.imageToolModal.setAttribute("aria-hidden", "true");
}

function updateAiModalSubtitle(mode) {
  if (!els.aiModelSubtitle) return;

  if (mode === "custom") {
    els.aiModelSubtitle.textContent =
      "AI przygotuje gotowy prompt do generatora obrazu — polecenie jest w schowku, wklej Ctrl+V jeśli trzeba";
  } else {
    els.aiModelSubtitle.textContent =
      "Pełny tekst do modyfikacji trafi do schowka — potem otworzy się wybrany czat";
  }
}

function openAiModelModal(prompt, mode = "modify") {
  state.pendingPrompt = prompt;
  state.pendingAiMode = mode;
  updateAiModalSubtitle(mode);
  els.aiModelModal.hidden = false;
  els.aiModelModal.setAttribute("aria-hidden", "false");
  els.aiModelList.querySelector(".ai-model-option")?.focus();
}

function closeAiModelModal() {
  state.pendingPrompt = null;
  state.pendingAiMode = "modify";
  updateAiModalSubtitle("modify");
  els.aiModelModal.hidden = true;
  els.aiModelModal.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    state.visibleCount = PAGE_SIZE;
    renderPrompts();
    updateStats();
  });

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      state.visibleCount = PAGE_SIZE;
      els.tabButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderCategoryChips();
      renderPrompts();
      updateStats();
    });
  });

  els.categoryChips?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    state.visibleCount = PAGE_SIZE;
    renderCategoryChips();
    renderPrompts();
    updateStats();
  });

  els.loadMoreBtn?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderPrompts();
    updateStats();
  });

  els.promptList.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest("[data-action='copy']");
    const aiBtn = event.target.closest("[data-action='modify-ai']");
    const imageBtn = event.target.closest("[data-action='open-image']");

    if (copyBtn) {
      const index = Number(copyBtn.dataset.index);
      const prompt = getActivePrompts()[index];
      await copyToClipboard(prompt);
      incrementActionCount();
      track(EVENTS.PROMPT_COPY, { format: state.activeTab });
      showToast("Skopiowano prompt do schowka");
      return;
    }

    if (aiBtn) {
      const index = Number(aiBtn.dataset.index);
      const prompt = getActivePrompts()[index];
      incrementActionCount();
      track(EVENTS.PROMPT_MODIFY, { format: state.activeTab });

      const skipModal = localStorage.getItem(STORAGE_KEYS.AI_SKIP_MODAL) === "1";
      const savedModel = localStorage.getItem(STORAGE_KEYS.AI_MODEL);
      if (skipModal && savedModel) {
        void openInAi(prompt, savedModel, "modify");
        return;
      }
      openAiModelModal(prompt, "modify");
      return;
    }

    if (imageBtn) {
      const index = Number(imageBtn.dataset.index);
      const prompt = getActivePrompts()[index];
      openImageToolModal(prompt);
    }
  });

}

function pickRandomPrompt() {
  const pool = getFilteredPrompts();
  if (!pool.length) {
    showToast("Brak promptów do wylosowania — zmień filtr lub wyszukiwanie");
    return;
  }

  const prompt = pool[Math.floor(Math.random() * pool.length)];
  state.highlightIndex = getActivePrompts().indexOf(prompt);
  state.visibleCount = Math.max(state.visibleCount, state.highlightIndex + 1);
  renderPrompts();
  updateStats();
  track(EVENTS.PROMPT_RANDOM, { format: state.activeTab });

  window.requestAnimationFrame(() => {
    const card = els.promptList.querySelector("[data-highlight='true']");
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.classList.add("prompt-card--pulse");
    window.setTimeout(() => card?.classList.remove("prompt-card--pulse"), 2000);
  });

  showToast("Wylosowano prompt — przewiń do podświetlonej karty");
}

function getActivePrompts() {
  return state.prompts[state.activeTab] || [];
}

function getFilteredPrompts() {
  let prompts = getActivePrompts();

  if (state.category !== "all") {
    prompts = prompts.filter((prompt) => inferCategory(prompt) === state.category);
  }

  if (state.search) {
    prompts = prompts.filter((prompt) => prompt.toLowerCase().includes(state.search));
  }

  return prompts;
}

function renderPrompts() {
  const filtered = getFilteredPrompts();
  const formatLabel = state.activeTab === "landscape_16_9" ? "16:9 desktop" : "9:16 phone";

  if (!filtered.length) {
    els.promptList.innerHTML =
      '<div class="empty-state">Brak wyników — zmień frazę wyszukiwania lub kategorię.</div>';
    if (els.loadMoreBtn) els.loadMoreBtn.hidden = true;
    return;
  }

  const slice = filtered.slice(0, state.visibleCount);

  els.promptList.innerHTML = slice
    .map((prompt) => {
      const originalIndex = getActivePrompts().indexOf(prompt);
      const isHighlight = originalIndex === state.highlightIndex;
      const categoryLabel = CATEGORIES.find((c) => c.id === inferCategory(prompt))?.label || "Inne";

      return `
        <article class="prompt-card${isHighlight ? " prompt-card--highlight" : ""}" ${
          isHighlight ? 'data-highlight="true"' : ""
        }>
          <header>
            <span class="prompt-number">#${originalIndex + 1}</span>
            <span class="format-badge">${formatLabel}</span>
            <span class="category-badge">${escapeHtml(categoryLabel)}</span>
          </header>
          <p class="prompt-text">${escapeHtml(prompt)}</p>
          <div class="prompt-actions">
            <button class="btn btn-copy" data-action="copy" data-index="${originalIndex}" type="button">Kopiuj</button>
            <button class="btn btn-ai" data-action="modify-ai" data-index="${originalIndex}" type="button">Modyfikuj z AI</button>
            <button class="btn btn-image" data-action="open-image" data-index="${originalIndex}" type="button">Generator obrazu</button>
          </div>
        </article>
      `;
    })
    .join("");

  if (els.loadMoreBtn) {
    const hasMore = filtered.length > state.visibleCount;
    els.loadMoreBtn.hidden = !hasMore;
    els.loadMoreBtn.textContent = `Pokaż więcej (${filtered.length - state.visibleCount} pozostało)`;
  }
}

function updateStats() {
  const total = getActivePrompts().length;
  const filtered = getFilteredPrompts().length;
  const visible = Math.min(state.visibleCount, filtered);
  const label = state.activeTab === "landscape_16_9" ? "16:9" : "9:16";
  els.stats.textContent = `Widoczne: ${visible} / ${filtered} (z ${total}) · ${label}`;
}

function getAiToastMessage(model, mode) {
  if (mode === "custom") {
    return `Skopiowano polecenie — ${model.name}. AI ma zwrócić gotowy prompt; potem wklej go w generatorze obrazu (Ctrl+V).`;
  }
  return getModifyToastMessage(model);
}

async function openInAi(prompt, modelId, mode = "modify") {
  const model = AI_MODELS.find((item) => item.id === modelId) || AI_MODELS[0];
  const fullPrompt = mode === "custom" ? prompt : `${MODIFY_PREFIX}${prompt}`;

  try {
    await copyToClipboard(fullPrompt);
  } catch (error) {
    console.error(error);
    showToast("Nie udało się skopiować do schowka.", 4000);
    return;
  }

  const url = buildModelUrl(model, fullPrompt);
  window.open(url, "_blank", "noopener,noreferrer");
  showToast(getAiToastMessage(model, mode), 5200);
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

function showToast(message, duration = 2600) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, duration);
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
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installBanner.classList.remove("show");

    if (outcome === "accepted") {
      track(EVENTS.PWA_INSTALL);
      showToast("Zainstalowano Tapety Studio — działa offline", 3500);
    }
  });
}

function setupFirstUseModal() {
  const modal = document.getElementById("first-use-modal");
  const closeBtn = document.getElementById("first-use-close");
  if (!modal || !closeBtn) return;

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, "1");
  };

  if (!localStorage.getItem(STORAGE_KEYS.ONBOARDING)) {
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
