const QUEUE_CSV_URL = window.APOTH_QUEUE_CSV_URL || "./data/queue.csv";

const sampleQueue = [
  {
    id: "AWTH-0000",
    song: "Sarah Vaughan - I'm Gonna Live Until I Die",
    status: "Received",
    updated: "2026-06-09",
    notes: "Max"
  },
  {
    id: "AWTH-0000",
    song: "(SLACKCiRCUS) HEYYEYAAEYAAAEYAEYAA",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: The Walkman"
  },
  {
    id: "AWTH-0000",
    song: "Watsky - Welcome to the Family",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: Justin"
  },
  {
    id: "AWTH-0000",
    song: "Jack White - SHedding my Velvet",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: Jenesis"
  },
  {
    id: "AWTH-0000",
    song: "Lake Street Drive - Makes",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: Curls"
  },
  {
    id: "AWTH-0000",
    song: "Lake Street Drive - Good Kisser",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: Curls"
  },
  {
    id: "AWTH-0000",
    song: "Jazzy Jeff & The Fresh Prince - From Da South",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: The Walkman"
  },
  {
    id: "AWTH-0000",
    song: "Sir Mix-A-Lot - Sleepin' Wit My Fonk",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: The Walkman"
  },
  {
    id: "AWTH-0000",
    song: "Mystery Skulls - Freakin' Out",
    status: "Received",
    updated: "2026-06-08",
    notes: "For: APOCALYPSE"
  },
  {
    id: "AWTH-0000",
    song: "Donnie Elbert - Have I Sinned",
    status: "Complete",
    updated: "2026-06-08",
    notes: "For: Justin"
  },
  {
    id: "AWTH-0000",
    song: "Ken Ashcorp - Hunter",
    status: "Complete",
    updated: "2026-06-06",
    notes: "For: ME, ya' nerds."
  },
  {
    id: "AWTH-0000",
    song: "Escape from the Zoon - Learnin' Curve",
    status: "Complete",
    updated: "2026-02-14",
    notes: "For: Trash Lord."
  }
];

const state = {
  queue: [],
  filter: "all",
  search: ""
};

const form = document.querySelector("#request-form");
const formStatus = document.querySelector("#form-status");
const iframe = document.querySelector("iframe[name='google-form-target']");
const queueBody = document.querySelector("#queue-body");
const queueSummary = document.querySelector("#queue-summary");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#queue-search");
const statusFilter = document.querySelector("#status-filter");
const refreshButton = document.querySelector("#refresh-queue");

let pendingFormSubmission = false;

form.addEventListener("submit", () => {
  pendingFormSubmission = true;
  formStatus.textContent = "Sending...";
});

iframe.addEventListener("load", () => {
  if (!pendingFormSubmission) {
    return;
  }

  pendingFormSubmission = false;
  form.reset();
  formStatus.textContent = "Request sent. It will show in the queue once it is processed.";
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderQueue();
});

statusFilter.addEventListener("change", (event) => {
  state.filter = event.target.value;
  renderQueue();
});

refreshButton.addEventListener("click", () => {
  loadQueue();
});

loadQueue();

async function loadQueue() {
  queueBody.innerHTML = '<tr><td colspan="5">Loading queue...</td></tr>';
  emptyState.hidden = true;

  try {
    const response = await fetch(`${QUEUE_CSV_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Queue CSV returned ${response.status}`);
    }

    const text = await response.text();
    const rows = parseCsv(text);
    const mapped = rows.map(mapQueueRow).filter((row) => row.song);
    state.queue = mapped.length ? mapped : sampleQueue;
  } catch (error) {
    console.warn("Using sample queue data:", error);
    state.queue = sampleQueue;
  }

  renderQueue();
}

function renderQueue() {
  const filtered = sortQueueItems(state.queue.filter((item) => {
    const statusKeyValue = statusKey(item.status);
    const statusMatches = state.filter === "all" || statusKeyValue === state.filter;
    const haystack = `${item.id} ${item.song} ${item.status} ${item.updated} ${item.notes}`.toLowerCase();
    const searchMatches = !state.search || haystack.includes(state.search);
    return statusMatches && searchMatches;
  }));

  queueBody.replaceChildren();

  const fragment = document.createDocumentFragment();
  for (const item of filtered) {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    const idValue = document.createElement("span");
    idValue.className = "request-id";
    idValue.textContent = item.id || "AWTH-0000";
    idCell.append(idValue);

    const songCell = document.createElement("td");
    const songTitle = document.createElement("span");
    songTitle.className = "song-title";
    songTitle.textContent = item.song;
    songCell.append(songTitle);

    const statusCell = document.createElement("td");
    const chip = document.createElement("span");
    chip.className = `status-chip status-${statusKey(item.status)}`;
    chip.textContent = item.status || "Received";
    statusCell.append(chip);

    const updatedCell = document.createElement("td");
    updatedCell.textContent = formatDate(item.updated);

    const notesCell = document.createElement("td");
    notesCell.textContent = item.notes || "";

    row.append(idCell, songCell, statusCell, updatedCell, notesCell);
    fragment.append(row);
  }

  queueBody.append(fragment);
  emptyState.hidden = filtered.length > 0;
  renderSummary();
}

function renderSummary() {
  const total = state.queue.length;
  const complete = state.queue.filter((item) => statusKey(item.status) === "complete").length;
  const making = state.queue.filter((item) => statusKey(item.status) === "making").length;
  const received = state.queue.filter((item) => statusKey(item.status) === "received").length;

  queueSummary.replaceChildren(
    summaryPill(`${total} total`),
    summaryPill(`${received} received`),
    summaryPill(`${making} making`),
    summaryPill(`${complete} complete`)
  );
}

function summaryPill(text) {
  const pill = document.createElement("span");
  pill.textContent = text;
  return pill;
}

function mapQueueRow(row) {
  return {
    id: pick(row, ["id", "request_id", "request id", "track id"]) || "AWTH-0000",
    song: pick(row, [
      "artist_song",
      "artist/song",
      "artist - song",
      "song",
      "track",
      "what's the artist/song? (ex: tom cardy - business man)"
    ]),
    status: pick(row, ["status", "state"]) || "Received",
    updated: pick(row, ["updated", "last updated", "date", "timestamp"]),
    notes: pick(row, ["notes", "note", "details"])
  };
}

function sortQueueItems(items) {
  return [...items].sort((first, second) => {
    return statusPriority(first.status) - statusPriority(second.status);
  });
}

function statusPriority(status) {
  const priority = {
    making: 0,
    received: 1,
    complete: 2
  };
  return priority[statusKey(status)] ?? 99;
}

function pick(row, keys) {
  for (const key of keys) {
    const value = row[normalizeKey(key)];
    if (value) {
      return value;
    }
  }
  return "";
}

function normalizeKey(key) {
  return String(key).trim().toLowerCase();
}

function statusKey(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("progress") || value.includes("making") || value.includes("build")) {
    return "making";
  }
  if (value.includes("done") || value.includes("complete") || value.includes("sang")) {
    return "complete";
  }
  return "received";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const trimmed = String(value).trim();
  const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headerRow, ...dataRows] = rows.filter((entry) => entry.some((cell) => cell.trim()));
  if (!headerRow) {
    return [];
  }

  const headers = headerRow.map(normalizeKey);
  return dataRows.map((cells) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = (cells[index] || "").trim();
    });
    return entry;
  });
}
