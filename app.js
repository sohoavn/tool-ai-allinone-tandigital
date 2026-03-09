// ==============================================================
// TuongTanDigital-AI — app.js (Part 1/3)
// © 2025 TuongTanDigital. All rights reserved.
// AI Suite — Powered by Gemini
//
// Tiêu chuẩn code:
// - Biến/hàm: camelCase
// - Hằng số: UPPER_SNAKE_CASE
// - State tập trung vào object STATE duy nhất
// - API calls qua wrapper chung
// - Error handling đầy đủ try-catch
// ==============================================================

// ==============================================================
// SECTION 1: CONSTANTS & GEMINI VOICES
// ==============================================================

const APP_NAME = 'TuongTanDigital-AI';
const APP_VERSION = '3.0';
const APP_COPYRIGHT = '© 2025 TuongTanDigital. All rights reserved.';
const MAX_SOURCES = 50;
const MAX_NOTEBOOKS = 20;
const MAX_CHAT_HISTORY = 100;
const MAX_NOTES = 200;
const MAX_TEXT_SOURCE_CHARS = 50000;
const INDEXEDDB_NAME = 'TuongTanDigitalAI_DB';
const INDEXEDDB_VERSION = 1;

const GEMINI_VOICES = [
    { name: 'Aoede', desc: 'Nữ, ấm áp, tự nhiên', best: 'VI/EN' },
    { name: 'Charon', desc: 'Nam, trầm, chuyên nghiệp', best: 'EN' },
    { name: 'Fenrir', desc: 'Nam, mạnh mẽ, rõ ràng', best: 'EN' },
    { name: 'Kore', desc: 'Nữ, trẻ trung, năng động', best: 'VI/EN' },
    { name: 'Leda', desc: 'Nữ, nhẹ nhàng, dịu dàng', best: 'VI' },
    { name: 'Orus', desc: 'Nam, oai nghiêm, uy quyền', best: 'EN' },
    { name: 'Puck', desc: 'Trung tính, linh hoạt', best: 'EN' },
    { name: 'Zephyr', desc: 'Nữ, gió nhẹ, thư giãn', best: 'VI/EN' },
    { name: 'Achernar', desc: 'Nữ, sáng, rõ ràng', best: 'VI/EN' },
    { name: 'Schedar', desc: 'Nữ, ấm, kể chuyện', best: 'VI' },
    { name: 'Gacrux', desc: 'Nữ, mạnh mẽ, quyết đoán', best: 'EN' },
    { name: 'Pulcherrima', desc: 'Nữ, đẹp, truyền cảm', best: 'VI/EN' },
    { name: 'Achird', desc: 'Nam, thân thiện, gần gũi', best: 'VI/EN' },
    { name: 'Zubenelgenubi', desc: 'Nam, sâu lắng, triết lý', best: 'EN' },
    { name: 'Vindemiatrix', desc: 'Nữ, tinh tế, sang trọng', best: 'EN' },
    { name: 'Sadachbia', desc: 'Nữ, tươi sáng, trẻ trung', best: 'VI' },
    { name: 'Sadaltager', desc: 'Nam, chắc chắn, rõ ràng', best: 'EN' },
    { name: 'Sulafat', desc: 'Nữ, mềm mại, dịu êm', best: 'VI/EN' },
    { name: 'Algenib', desc: 'Nam, cổ điển, sang trọng', best: 'EN' },
    { name: 'Rasalgethi', desc: 'Nam, uy nghi, trang trọng', best: 'EN' },
    { name: 'Elnath', desc: 'Nam, trẻ, năng động', best: 'EN' },
    { name: 'Alnilam', desc: 'Nữ, dịu dàng, nhẹ nhàng', best: 'VI/EN' },
    { name: 'Edasich', desc: 'Nam, trầm ổn, đáng tin', best: 'EN' },
    { name: 'Algorab', desc: 'Nam, sắc nét, chuyên nghiệp', best: 'EN' },
    { name: 'Callirrhoe', desc: 'Nữ, vui vẻ, truyền cảm', best: 'VI/EN' },
    { name: 'Despina', desc: 'Nữ, thanh thoát, nhẹ nhàng', best: 'VI' },
    { name: 'Umbriel', desc: 'Nam, bí ẩn, sâu lắng', best: 'EN' },
    { name: 'Alasia', desc: 'Nữ, trong sáng, rõ ràng', best: 'VI/EN' },
    { name: 'Iocaste', desc: 'Nữ, trưởng thành, chín chắn', best: 'EN' },
    { name: 'Autonoe', desc: 'Nữ, phóng khoáng, tự nhiên', best: 'VI/EN' }
];

const HEROES = {
    notebook: { title: 'Notebook AI — Phân tích tài liệu thông minh', desc: 'Upload tài liệu, đặt câu hỏi, nhận câu trả lời có trích dẫn nguồn. Hoàn toàn miễn phí.' },
    stt: { title: 'Phiên âm AI — Speech to Text', desc: 'Chuyển audio thành văn bản chính xác với Gemini AI. Hỗ trợ tiếng Việt, đa người nói.' },
    tts: { title: 'Đọc TTS — Text to Speech AI', desc: '30 giọng Gemini AI cao cấp + Browser TTS miễn phí. Xuất file WAV chất lượng cao.' },
    rec: { title: 'Ghi Hình & Biên Bản Họp', desc: 'Ghi màn hình, tự động tạo biên bản cuộc họp với AI. Trích xuất TODO, quyết định quan trọng.' },
    cvt: { title: 'Chuyển đổi & Phân Tích File', desc: '8 chức năng AI: Trích xuất, Tóm tắt, Phân tích, Dịch thuật. Hỗ trợ Batch processing.' },
    settings: { title: 'Cài đặt Giao Diện', desc: 'Tùy chỉnh theme, màu sắc, hình nền và các tùy chọn cá nhân hóa ứng dụng.' }
};

// Persona System Prompts (T-N7)
const PERSONA_PROMPTS = {
    default: 'Bạn là trợ lý AI phân tích tài liệu theo phong cách NotebookLM của Google.',
    professor: 'Bạn là một giáo sư đại học uyên bác. Trả lời học thuật, chính xác, trích dẫn nguồn cẩn thận. Dùng thuật ngữ chuyên ngành khi cần.',
    friend: 'Bạn là một người bạn thân thiện, dễ gần. Giải thích đơn giản, dùng ví dụ đời thường, tránh ngôn ngữ quá phức tạp.',
    expert: 'Bạn là chuyên gia tư vấn hàng đầu. Phân tích sâu, đề xuất giải pháp cụ thể, đánh giá ưu nhược điểm rõ ràng.',
    journalist: 'Bạn là phóng viên điều tra. Tường thuật theo 5W1H, sắp xếp thông tin logic, nhấn mạnh sự kiện quan trọng.',
    tutor: 'Bạn là gia sư kiên nhẫn. Giải thích từng bước, đặt câu hỏi kiểm tra hiểu biết, cho ví dụ minh họa dễ hiểu.'
};

// ==============================================================
// SECTION 2: GLOBAL STATE
// ==============================================================

const STATE = {
    // API Keys
    keys: [],
    activeKey: 0,
    model: 'gemini-2.5-flash',

    // Notebook Manager (T-C1)
    notebooks: [],
    activeNotebookId: null,

    // Current Notebook Data
    sources: [],
    chatHistory: [],
    notes: [],          // T-C6: Pinned Notes
    persona: 'default', // T-N7: Persona

    // History
    history: [],

    // STT
    sttFile: null,
    sttBlob: null,
    sttRec: false,
    sttChunks: [],
    sttMR: null,
    sttSec: 0,
    sttInterval: null,

    // TTS
    ttsVoices: [],
    ttsUtt: null,
    selectedGeminiVoice: 'Aoede',
    geminiAudioBlob: null,
    ttsEngine: 'browser', // T-TTS2: browser | gemini

    // Screen Record (T-F1: Fixed)
    screenStream: null,
    screenMR: null,
    screenChunks: [],
    screenBlob: null,
    screenSec: 0,
    screenInterval: null,
    minutesText: '',

    // Convert (T-F4: Single processCvt)
    cvtFile: null,
    cvtB64: null,
    cvtMime: null,
    cvtAction: 'extract',
    batchFiles: [],
    batchResults: [],

    // Abort Controllers (T05)
    abortCtrl: null,
    cvtAbortCtrl: null,

    // Live STT
    liveSTT: null,
    liveSTTActive: false,

    // UI State
    dark: false,
    theme: 'default',
    bg: 'default',
    appFont: 'system',
    splitViewActive: false,
    focusMode: false,
    sidebarOpen: false,

    // Session
    sessionAutoSaveTimer: null,

    // Flashcard (T-F3)
    flashcards: [],
    flashcardIdx: 0,
    flashcardFilter: 'all',

    // Quiz (T-AI3)
    quizQuestions: [],
    quizAnswers: {},
    quizSubmitted: false,

    // Glossary (T-AI4)
    glossaryItems: [],

    // Podcast (T-C4)
    podcastBlob: null,

    // Writing Assistant (T-N6)
    writingAssistText: '',
    writingAssistResult: '',

    // Context Memory (T-AI1)
    compressedHistory: '',

    // Custom Prompts (T-N5)
    customPrompts: [],

    // IndexedDB Reference
    db: null
};

// ==============================================================
// SECTION 3: UTILITY HELPERS
// ==============================================================

// LocalStorage helper (for settings only)
function ls(k, v) {
    if (v === undefined) {
        try { return JSON.parse(localStorage.getItem(k)); }
        catch { return null; }
    }
    localStorage.setItem(k, JSON.stringify(v));
}

// Format file size
function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Format time seconds to mm:ss
function fmtTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Escape HTML (prevent XSS)
function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Generate unique ID
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get source type icon
function getSrcIcon(type) {
    const icons = {
        pdf: '📕', img: '🖼️', txt: '📄', url: '🔗',
        audio: '🎵', docx: '📘', youtube: '🎬'
    };
    return icons[type] || '📎';
}

// File to base64
function f2b64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Blob to base64
function blob2b64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Download blob helper
function dlBlob(content, filename, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Progress bar helper
function prog(wrapId, fillId, txtId, pct, msg) {
    const wrap = document.getElementById(wrapId);
    const fill = document.getElementById(fillId);
    const txt = document.getElementById(txtId);
    if (wrap) wrap.classList.add('show');
    if (fill) fill.style.width = pct + '%';
    if (txt) txt.textContent = msg || '';
    if (pct >= 100) {
        setTimeout(() => { if (wrap) wrap.classList.remove('show'); }, 3000);
    }
}

// Copy text from element
function copyBox(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    const text = el.value || el.innerText || '';
    navigator.clipboard.writeText(text)
        .then(() => toast('📋 Đã sao chép!', 'success'))
        .catch(() => toast('❌ Không thể sao chép', 'error'));
}

// Download text from element
function dlBox(elId, filename) {
    const el = document.getElementById(elId);
    if (!el) return;
    const text = el.value || el.innerText || '';
    dlBlob(text, filename, 'text/plain;charset=utf-8');
}

// Paste from clipboard (T-F2)
async function pasteFromClipboard(textareaId) {
    try {
        const text = await navigator.clipboard.readText();
        const el = document.getElementById(textareaId);
        if (el) {
            el.value += text;
            el.dispatchEvent(new Event('input'));
            toast('📋 Đã dán từ clipboard!', 'success');
        }
    } catch {
        toast('❌ Không thể đọc clipboard. Vui lòng dán thủ công (Ctrl+V).', 'warning');
    }
}

// ==============================================================
// SECTION 4: TOAST NOTIFICATION SYSTEM
// ==============================================================

function toast(msg, type = 'info', dur = 3500) {
    const w = document.getElementById('toastWrap');
    if (!w) return;
    const d = document.createElement('div');
    d.className = `toast ${type}`;
    d.textContent = msg;
    d.onclick = () => d.remove();
    w.appendChild(d);
    setTimeout(() => { if (d.parentNode) d.remove(); }, dur);
}

// ==============================================================
// SECTION 5: INDEXEDDB PERSISTENCE (T-F5)
// ==============================================================

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Notebooks store
            if (!db.objectStoreNames.contains('notebooks')) {
                db.createObjectStore('notebooks', { keyPath: 'id' });
            }
            // Sources store (with binary data)
            if (!db.objectStoreNames.contains('sources')) {
                const srcStore = db.createObjectStore('sources', { keyPath: 'id' });
                srcStore.createIndex('notebookId', 'notebookId', { unique: false });
            }
            // Chat history store
            if (!db.objectStoreNames.contains('chatHistory')) {
                const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
                chatStore.createIndex('notebookId', 'notebookId', { unique: false });
            }
            // Notes store (T-C6)
            if (!db.objectStoreNames.contains('notes')) {
                const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
                notesStore.createIndex('notebookId', 'notebookId', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            STATE.db = event.target.result;
            resolve(STATE.db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Generic IndexedDB CRUD
function dbPut(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function dbGet(storeName, key) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function dbGetAll(storeName) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

function dbGetByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const req = index.getAll(value);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

function dbDelete(storeName, key) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function dbClear(storeName) {
    return new Promise((resolve, reject) => {
        if (!STATE.db) { reject(new Error('DB not open')); return; }
        const tx = STATE.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// ==============================================================
// SECTION 6: API KEY MANAGEMENT
// ==============================================================

function getActiveKey() {
    return STATE.keys[STATE.activeKey]?.key || '';
}

function markKeyError() {
    if (STATE.keys[STATE.activeKey]) {
        STATE.keys[STATE.activeKey].errors = (STATE.keys[STATE.activeKey].errors || 0) + 1;
    }
}

function rotateKey() {
    const next = (STATE.activeKey + 1) % STATE.keys.length;
    if (next === STATE.activeKey) return false;
    STATE.activeKey = next;
    renderKeyList();
    toast(`🔄 Chuyển sang key ${next + 1}`, 'info', 2000);
    return true;
}

function addApiKey() {
    const inp = document.getElementById('newKeyInput');
    const k = inp.value.trim();
    if (!k) { toast('⚠️ Nhập API Key trước!', 'warning'); return; }
    if (STATE.keys.find(x => x.key === k)) { toast('⚠️ Key này đã tồn tại!', 'warning'); return; }
    STATE.keys.push({ key: k, errors: 0 });
    inp.value = '';
    ls('vptx_keys', STATE.keys);
    renderKeyList();
    updateApiDot();
    toast('✅ Đã thêm API Key!', 'success');
}

function removeKey(i) {
    STATE.keys.splice(i, 1);
    if (STATE.activeKey >= STATE.keys.length) STATE.activeKey = Math.max(0, STATE.keys.length - 1);
    ls('vptx_keys', STATE.keys);
    renderKeyList();
    updateApiDot();
}

function renderKeyList() {
    const el = document.getElementById('keyList');
    if (!el) return;
    if (!STATE.keys.length) {
        el.innerHTML = '<div class="empty-st" style="padding:12px">Chưa có key nào. Thêm key để bắt đầu.</div>';
        return;
    }
    el.innerHTML = STATE.keys.map((k, i) => `
        <div class="key-item${i === STATE.activeKey ? ' active-key' : ''}">
            ${i === STATE.activeKey ? '<span class="key-badge">ACTIVE</span>' : ''}
            <span class="key-text">${k.key.substring(0, 8)}...${k.key.slice(-4)}</span>
            <span class="key-quota">${k.errors || 0} lỗi</span>
            <button class="btn btn-secondary btn-sm" onclick="testApiKey(${i})" title="Kiểm tra key" style="padding:4px 8px;font-size:10px">Test</button>
            <button onclick="setActiveKey(${i})" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:11px;padding:2px 4px;font-weight:700" title="Đặt làm active">${i === STATE.activeKey ? '' : '⭐'}</button>
            <button onclick="removeKey(${i})" style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:16px;padding:2px 4px" title="Xóa key">✕</button>
        </div>`).join('');
}

function setActiveKey(i) {
    if (i >= 0 && i < STATE.keys.length) {
        STATE.activeKey = i;
        ls('vptx_keys', STATE.keys);
        renderKeyList();
        toast(`⭐ Đã chọn key ${i + 1} làm active`, 'success');
    }
}

function updateApiDot() {
    const dot = document.getElementById('apiDot');
    const lbl = document.getElementById('apiKeyLabel');
    if (STATE.keys.length) {
        if (dot) dot.classList.add('ok');
        if (lbl) lbl.textContent = `${STATE.keys.length} KEY${STATE.keys.length > 1 ? 'S' : ''}`;
    } else {
        if (dot) dot.classList.remove('ok');
        if (lbl) lbl.textContent = 'API KEYS';
    }
}

async function testApiKey(i) {
    const k = STATE.keys[i];
    if (!k) return;
    toast(`🔄 Đang test key ${i + 1}...`, 'info', 2000);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${k.key}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] })
        });
        if (res.ok) {
            toast(`✅ Key ${i + 1}: Hoạt động tốt!`, 'success');
        } else {
            const e = await res.json().catch(() => ({}));
            toast(`❌ Key ${i + 1}: ${e.error?.message || 'Lỗi ' + res.status}`, 'error', 5000);
        }
    } catch (e) {
        toast(`❌ Key ${i + 1}: Không kết nối được`, 'error', 4000);
    }
}

// ==============================================================
// SECTION 7: GEMINI API WRAPPERS
// ==============================================================

// Standard generateContent
async function callGemini(prompt, filePart = null, retries = 0) {
    const key = getActiveKey();
    if (!key) throw new Error('Chưa có API Key. Vui lòng thêm key trong phần API Keys.');
    const model = STATE.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const parts = [];
    if (filePart) parts.push(filePart);
    parts.push({ text: prompt });
    const body = { contents: [{ parts }] };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error?.message || `HTTP ${res.status}`;
            if ((res.status === 429 || res.status === 403) && retries < STATE.keys.length - 1) {
                markKeyError();
                if (rotateKey()) return callGemini(prompt, filePart, retries + 1);
            }
            throw new Error(msg);
        }
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
        throw new Error(e.message);
    }
}

// Audio generateContent
async function callGeminiAudio(prompt, b64, mime, retries = 0) {
    const key = getActiveKey();
    if (!key) throw new Error('Chưa có API Key.');
    const model = STATE.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ inline_data: { mime_type: mime, data: b64 } }, { text: prompt }] }]
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error?.message || `HTTP ${res.status}`;
            if ((res.status === 429 || res.status === 403) && retries < STATE.keys.length - 1) {
                markKeyError();
                if (rotateKey()) return callGeminiAudio(prompt, b64, mime, retries + 1);
            }
            throw new Error(msg);
        }
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
        throw new Error(e.message);
    }
}

// Streaming generateContent (T02)
async function callGeminiStream(parts, onChunk, signal) {
    const key = getActiveKey();
    if (!key) throw new Error('Chưa có API Key.');
    const model = STATE.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
    const body = { contents: [{ parts }] };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (raw === '[DONE]') break;
            try {
                const json = JSON.parse(raw);
                const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (chunk) onChunk(chunk);
            } catch { /* skip malformed */ }
        }
    }
}

// Gemini TTS
async function callGeminiTTS(text, voiceName, stylePrompt, model, retries = 0) {
    const key = getActiveKey();
    if (!key) throw new Error('Chưa có API Key.');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const fullText = stylePrompt ? `${stylePrompt}\n\n${text}` : text;
    const body = {
        contents: [{ parts: [{ text: fullText }] }],
        generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
        }
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.error?.message || `HTTP ${res.status}`;
            if ((res.status === 429 || res.status === 403) && retries < STATE.keys.length - 1) {
                markKeyError();
                if (rotateKey()) return callGeminiTTS(text, voiceName, stylePrompt, model, retries + 1);
            }
            throw new Error(msg);
        }
        const data = await res.json();
        const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64) throw new Error('Không nhận được dữ liệu audio từ API');
        return b64;
    } catch (e) {
        throw new Error(e.message);
    }
}

// PCM to WAV converter
function pcmToWav(pcmB64, sampleRate = 24000, channels = 1, bitDepth = 16) {
    const pcm = Uint8Array.from(atob(pcmB64), c => c.charCodeAt(0));
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF');
    view.setUint32(4, 36 + pcm.length, true);
    ws(8, 'WAVE');
    ws(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bitDepth / 8, true);
    view.setUint16(32, channels * bitDepth / 8, true);
    view.setUint16(34, bitDepth, true);
    ws(36, 'data');
    view.setUint32(40, pcm.length, true);
    return new Blob([wavHeader, pcm], { type: 'audio/wav' });
}

// ==============================================================
// SECTION 8: MARKDOWN RENDERER (T-F6: Enhanced)
// ==============================================================

function md2html(md) {
    if (!md) return '';
    let html = escHtml(md);

    // Code blocks (``` ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*)/gm, (match, header, sep, body) => {
        const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
        const rows = body.trim().split('\n').map(row => {
            const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${tds}</tr>`;
        }).join('');
        return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--primary)">$1</a>');

    // Unordered lists (multi-level)
    html = html.replace(/^(\s*)[-*] (.+)$/gm, (_, indent, text) => {
        const level = Math.floor(indent.length / 2);
        return `<li style="margin-left:${level * 16}px">${text}</li>`;
    });
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^(\s*)\d+\. (.+)$/gm, (_, indent, text) => {
        const level = Math.floor(indent.length / 2);
        return `<oli style="margin-left:${level * 16}px">${text}</oli>`;
    });
    html = html.replace(/((?:<oli[^>]*>.*<\/oli>\n?)+)/g, (match) => {
        return '<ol>' + match.replace(/<\/?oli/g, (m) => m.replace('oli', 'li')) + '</ol>';
    });

    // Source citations (T-C3: clickable)
    html = html.replace(/\[Nguồn (\d+)\]/g, '<span class="source-cite" onclick="onCitationClick($1)" title="Click để xem nguồn">📎 Nguồn $1</span>');
    html = html.replace(/\[Source (\d+)\]/g, '<span class="source-cite" onclick="onCitationClick($1)" title="Click to view source">📎 Source $1</span>');

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, '</p><p>');
    // Single newlines to <br>
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>(<h[1-4]>)/g, '$1');
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ol>)/g, '$1');
    html = html.replace(/(<\/ol>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)/g, '$1');

    return html;
}

// ==============================================================
// SECTION 9: TAB SWITCHING & NAVIGATION
// ==============================================================

function switchTab(tabId, btnEl) {
    // Deactivate all tabs
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(t => t.classList.remove('active'));

    // Activate selected tab
    const panel = document.getElementById('tab-' + tabId);
    if (panel) panel.classList.add('active');

    // Activate nav buttons
    document.querySelectorAll(`.nav-tab[data-tab="${tabId}"]`).forEach(t => t.classList.add('active'));
    document.querySelectorAll(`.bottom-nav-item[data-tab="${tabId}"]`).forEach(t => t.classList.add('active'));

    // Update hero
    const hero = HEROES[tabId];
    if (hero) {
        document.getElementById('heroTitle').textContent = hero.title;
        document.getElementById('heroDesc').textContent = hero.desc;
    }

    // Save last tab
    ls('vptx_lasttab', tabId);
}

// ==============================================================
// SECTION 10: OVERLAY/POPUP MANAGEMENT
// ==============================================================

function openOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}

function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}

// ==============================================================
// SECTION 11: NOTEBOOK MANAGER (T-C1: Multi-Notebook)
// ==============================================================

function toggleNotebookSidebar() {
    STATE.sidebarOpen = !STATE.sidebarOpen;
    const sidebar = document.getElementById('notebookSidebar');
    const backdrop = document.getElementById('nbSidebarBackdrop');
    if (STATE.sidebarOpen) {
        sidebar.classList.add('open');
        backdrop.classList.add('show');
        renderNotebookList();
    } else {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
    }
}

async function createNewNotebook() {
    if (STATE.notebooks.length >= MAX_NOTEBOOKS) {
        toast(`⚠️ Tối đa ${MAX_NOTEBOOKS} notebooks!`, 'warning');
        return;
    }
    const nb = {
        id: genId(),
        name: `Notebook ${STATE.notebooks.length + 1}`,
        icon: '📓',
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    STATE.notebooks.push(nb);
    await saveNotebookList();

    // Switch to new notebook
    await switchNotebook(nb.id);
    renderNotebookList();
    toast(`📓 Đã tạo "${nb.name}"!`, 'success');
}

async function switchNotebook(nbId) {
    // Save current notebook data first
    if (STATE.activeNotebookId) {
        await saveCurrentNotebookData();
    }

    STATE.activeNotebookId = nbId;
    ls('vptx_activeNb', nbId);

    // Load notebook data from IndexedDB
    await loadNotebookData(nbId);

    // Update UI
    renderSources();
    renderChatFromHistory();
    renderCompareSels();
    document.getElementById('srcCount').textContent = STATE.sources.length;
    renderNotebookList();
}

async function saveCurrentNotebookData() {
    if (!STATE.activeNotebookId || !STATE.db) return;
    const nbId = STATE.activeNotebookId;

    // Save sources (including binary data)
    for (const src of STATE.sources) {
        await dbPut('sources', { ...src, notebookId: nbId });
    }

    // Save chat history
    if (STATE.chatHistory.length) {
        await dbPut('chatHistory', {
            id: nbId,
            notebookId: nbId,
            messages: STATE.chatHistory.slice(-MAX_CHAT_HISTORY)
        });
    }

    // Save notes (T-C6)
    for (const note of STATE.notes) {
        await dbPut('notes', { ...note, notebookId: nbId });
    }

    // Update notebook metadata
    const nb = STATE.notebooks.find(n => n.id === nbId);
    if (nb) {
        nb.updatedAt = new Date().toISOString();
        nb.sourceCount = STATE.sources.length;
        nb.chatCount = STATE.chatHistory.length;
        await saveNotebookList();
    }

    // Show save indicator
    const ind = document.getElementById('sessionSaveIndicator');
    if (ind) { ind.style.display = 'inline'; setTimeout(() => ind.style.display = 'none', 2000); }
}

async function loadNotebookData(nbId) {
    if (!STATE.db) return;

    // Load sources
    const sources = await dbGetByIndex('sources', 'notebookId', nbId);
    STATE.sources = sources || [];

    // Load chat history
    const chatData = await dbGet('chatHistory', nbId);
    STATE.chatHistory = chatData?.messages || [];

    // Load notes
    const notes = await dbGetByIndex('notes', 'notebookId', nbId);
    STATE.notes = notes || [];
}

async function saveNotebookList() {
    ls('vptx_notebooks', STATE.notebooks);
}

async function deleteNotebook(nbId) {
    if (!confirm('Xóa notebook này? Dữ liệu sẽ mất vĩnh viễn.')) return;

    STATE.notebooks = STATE.notebooks.filter(n => n.id !== nbId);
    await saveNotebookList();

    // Delete associated data from IndexedDB
    const sources = await dbGetByIndex('sources', 'notebookId', nbId);
    for (const src of sources) {
        await dbDelete('sources', src.id);
    }
    await dbDelete('chatHistory', nbId);
    const notes = await dbGetByIndex('notes', 'notebookId', nbId);
    for (const note of notes) {
        await dbDelete('notes', note.id);
    }

    // Switch to another notebook or create new
    if (STATE.activeNotebookId === nbId) {
        if (STATE.notebooks.length > 0) {
            await switchNotebook(STATE.notebooks[0].id);
        } else {
            await createNewNotebook();
        }
    }
    renderNotebookList();
    toast('🗑️ Đã xóa notebook', 'info');
}

async function duplicateNotebook(nbId) {
    const src = STATE.notebooks.find(n => n.id === nbId);
    if (!src) return;
    if (STATE.notebooks.length >= MAX_NOTEBOOKS) {
        toast(`⚠️ Tối đa ${MAX_NOTEBOOKS} notebooks!`, 'warning');
        return;
    }
    const newNb = {
        id: genId(),
        name: src.name + ' (Copy)',
        icon: src.icon,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    STATE.notebooks.push(newNb);
    await saveNotebookList();

    // Copy sources
    const sources = await dbGetByIndex('sources', 'notebookId', nbId);
    for (const s of sources) {
        await dbPut('sources', { ...s, id: genId(), notebookId: newNb.id });
    }

    renderNotebookList();
    toast(`📋 Đã duplicate "${src.name}"!`, 'success');
}

function togglePinNotebook(nbId) {
    const nb = STATE.notebooks.find(n => n.id === nbId);
    if (nb) {
        nb.pinned = !nb.pinned;
        saveNotebookList();
        renderNotebookList();
    }
}

function renameNotebook(nbId) {
    const nb = STATE.notebooks.find(n => n.id === nbId);
    if (!nb) return;
    const newName = prompt('Đổi tên notebook:', nb.name);
    if (newName && newName.trim()) {
        nb.name = newName.trim();
        saveNotebookList();
        renderNotebookList();
    }
}

function renderNotebookList() {
    const el = document.getElementById('notebookList');
    if (!el) return;

    // Sort: pinned first, then by updatedAt
    const sorted = [...STATE.notebooks].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    if (!sorted.length) {
        el.innerHTML = '<div class="empty-st">Chưa có notebook nào</div>';
    } else {
        el.innerHTML = sorted.map(nb => `
            <div class="nb-item${nb.id === STATE.activeNotebookId ? ' active' : ''}${nb.pinned ? ' pinned' : ''}" onclick="switchNotebook('${nb.id}')">
                <span class="nb-item-icon">${nb.icon}</span>
                <div class="nb-item-info">
                    <div class="nb-item-name">${escHtml(nb.name)}</div>
                    <div class="nb-item-meta">${nb.sourceCount || 0} nguồn · ${nb.chatCount || 0} chat</div>
                </div>
                <span class="nb-item-pin">📌</span>
                <div class="nb-item-actions">
                    <button class="nb-item-btn" onclick="event.stopPropagation();renameNotebook('${nb.id}')" title="Đổi tên">✏️</button>
                    <button class="nb-item-btn" onclick="event.stopPropagation();togglePinNotebook('${nb.id}')" title="Ghim">${nb.pinned ? '📌' : '📍'}</button>
                    <button class="nb-item-btn" onclick="event.stopPropagation();duplicateNotebook('${nb.id}')" title="Duplicate">📋</button>
                    <button class="nb-item-btn" onclick="event.stopPropagation();deleteNotebook('${nb.id}')" title="Xóa">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    // Update count
    const cnt = document.getElementById('nbCount');
    if (cnt) cnt.textContent = `${STATE.notebooks.length} notebooks`;
}

function filterNotebooks(query) {
    const items = document.querySelectorAll('.nb-item');
    const q = query.toLowerCase();
    items.forEach(item => {
        const name = item.querySelector('.nb-item-name')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(q) ? '' : 'none';
    });
}

// ==============================================================
// SECTION 12: SOURCE MANAGEMENT
// ==============================================================

function addSource(srcObj) {
    STATE.sources.push(srcObj);
    renderSources();
    document.getElementById('srcCount').textContent = STATE.sources.length;
    renderCompareSels();
    saveSession();

    // Auto-tag (T-AI7) — background, non-blocking
    autoTagSource(srcObj);

    // Smart suggested questions (T-C5)
    if (STATE.sources.length === 1) {
        generateSuggestedQuestions();
    }

    toast(`✅ Đã thêm nguồn: ${srcObj.name}`, 'success');
}

function removeSource(id) {
    STATE.sources = STATE.sources.filter(s => s.id !== id);
    if (STATE.db && STATE.activeNotebookId) {
        dbDelete('sources', id).catch(() => {});
    }
    renderSources();
    document.getElementById('srcCount').textContent = STATE.sources.length;
    renderCompareSels();
    saveSession();
}

function clearAllSources() {
    if (!confirm('Xóa tất cả nguồn tài liệu?')) return;
    STATE.sources = [];
    renderSources();
    document.getElementById('srcCount').textContent = '0';
    renderCompareSels();
    saveSession();
    toast('🗑️ Đã xóa tất cả nguồn', 'info');
}

function renderSources() {
    const el = document.getElementById('sourcesList');
    const empty = document.getElementById('srcEmpty');
    if (!el) return;

    if (!STATE.sources.length) {
        el.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    el.innerHTML = STATE.sources.map((s, i) => {
        const tagHtml = s.autoTags ? s.autoTags.map(t =>
            `<span class="source-auto-tag">${escHtml(t)}</span>`
        ).join('') : '';
        const colorTag = s.colorTag ? `<div class="source-tag ${s.colorTag}"></div>` : '';

        return `
        <div class="source-item" data-id="${s.id}" draggable="true"
             ondragstart="onSrcDragStart(event,'${s.id}')"
             ondragover="event.preventDefault();this.classList.add('drag-over-src')"
             ondragleave="this.classList.remove('drag-over-src')"
             ondrop="onSrcDrop(event,'${s.id}')">
            ${colorTag}
            <div class="source-icon ${s.type}">${getSrcIcon(s.type)}</div>
            <div style="flex:1;min-width:0">
                <div class="source-name">${escHtml(s.name)}</div>
                <div class="source-size">${s.size || s.type.toUpperCase()}</div>
                <div class="source-auto-tags">${tagHtml}</div>
            </div>
            <div class="source-actions">
                <button class="source-preview-btn" onclick="previewSource('${s.id}')" title="Xem trước">👁️</button>
                <button class="source-preview-btn" onclick="openSourceTagMenu('${s.id}')" title="Gán tag">🏷️</button>
                <button class="source-remove" onclick="removeSource('${s.id}')" title="Xóa">✕</button>
            </div>
        </div>`;
    }).join('');
}

// Drag & Drop reorder sources
let dragSrcId = null;
function onSrcDragStart(e, id) {
    dragSrcId = id;
    e.dataTransfer.effectAllowed = 'move';
}
function onSrcDrop(e, targetId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over-src');
    if (!dragSrcId || dragSrcId === targetId) return;
    const fromIdx = STATE.sources.findIndex(s => s.id === dragSrcId);
    const toIdx = STATE.sources.findIndex(s => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = STATE.sources.splice(fromIdx, 1);
    STATE.sources.splice(toIdx, 0, moved);
    renderSources();
    dragSrcId = null;
}

// Source Tag Menu (T-U5)
function openSourceTagMenu(srcId) {
    const tags = ['important', 'review', 'done', 'draft'];
    const labels = { important: '🔴 Quan trọng', review: '🟡 Cần xem', done: '🟢 Đã xem', draft: '⚪ Nháp' };
    const src = STATE.sources.find(s => s.id === srcId);
    if (!src) return;

    const choice = prompt(`Chọn tag (nhập số):\n1. 🔴 Quan trọng\n2. 🟡 Cần xem\n3. 🟢 Đã xem\n4. ⚪ Nháp\n5. Xóa tag`);
    if (choice === '1') src.colorTag = 'important';
    else if (choice === '2') src.colorTag = 'review';
    else if (choice === '3') src.colorTag = 'done';
    else if (choice === '4') src.colorTag = 'draft';
    else if (choice === '5') delete src.colorTag;
    else return;
    renderSources();
    saveSession();
}

// File upload handler
async function onSourceFile(inp) {
    const files = Array.from(inp.files);
    if (!files.length) return;

    for (const f of files) {
        if (f.size > 25 * 1024 * 1024) {
            toast(`⚠️ ${f.name} quá lớn (max 25MB)`, 'warning');
            continue;
        }

        const ext = f.name.split('.').pop().toLowerCase();
        let type = 'txt';
        if (['pdf'].includes(ext)) type = 'pdf';
        else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) type = 'img';
        else if (['mp3', 'wav', 'ogg', 'm4a', 'webm', 'flac'].includes(ext)) type = 'audio';
        else if (['docx'].includes(ext)) type = 'docx';

        let content = '';
        let b64 = '';
        const mime = f.type || 'application/octet-stream';

        try {
            if (type === 'txt' || ext === 'md') {
                content = await f.text();
            } else {
                b64 = await f2b64(f);
                // Extract text from DOCX if possible
                if (type === 'docx') {
                    content = '[File DOCX — Nội dung sẽ được AI phân tích trực tiếp]';
                }
            }

            addSource({
                id: genId(),
                name: f.name,
                type,
                content,
                b64,
                mime,
                size: fmtSize(f.size),
                file: null,
                colorTag: null,
                autoTags: null
            });
        } catch (e) {
            toast(`❌ Lỗi đọc ${f.name}: ${e.message}`, 'error');
        }
    }
    inp.value = '';
}

// URL Source
function addUrlSource() {
    const inp = document.getElementById('urlSourceInput');
    const url = inp.value.trim();
    if (!url) { toast('⚠️ Nhập URL trước!', 'warning'); return; }
    if (!url.startsWith('http')) { toast('⚠️ URL không hợp lệ!', 'warning'); return; }

    addSource({
        id: genId(),
        name: url.length > 60 ? url.substring(0, 57) + '...' : url,
        type: 'url',
        content: url,
        b64: '',
        mime: '',
        size: 'URL',
        file: null,
        colorTag: null,
        autoTags: null
    });

    inp.value = '';
    closeOverlay('urlSourceOverlay');
}

// Text Source (T-F2: Fixed)
function addTextSource() {
    const nameInp = document.getElementById('textSourceName');
    const contentInp = document.getElementById('textSourceContent');
    const name = nameInp.value.trim() || 'Văn bản nhập tay';
    const content = contentInp.value.trim();

    if (!content) { toast('⚠️ Nhập nội dung văn bản!', 'warning'); return; }
    if (content.length > MAX_TEXT_SOURCE_CHARS) {
        toast(`⚠️ Tối đa ${MAX_TEXT_SOURCE_CHARS.toLocaleString()} ký tự!`, 'warning');
        return;
    }

    addSource({
        id: genId(),
        name,
        type: 'txt',
        content,
        b64: '',
        mime: 'text/plain',
        size: content.length + ' ký tự',
        file: null,
        colorTag: null,
        autoTags: null
    });

    nameInp.value = '';
    contentInp.value = '';
    document.getElementById('textSourceCharCount').textContent = '(0 / 50,000)';
    closeOverlay('textSourceOverlay');
}

function updateTextSourceCount() {
    const el = document.getElementById('textSourceContent');
    const cnt = document.getElementById('textSourceCharCount');
    if (el && cnt) {
        const len = el.value.length;
        cnt.textContent = `(${len.toLocaleString()} / 50,000)`;
        cnt.style.color = len > MAX_TEXT_SOURCE_CHARS ? 'var(--danger)' : len > 40000 ? 'var(--warning)' : 'var(--text3)';
    }
}

// YouTube Source (T-N2)
async function addYoutubeSource() {
    const inp = document.getElementById('youtubeUrlInput');
    const url = inp.value.trim();
    if (!url) { toast('⚠️ Nhập URL YouTube!', 'warning'); return; }
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        toast('⚠️ Không phải URL YouTube hợp lệ!', 'warning');
        return;
    }

    prog('ytProg', 'ytProgFill', 'ytProgTxt', 20, 'Đang phân tích video...');

    try {
        prog('ytProg', 'ytProgFill', 'ytProgTxt', 50, 'AI đang trích xuất transcript...');

        const prompt = `Phân tích URL YouTube sau và trích xuất toàn bộ transcript/nội dung nói trong video.
URL: ${url}

Trả về:
1. Tiêu đề video
2. Transcript đầy đủ (phiên âm toàn bộ lời nói)
3. Tóm tắt ngắn (3-5 câu)

Nếu không thể truy cập video, hãy thông báo rõ ràng.`;

        const result = await callGemini(prompt);
        prog('ytProg', 'ytProgFill', 'ytProgTxt', 100, 'Hoàn thành!');

        // Extract title from result
        const titleMatch = result.match(/[Tt]iêu đề[:\s]*(.+)/);
        const title = titleMatch ? titleMatch[1].trim().substring(0, 80) : 'YouTube Video';

        addSource({
            id: genId(),
            name: `🎬 ${title}`,
            type: 'youtube',
            content: result,
            b64: '',
            mime: '',
            size: 'YouTube',
            file: null,
            colorTag: null,
            autoTags: null
        });

        inp.value = '';
        closeOverlay('youtubeSourceOverlay');
    } catch (e) {
        prog('ytProg', 'ytProgFill', 'ytProgTxt', 0, '');
        toast(`❌ Lỗi: ${e.message}`, 'error', 5000);
    }
}

// Source Preview / Document Viewer (T-C2)
function previewSource(srcId) {
    const src = STATE.sources.find(s => s.id === srcId);
    if (!src) return;

    const titleEl = document.getElementById('docViewerTitle');
    const contentEl = document.getElementById('docViewerContent');
    if (titleEl) titleEl.textContent = `📄 ${src.name}`;

    if (src.type === 'img' && src.b64) {
        contentEl.innerHTML = `
            <div style="text-align:center">
                <img src="data:${src.mime};base64,${src.b64}"
                     style="max-width:100%;max-height:60vh;border-radius:8px;cursor:zoom-in"
                     onclick="this.style.maxWidth=this.style.maxWidth==='100%'?'200%':'100%'"
                     alt="${escHtml(src.name)}">
            </div>`;
    } else if (src.type === 'pdf' && src.b64) {
        contentEl.innerHTML = `
            <div id="pdfViewerContainer" style="width:100%;min-height:400px">
                <p style="text-align:center;color:var(--text3)">Đang tải PDF...</p>
            </div>`;
        renderPdfPreview(src.b64);
    } else if (src.type === 'audio' && src.b64) {
        contentEl.innerHTML = `
            <div style="text-align:center;padding:20px">
                <audio controls style="width:100%">
                    <source src="data:${src.mime};base64,${src.b64}" type="${src.mime}">
                </audio>
            </div>`;
    } else if (src.content) {
        contentEl.innerHTML = `
            <div style="white-space:pre-wrap;font-size:13px;line-height:1.7;padding:10px;max-height:60vh;overflow:auto;font-family:var(--font)">${escHtml(src.content)}</div>`;
    } else {
        contentEl.innerHTML = `<div class="empty-st">Không có nội dung xem trước cho loại file này.</div>`;
    }

    openOverlay('docViewerOverlay');
}

// PDF.js Preview
async function renderPdfPreview(b64) {
    const container = document.getElementById('pdfViewerContainer');
    if (!container || typeof pdfjsLib === 'undefined') {
        container.innerHTML = '<p style="color:var(--text3);text-align:center">PDF.js chưa tải xong. Vui lòng thử lại.</p>';
        return;
    }

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const data = atob(b64);
        const uint8 = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) uint8[i] = data.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
        container.innerHTML = '';

        const maxPages = Math.min(pdf.numPages, 10); // Show max 10 pages
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.cssText = 'width:100%;margin-bottom:8px;border:1px solid var(--border);border-radius:4px';
            container.appendChild(canvas);

            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }

        if (pdf.numPages > maxPages) {
            container.innerHTML += `<p style="text-align:center;color:var(--text3);font-size:12px">Hiển thị ${maxPages}/${pdf.numPages} trang</p>`;
        }
    } catch (e) {
        container.innerHTML = `<p style="color:var(--danger);text-align:center">Lỗi đọc PDF: ${escHtml(e.message)}</p>`;
    }
}

// Source Citation Click-through (T-C3)
function onCitationClick(sourceNum) {
    const idx = sourceNum - 1;
    if (idx >= 0 && idx < STATE.sources.length) {
        previewSource(STATE.sources[idx].id);
    } else {
        toast(`⚠️ Nguồn ${sourceNum} không tồn tại`, 'warning');
    }
}

// Source Search (T-U6)
function toggleSourceSearch() {
    const bar = document.getElementById('sourceSearchBar');
    if (bar) {
        bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
        if (bar.style.display === 'block') bar.querySelector('input').focus();
    }
}

function searchInSources(query) {
    const resultsEl = document.getElementById('sourceSearchResults');
    if (!resultsEl) return;
    if (!query.trim()) { resultsEl.innerHTML = ''; return; }

    const q = query.toLowerCase();
    const results = [];
    STATE.sources.forEach(s => {
        if (!s.content) return;
        const idx = s.content.toLowerCase().indexOf(q);
        if (idx !== -1) {
            const start = Math.max(0, idx - 30);
            const end = Math.min(s.content.length, idx + query.length + 30);
            const snippet = s.content.substring(start, end);
            results.push({ source: s, snippet, idx });
        }
    });

    if (!results.length) {
        resultsEl.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:6px">Không tìm thấy</div>';
        return;
    }

    resultsEl.innerHTML = results.slice(0, 10).map(r => `
        <div class="source-search-result" onclick="previewSource('${r.source.id}')">
            <strong>${getSrcIcon(r.source.type)} ${escHtml(r.source.name)}</strong><br>
            <span>...${escHtml(r.snippet).replace(new RegExp(escHtml(query), 'gi'), m => `<mark>${m}</mark>`)}...</span>
        </div>
    `).join('');
}

// Auto-tag Source (T-AI7)
async function autoTagSource(srcObj) {
    if (!getActiveKey()) return;
    const textToAnalyze = (srcObj.content || '').substring(0, 500);
    if (!textToAnalyze || textToAnalyze.length < 50) return;

    try {
        const prompt = `Phân tích đoạn văn bản sau và trả về JSON (CHỈTRẢ VỀ JSON, không thêm gì khác):
{"topic":"chủ đề chính (1-2 từ)","lang":"ngôn ngữ","docType":"loại tài liệu","complexity":"Basic/Intermediate/Advanced"}

Văn bản: ${textToAnalyze}`;

        const result = await callGemini(prompt);
        const jsonMatch = result.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            srcObj.autoTags = [data.topic, data.lang, data.docType, data.complexity].filter(Boolean);
            renderSources();
        }
    } catch { /* Silent fail for background task */ }
}

// ==============================================================
// SECTION 13: SESSION PERSISTENCE
// ==============================================================

async function saveSession() {
    if (STATE.activeNotebookId && STATE.db) {
        await saveCurrentNotebookData();
    }

    // Fallback: Also save text-only to localStorage for quick restore
    const sourceMeta = STATE.sources.map(s => ({
        id: s.id, name: s.name, type: s.type,
        content: s.content, size: s.size, mime: s.mime,
        colorTag: s.colorTag, autoTags: s.autoTags
    }));
    ls('vptx_sources_meta', sourceMeta);
    ls('vptx_chat_history', STATE.chatHistory.slice(-40));
}

function loadSessionFromLS() {
    // Load from localStorage as fallback (text/url sources only)
    const meta = ls('vptx_sources_meta');
    if (meta && Array.isArray(meta) && meta.length) {
        const restored = meta.filter(s => s.type === 'txt' || s.type === 'url' || s.type === 'youtube');
        if (restored.length) {
            STATE.sources = restored.map(s => ({ ...s, b64: '', file: null }));
            renderSources();
            document.getElementById('srcCount').textContent = STATE.sources.length;
        }
    }
    const hist = ls('vptx_chat_history');
    if (hist && Array.isArray(hist)) STATE.chatHistory = hist;
}

// ==============================================================
// SECTION 14: NOTEBOOK AI CHAT (Streaming) + T-AI1 Context Memory
// ==============================================================

function addMsg(role, text, isHtml = false, msgId = null) {
    const wrap = document.getElementById('chatMessages');
    if (!wrap) return null;
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if (msgId) div.id = msgId;
    const time = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
    const rendered = isHtml ? text : md2html(text);

    // AI message actions (T06) + Reactions (T-U7) + Pin (T-C6) + Writing Assistant (T-N6)
    const actions = role === 'ai' ? `
        <div class="msg-actions">
            <button class="msg-action-btn" onclick="copyMsgText(this)" title="Sao chép">📋 Copy</button>
            <button class="msg-action-btn" onclick="regenMsg(this)" title="Tạo lại">🔄 Tạo lại</button>
            <button class="msg-action-btn" onclick="speakMsg(this)" title="Đọc to">🔊 Đọc</button>
            <button class="msg-action-btn" onclick="dlMsgText(this)" title="Tải xuống">💾 Tải</button>
            <button class="msg-action-btn" onclick="pinMsgToNotes(this)" title="Ghim vào ghi chú">📌 Ghim</button>
        </div>
        <div class="msg-reactions">
            <button class="msg-reaction-btn" onclick="reactToMsg(this,'👍')" title="Hữu ích">👍</button>
            <button class="msg-reaction-btn" onclick="reactToMsg(this,'👎')" title="Không hữu ích">👎</button>
        </div>` : '';

    div.innerHTML = `<div class="msg-bubble">${rendered}</div><div class="msg-meta">${role === 'user' ? '👤 Bạn' : '🤖 Notebook AI'} · ${time}${actions}</div>`;
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
    return div;
}

function addTypingIndicator() {
    const wrap = document.getElementById('chatMessages');
    if (!wrap) return;
    const div = document.createElement('div');
    div.className = 'msg ai';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="msg-bubble"><span style="display:flex;gap:5px;align-items:center;padding:4px 0"><span style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:dotPulse .9s ease infinite"></span><span style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:dotPulse .9s .3s ease infinite"></span><span style="width:8px;height:8px;border-radius:50%;background:var(--primary);animation:dotPulse .9s .6s ease infinite"></span></span></div>';
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
}

function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

function renderChatFromHistory() {
    const wrap = document.getElementById('chatMessages');
    if (!wrap) return;
    // Keep the welcome message, clear the rest
    wrap.innerHTML = `
        <div class="msg ai">
            <div class="msg-bubble">
                Xin chào! Tôi là <strong>Notebook AI</strong> của TuongTanDigital. 👋<br><br>
                Hãy thêm tài liệu vào <strong>Nguồn tài liệu</strong> bên trái, sau đó đặt câu hỏi cho tôi.
            </div>
            <div class="msg-meta">🤖 Notebook AI</div>
        </div>`;

    // Render saved chat history
    STATE.chatHistory.forEach(m => {
        if (m.role === 'compressed') {
            // Show compressed history indicator (T-AI1)
            const div = document.createElement('div');
            div.className = 'msg ai';
            div.innerHTML = `<div class="msg-bubble" style="text-align:center;font-size:11px;color:var(--text3);padding:6px">📦 Đã nén lịch sử trước đó — <a href="#" onclick="showCompressedHistory();return false" style="color:var(--primary)">Xem đầy đủ</a></div>`;
            wrap.appendChild(div);
        } else {
            addMsg(m.role, m.content);
        }
    });
}

// Message action handlers
function copyMsgText(btn) {
    const bubble = btn.closest('.msg').querySelector('.msg-bubble');
    navigator.clipboard.writeText(bubble.innerText || '')
        .then(() => toast('📋 Đã sao chép!', 'success'));
}

function dlMsgText(btn) {
    const bubble = btn.closest('.msg').querySelector('.msg-bubble');
    const txt = bubble.innerText || '';
    dlBlob(txt, `notebook_ai_${Date.now()}.txt`, 'text/plain;charset=utf-8');
}

function speakMsg(btn) {
    const bubble = btn.closest('.msg').querySelector('.msg-bubble');
    const txt = bubble.innerText || '';
    if (!txt) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(txt);
    if (STATE.ttsVoices.length) {
        const vi = STATE.ttsVoices.find(v => v.lang.startsWith('vi'));
        if (vi) utt.voice = vi;
    }
    speechSynthesis.speak(utt);
    toast('🔊 Đang đọc câu trả lời...', 'info', 2000);
}

function regenMsg(btn) {
    const lastUser = STATE.chatHistory.filter(m => m.role === 'user').slice(-1)[0];
    if (!lastUser) { toast('⚠️ Không tìm được câu hỏi để tạo lại!', 'warning'); return; }
    const lastAiIdx = STATE.chatHistory.map(m => m.role).lastIndexOf('ai');
    if (lastAiIdx !== -1) STATE.chatHistory.splice(lastAiIdx, 1);
    const msgs = document.getElementById('chatMessages');
    const aiMsgs = msgs.querySelectorAll('.msg.ai:not(#typingIndicator)');
    if (aiMsgs.length) aiMsgs[aiMsgs.length - 1].remove();
    sendChat(lastUser.content);
}

// Pin message to Notes (T-C6)
function pinMsgToNotes(btn) {
    const bubble = btn.closest('.msg').querySelector('.msg-bubble');
    const text = bubble.innerText || '';
    if (!text) return;

    const note = {
        id: genId(),
        notebookId: STATE.activeNotebookId,
        content: text,
        tag: 'reference',
        source: 'chat',
        createdAt: new Date().toISOString()
    };
    STATE.notes.push(note);
    if (STATE.db) dbPut('notes', note).catch(() => {});
    toast('📌 Đã ghim vào ghi chú!', 'success');
}

// Message Reactions (T-U7)
function reactToMsg(btn, emoji) {
    btn.classList.toggle('active');
    if (emoji === '👎') {
        const feedback = prompt('Tại sao câu trả lời không hữu ích? (tuỳ chọn)');
        if (feedback) {
            toast('📝 Cảm ơn phản hồi!', 'info');
        }
    } else {
        toast('👍 Cảm ơn!', 'info', 1500);
    }
}

// Cancel Chat (T05)
function cancelChat() {
    if (STATE.abortCtrl) { STATE.abortCtrl.abort(); STATE.abortCtrl = null; }
    document.getElementById('cancelChatBtn').style.display = 'none';
    document.getElementById('chatSendBtn').disabled = false;
    removeTypingIndicator();
    toast('⚠️ Đã hủy yêu cầu', 'warning', 2000);
}

function autoResizeChatInput(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';

    // Token estimate
    const words = el.value.trim().split(/\s+/).filter(Boolean).length;
    const srcWords = STATE.sources.reduce((a, s) => a + (s.content || '').split(/\s+/).length, 0);
    const estTokens = Math.round((words + srcWords) * 1.3);
    const est = document.getElementById('tokenEstimate');
    if (est) {
        if (el.value.trim()) {
            est.style.display = 'block';
            est.textContent = `~${estTokens.toLocaleString()} tokens ước tính`;
            est.style.color = estTokens > 100000 ? 'var(--danger)' : estTokens > 50000 ? 'var(--warning)' : 'var(--text3)';
        } else {
            est.style.display = 'none';
        }
    }
}

async function sendChatBtn() {
    const inp = document.getElementById('chatInput');
    const q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    inp.style.height = 'auto';
    const est = document.getElementById('tokenEstimate');
    if (est) est.style.display = 'none';
    await sendChat(q);
}

async function sendChat(q) {
    if (!q) return;
    if (!STATE.sources.length) {
        toast('⚠️ Thêm ít nhất 1 tài liệu vào bảng nguồn trước!', 'warning');
        return;
    }

    document.getElementById('chatSendBtn').disabled = true;
    document.getElementById('cancelChatBtn').style.display = 'flex';
    const badge = document.getElementById('nbStatus');
    if (badge) { badge.style.display = 'inline-flex'; badge.className = 'badge processing'; badge.textContent = '⏳ Đang phân tích'; }

    addMsg('user', q);
    STATE.chatHistory.push({ role: 'user', content: q });

    // Context Memory (T-AI1): Compress old history if needed
    await compressHistoryIfNeeded();

    addTypingIndicator();
    STATE.abortCtrl = new AbortController();

    try {
        let fullText = '';
        removeTypingIndicator();
        const aiDiv = addMsg('ai', '', true);
        const bubble = aiDiv.querySelector('.msg-bubble');
        const cursor = document.createElement('span');
        cursor.className = 'streaming-cursor';
        bubble.appendChild(cursor);

        const parts = buildNotebookParts(q);

        await callGeminiStream(parts, (chunk) => {
            fullText += chunk;
            cursor.remove();
            bubble.innerHTML = md2html(fullText);
            bubble.appendChild(cursor);
            document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
        }, STATE.abortCtrl.signal);

        // Finalize
        cursor.remove();
        const time = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
        bubble.innerHTML = md2html(fullText);

        const metaDiv = aiDiv.querySelector('.msg-meta');
        if (metaDiv) {
            metaDiv.innerHTML = `🤖 Notebook AI · ${time}
                <div class="msg-actions">
                    <button class="msg-action-btn" onclick="copyMsgText(this)">📋 Copy</button>
                    <button class="msg-action-btn" onclick="regenMsg(this)">🔄 Tạo lại</button>
                    <button class="msg-action-btn" onclick="speakMsg(this)">🔊 Đọc</button>
                    <button class="msg-action-btn" onclick="dlMsgText(this)">💾 Tải</button>
                    <button class="msg-action-btn" onclick="pinMsgToNotes(this)">📌 Ghim</button>
                </div>
                <div class="msg-reactions">
                    <button class="msg-reaction-btn" onclick="reactToMsg(this,'👍')">👍</button>
                    <button class="msg-reaction-btn" onclick="reactToMsg(this,'👎')">👎</button>
                </div>`;
        }

        STATE.chatHistory.push({ role: 'ai', content: fullText });
        if (badge) { badge.className = 'badge done'; badge.textContent = '✅ Xong'; }
        setTimeout(() => { if (badge) badge.style.display = 'none'; }, 3000);
        saveSession();
    } catch (e) {
        removeTypingIndicator();
        if (e.name === 'AbortError' || e.message?.includes('abort')) {
            addMsg('ai', '⚠️ Yêu cầu đã bị hủy.', true);
        } else {
            addMsg('ai', `❌ Lỗi: ${e.message}\n\nGợi ý: Kiểm tra API Key hoặc thêm tài liệu nguồn.`, false);
            if (badge) { badge.className = 'badge error'; badge.textContent = '❌ Lỗi'; }
        }
    } finally {
        document.getElementById('chatSendBtn').disabled = false;
        document.getElementById('cancelChatBtn').style.display = 'none';
        STATE.abortCtrl = null;
    }
}

// Build parts array for Notebook chat
function buildNotebookParts(userQuestion) {
    const parts = [];

    // Add binary sources (images, PDFs, audio)
    STATE.sources.forEach(s => {
        if (s.b64 && (s.type === 'img' || s.type === 'pdf' || s.type === 'audio')) {
            parts.push({ inline_data: { mime_type: s.mime, data: s.b64 } });
        }
    });

    // Build text context from sources
    const textCtx = STATE.sources.filter(s => s.content && s.type !== 'url')
        .map((s, i) => `[Nguồn ${i + 1}: ${s.name}]\n${s.content}`).join('\n\n---\n\n');

    const urlCtx = STATE.sources.filter(s => s.type === 'url')
        .map((s, i) => `[URL Nguồn: ${s.name}]\nURL: ${s.content}`).join('\n\n---\n\n');

    // Persona prompt (T-N7)
    const personaPrompt = PERSONA_PROMPTS[STATE.persona] || PERSONA_PROMPTS.default;

    const systemPrompt = `${personaPrompt}

Nhiệm vụ: Chỉ trả lời dựa trên nội dung tài liệu cung cấp.
Quy tắc:
- Nếu thông tin có trong tài liệu: trả lời chính xác, trích dẫn [Nguồn X]
- Nếu không có: nói rõ "Thông tin này không có trong tài liệu cung cấp"
- Trả lời bằng tiếng Việt trừ khi có yêu cầu khác
- Định dạng rõ ràng: dùng **đậm**, *nghiêng*, ## tiêu đề khi phù hợp
- Trích dẫn nguồn sau mỗi thông tin quan trọng: [Nguồn X]

${textCtx ? '\nNỘI DUNG TÀI LIỆU:\n' + textCtx : ''}
${urlCtx ? '\nNỘI DUNG URL:\n' + urlCtx : ''}`;

    parts.push({ text: systemPrompt });

    // Add compressed history (T-AI1)
    if (STATE.compressedHistory) {
        parts.push({ text: `[Tóm tắt lịch sử trước đó]: ${STATE.compressedHistory}` });
    }

    // Add recent chat history (last 8 messages)
    const recentHist = STATE.chatHistory.filter(m => m.role !== 'compressed').slice(-8);
    recentHist.forEach(m => {
        parts.push({ text: `${m.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${m.content}` });
    });

    parts.push({ text: `Người dùng: ${userQuestion}` });
    return parts;
}

// Context Memory Compression (T-AI1)
async function compressHistoryIfNeeded() {
    const nonCompressed = STATE.chatHistory.filter(m => m.role !== 'compressed');
    if (nonCompressed.length <= 8) return;

    // Take the 6 oldest messages to compress
    const toCompress = nonCompressed.slice(0, 6);
    const compressText = toCompress.map(m => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`).join('\n');

    try {
        const summary = await callGemini(
            `Tóm tắt ngắn gọn cuộc hội thoại sau trong 3-4 câu, giữ lại thông tin quan trọng nhất:\n\n${compressText}`
        );

        STATE.compressedHistory = summary;

        // Remove compressed messages, add compressed marker
        STATE.chatHistory = [
            { role: 'compressed', content: summary },
            ...STATE.chatHistory.filter(m => m.role !== 'compressed').slice(6)
        ];
    } catch {
        // If compression fails, just truncate
        STATE.chatHistory = STATE.chatHistory.slice(-8);
    }
}

function showCompressedHistory() {
    if (STATE.compressedHistory) {
        alert('📦 Lịch sử đã nén:\n\n' + STATE.compressedHistory);
    }
}

// ==============================================================
// SECTION 15: COMPARE MODE (T-AI2: Multi-source)
// ==============================================================

function renderCompareSels() {
    const selA = document.getElementById('cmpSrcA');
    const selB = document.getElementById('cmpSrcB');
    if (!selA || !selB) return;
    const opts = STATE.sources.map((s, i) =>
        `<option value="${i}">${getSrcIcon(s.type)} ${s.name}</option>`
    ).join('');
    selA.innerHTML = opts || '<option value="">-- Chưa có nguồn --</option>';
    selB.innerHTML = opts || '<option value="">-- Chưa có nguồn --</option>';
    if (STATE.sources.length > 1) selB.selectedIndex = 1;
}

async function runCompare() {
    if (STATE.sources.length < 2) {
        toast('⚠️ Cần ít nhất 2 nguồn tài liệu để so sánh!', 'warning');
        return;
    }
    const iA = parseInt(document.getElementById('cmpSrcA').value);
    const iB = parseInt(document.getElementById('cmpSrcB').value);
    if (iA === iB) { toast('⚠️ Chọn 2 nguồn khác nhau!', 'warning'); return; }

    const sA = STATE.sources[iA];
    const sB = STATE.sources[iB];
    prog('compareProg', 'compareProgFill', 'compareProgTxt', 20, 'Chuẩn bị so sánh...');

    const resultEl = document.getElementById('compareResult');
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div class="spin spin-dark" style="width:20px;height:20px;margin:10px auto"></div>';

    const prompt = `So sánh chi tiết 2 tài liệu sau theo cấu trúc:

## 1. ĐIỂM GIỐNG NHAU
## 2. ĐIỂM KHÁC NHAU (dạng bảng nếu có thể)
## 3. ĐÁNH GIÁ TỔNG QUAN
## 4. KẾT LUẬN

---
TÀI LIỆU A: ${sA.name}
${sA.content || '[File nhị phân ' + sA.type.toUpperCase() + ']'}

---
TÀI LIỆU B: ${sB.name}
${sB.content || '[File nhị phân ' + sB.type.toUpperCase() + ']'}`;

    try {
        prog('compareProg', 'compareProgFill', 'compareProgTxt', 50, 'AI đang so sánh...');
        const parts = [];
        if (sA.b64 && (sA.type === 'img' || sA.type === 'pdf')) parts.push({ inline_data: { mime_type: sA.mime, data: sA.b64 } });
        if (sB.b64 && (sB.type === 'img' || sB.type === 'pdf')) parts.push({ inline_data: { mime_type: sB.mime, data: sB.b64 } });
        parts.push({ text: prompt });

        const key = getActiveKey();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${STATE.model}:generateContent?key=${key}`;
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }] }) });
        const data = await res.json();
        const ans = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        prog('compareProg', 'compareProgFill', 'compareProgTxt', 100, 'Hoàn thành!');
        resultEl.innerHTML = md2html(ans);
        toast('✅ So sánh hoàn tất!', 'success');
    } catch (e) {
        resultEl.innerHTML = `<span style="color:var(--danger)">❌ Lỗi: ${escHtml(e.message)}</span>`;
        toast('❌ Lỗi so sánh: ' + e.message, 'error', 5000);
    }
}

// ==============================================================
// SECTION 16: SMART SUGGESTED QUESTIONS (T-C5)
// ==============================================================

async function generateSuggestedQuestions() {
    if (!getActiveKey() || !STATE.sources.length) return;

    const container = document.getElementById('suggestedQuestions');
    if (!container) return;

    // Show loading
    container.innerHTML = '<span class="sug-btn" style="opacity:.5">⏳ Đang tạo gợi ý...</span>';

    try {
        const textCtx = STATE.sources.map(s => s.content || '').join(' ').substring(0, 2000);
        const prompt = `Dựa trên nội dung tài liệu sau, hãy tạo 5 câu hỏi khám phá thông minh, hữu ích nhất. Mỗi câu ngắn gọn (dưới 10 từ). Trả về JSON array:
["câu hỏi 1","câu hỏi 2","câu hỏi 3","câu hỏi 4","câu hỏi 5"]

Nội dung: ${textCtx}`;

        const result = await callGemini(prompt);
        const jsonMatch = result.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            container.innerHTML = questions.map(q =>
                `<button class="sug-btn" onclick="useSuggestedQuestion(this)" title="${escHtml(q)}">${escHtml(q)}</button>`
            ).join('') +
                `<button class="sug-btn" onclick="generateSuggestedQuestions()" title="Làm mới gợi ý">🔄</button>`;
        } else {
            container.innerHTML = '';
        }
    } catch {
        container.innerHTML = '';
    }
}

function useSuggestedQuestion(btn) {
    const q = btn.textContent || btn.title;
    if (!q) return;
    const inp = document.getElementById('chatInput');
    if (inp) { inp.value = q; sendChatBtn(); }
}

// ==============================================================
// SECTION 17: PERSONA SELECTOR (T-N7)
// ==============================================================

function setPersona(value) {
    STATE.persona = value;
    ls('vptx_persona', value);
    toast(`🎭 Phong cách AI: ${value}`, 'info', 2000);
}

function setModel(value) {
    STATE.model = value;
    ls('vptx_model', value);
    toast(`🧠 Model: ${value}`, 'info', 2000);
}

// ==============================================================
// SECTION 18: SPLIT VIEW (T-N9)
// ==============================================================

function toggleSplitView() {
    STATE.splitViewActive = !STATE.splitViewActive;
    const layout = document.getElementById('notebookLayout');
    const panel = document.getElementById('splitViewPanel');
    const btn = document.getElementById('splitViewBtn');

    if (STATE.splitViewActive) {
        layout.classList.add('split-active');
        panel.style.display = 'block';
        btn.style.background = 'rgba(79,70,229,.15)';

        // Show first source in split view
        if (STATE.sources.length) {
            loadSourceInSplitView(STATE.sources[0].id);
        }
    } else {
        layout.classList.remove('split-active');
        panel.style.display = 'none';
        btn.style.background = '';
    }
}

function closeSplitViewPanel() {
    STATE.splitViewActive = false;
    document.getElementById('notebookLayout').classList.remove('split-active');
    document.getElementById('splitViewPanel').style.display = 'none';
    document.getElementById('splitViewBtn').style.background = '';
}

function loadSourceInSplitView(srcId) {
    const src = STATE.sources.find(s => s.id === srcId);
    const contentEl = document.getElementById('splitViewContent');
    if (!src || !contentEl) return;

    if (src.type === 'img' && src.b64) {
        contentEl.innerHTML = `<img src="data:${src.mime};base64,${src.b64}" style="max-width:100%;border-radius:6px" alt="${escHtml(src.name)}">`;
    } else if (src.content) {
        contentEl.innerHTML = `<div style="white-space:pre-wrap;font-size:13px;line-height:1.7">${escHtml(src.content)}</div>`;
    } else {
        contentEl.innerHTML = `<div class="empty-st">Không có nội dung xem trước</div>`;
    }
}

// ==============================================================
// SECTION 19: FOCUS MODE (T-U8)
// ==============================================================

function toggleFocusMode() {
    STATE.focusMode = !STATE.focusMode;
    document.body.classList.toggle('focus-mode', STATE.focusMode);
    const btn = document.getElementById('focusModeBtn');
    if (btn) {
        btn.style.background = STATE.focusMode ? 'rgba(79,70,229,.15)' : '';
    }
    if (STATE.focusMode) {
        toast('🎯 Focus Mode — Nhấn Esc để thoát', 'info', 3000);
    }
}

// ==============================================================
// SECTION 20: DRAG-TO-RESIZE PANELS (T-U4)
// ==============================================================

function initResizeHandle() {
    const handle = document.getElementById('resizeHandle');
    const layout = document.getElementById('notebookLayout');
    const sourcesCol = document.getElementById('notebookSourcesCol');
    if (!handle || !layout || !sourcesCol) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sourcesCol.getBoundingClientRect().width;
        handle.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(240, Math.min(600, startWidth + diff));
        layout.style.gridTemplateColumns = `${newWidth}px 8px 1fr`;
    });

    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        handle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        // Save width
        const width = sourcesCol.getBoundingClientRect().width;
        ls('vptx_srcPanelWidth', Math.round(width));
    });

    // Restore saved width
    const savedWidth = ls('vptx_srcPanelWidth');
    if (savedWidth && savedWidth >= 240 && savedWidth <= 600) {
        layout.style.gridTemplateColumns = `${savedWidth}px 8px 1fr`;
    }
}

// ==============================================================
// END OF PART 1 — Continued in Part 2 (STT, TTS, Record, Convert)
// ==============================================================

// ==============================================================
// APP.JS — PART 2/3
// STT, TTS, RECORDING, CONVERT, BATCH, QUICK ACTIONS,
// FLASHCARDS, QUIZ, GLOSSARY, PODCAST, CITATIONS,
// SENTIMENT, WRITING ASSISTANT, SUGGESTED QUESTIONS
// ==============================================================
// Phần này triển khai: T-F1, T-F3, T-F4, T-TTS1, T-TTS2,
// T-C4, T-C5, T-AI3, T-AI4, T-AI5, T-AI6, T-N6
// ==============================================================

// ==============================================================
// SECTION 20: SPEECH-TO-TEXT (STT) ENGINE
// ==============================================================

/**
 * Khởi tạo STT panel – bind events
 */
function initSTT() {
  const sttFileInput = document.getElementById('sttFileInput');
  const sttDropzone = document.getElementById('sttDropzone');
  const sttBtnProcess = document.getElementById('sttBtnProcess');
  const sttBtnClear = document.getElementById('sttBtnClear');
  const sttBtnCopy = document.getElementById('sttBtnCopy');
  const sttBtnExport = document.getElementById('sttBtnExport');
  const sttRealtime = document.getElementById('sttRealtimeToggle');

  if (sttDropzone) {
    sttDropzone.addEventListener('click', () => sttFileInput?.click());
    sttDropzone.addEventListener('dragover', e => { e.preventDefault(); sttDropzone.classList.add('dragover'); });
    sttDropzone.addEventListener('dragleave', () => sttDropzone.classList.remove('dragover'));
    sttDropzone.addEventListener('drop', e => {
      e.preventDefault();
      sttDropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        sttFileInput.files = e.dataTransfer.files;
        handleSTTFileSelect();
      }
    });
  }

  sttFileInput?.addEventListener('change', handleSTTFileSelect);
  sttBtnProcess?.addEventListener('click', processSTT);
  sttBtnClear?.addEventListener('click', clearSTT);
  sttBtnCopy?.addEventListener('click', () => {
    const result = document.getElementById('sttResult');
    if (result?.textContent) copyToClipboard(result.textContent);
  });
  sttBtnExport?.addEventListener('click', exportSTTResult);
  sttRealtime?.addEventListener('change', toggleRealtimeSTT);
}

/**
 * Xử lý chọn file audio cho STT
 */
function handleSTTFileSelect() {
  const sttFileInput = document.getElementById('sttFileInput');
  const sttFileInfo = document.getElementById('sttFileInfo');
  const sttBtnProcess = document.getElementById('sttBtnProcess');
  if (!sttFileInput?.files?.length) return;

  const file = sttFileInput.files[0];
  const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/mp4', 'audio/m4a', 'video/webm', 'video/mp4'];
  if (!validTypes.some(t => file.type.includes(t.split('/')[1]))) {
    showToast('Định dạng file không hỗ trợ. Hãy dùng WAV, MP3, OGG, WEBM, FLAC, M4A.', 'error');
    return;
  }

  STATE.sttFile = file;
  if (sttFileInfo) {
    sttFileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
    sttFileInfo.style.display = 'block';
  }
  if (sttBtnProcess) sttBtnProcess.disabled = false;
}

/**
 * Gửi file audio lên Gemini để STT
 */
async function processSTT() {
  if (!STATE.sttFile) {
    showToast('Chưa chọn file audio.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Chưa có API key.', 'error');
    return;
  }

  const sttResult = document.getElementById('sttResult');
  const sttProgress = document.getElementById('sttProgress');
  const sttBtnProcess = document.getElementById('sttBtnProcess');
  const sttLanguage = document.getElementById('sttLanguage')?.value || 'vi';
  const sttTimestamp = document.getElementById('sttTimestamp')?.checked || false;
  const sttSpeaker = document.getElementById('sttSpeaker')?.checked || false;

  if (sttBtnProcess) sttBtnProcess.disabled = true;
  showProgress(sttProgress, 20, 'Đang chuẩn bị audio...');

  try {
    const base64 = await fileToBase64(STATE.sttFile);
    showProgress(sttProgress, 50, 'Đang gửi cho AI phân tích...');

    let prompt = `Hãy chuyển đổi toàn bộ nội dung audio này thành văn bản.`;
    if (sttLanguage === 'vi') prompt += ` Ngôn ngữ: Tiếng Việt.`;
    else if (sttLanguage === 'en') prompt += ` Language: English.`;
    else if (sttLanguage === 'ja') prompt += ` 言語: 日本語.`;
    else prompt += ` Tự động nhận diện ngôn ngữ.`;

    if (sttTimestamp) prompt += ` Thêm timestamp [HH:MM:SS] cho mỗi đoạn.`;
    if (sttSpeaker) prompt += ` Phân biệt người nói (Speaker 1, Speaker 2...).`;
    prompt += ` Giữ nguyên nội dung chính xác, không tóm tắt.`;

    const mimeType = STATE.sttFile.type || 'audio/wav';
    const result = await callGemini(prompt, [{
      inlineData: { mimeType, data: base64 }
    }]);

    showProgress(sttProgress, 100, 'Hoàn tất!');
    if (sttResult) {
      sttResult.innerHTML = md2html(result);
      sttResult.style.display = 'block';
    }
    STATE.sttResult = result;

    // Enable action buttons
    document.getElementById('sttBtnCopy')?.removeAttribute('disabled');
    document.getElementById('sttBtnExport')?.removeAttribute('disabled');

    showToast('Chuyển đổi giọng nói thành văn bản thành công!', 'success');
  } catch (err) {
    console.error('STT Error:', err);
    showToast('Lỗi STT: ' + err.message, 'error');
    showProgress(sttProgress, 0);
  } finally {
    if (sttBtnProcess) sttBtnProcess.disabled = false;
  }
}

/**
 * Xóa kết quả STT
 */
function clearSTT() {
  STATE.sttFile = null;
  STATE.sttResult = '';
  const sttResult = document.getElementById('sttResult');
  const sttFileInfo = document.getElementById('sttFileInfo');
  const sttProgress = document.getElementById('sttProgress');
  if (sttResult) { sttResult.innerHTML = ''; sttResult.style.display = 'none'; }
  if (sttFileInfo) { sttFileInfo.textContent = ''; sttFileInfo.style.display = 'none'; }
  showProgress(sttProgress, 0);
  const sttFileInput = document.getElementById('sttFileInput');
  if (sttFileInput) sttFileInput.value = '';
  document.getElementById('sttBtnCopy')?.setAttribute('disabled', '');
  document.getElementById('sttBtnExport')?.setAttribute('disabled', '');
  showToast('Đã xóa kết quả STT.', 'info');
}

/**
 * Export kết quả STT
 */
function exportSTTResult() {
  if (!STATE.sttResult) {
    showToast('Chưa có kết quả để xuất.', 'warning');
    return;
  }
  const format = document.getElementById('sttExportFormat')?.value || 'txt';
  let content, filename, mimeType;

  switch (format) {
    case 'md':
      content = `# Kết quả STT\n\n_File: ${STATE.sttFile?.name || 'audio'}_\n_Ngày: ${new Date().toLocaleString('vi-VN')}_\n\n---\n\n${STATE.sttResult}`;
      filename = 'stt-result.md';
      mimeType = 'text/markdown';
      break;
    case 'json':
      content = JSON.stringify({
        source: STATE.sttFile?.name,
        date: new Date().toISOString(),
        text: STATE.sttResult
      }, null, 2);
      filename = 'stt-result.json';
      mimeType = 'application/json';
      break;
    default:
      content = STATE.sttResult;
      filename = 'stt-result.txt';
      mimeType = 'text/plain';
  }

  downloadBlob(new Blob([content], { type: mimeType }), filename);
  showToast('Đã xuất kết quả STT!', 'success');
}

// ==============================================================
// SECTION 21: REAL-TIME STT (Web Speech API)
// ==============================================================

let realtimeRecognition = null;

/**
 * Bật/tắt Real-time STT
 */
function toggleRealtimeSTT() {
  const toggle = document.getElementById('sttRealtimeToggle');
  const display = document.getElementById('sttRealtimeDisplay');

  if (toggle?.checked) {
    startRealtimeSTT(display);
  } else {
    stopRealtimeSTT();
  }
}

function startRealtimeSTT(display) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Trình duyệt không hỗ trợ Real-time STT.', 'error');
    const toggle = document.getElementById('sttRealtimeToggle');
    if (toggle) toggle.checked = false;
    return;
  }

  realtimeRecognition = new SpeechRecognition();
  realtimeRecognition.continuous = true;
  realtimeRecognition.interimResults = true;
  realtimeRecognition.lang = document.getElementById('sttLanguage')?.value === 'en' ? 'en-US' :
                             document.getElementById('sttLanguage')?.value === 'ja' ? 'ja-JP' : 'vi-VN';

  let finalTranscript = '';

  realtimeRecognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    if (display) {
      display.innerHTML = `<p>${escapeHtml(finalTranscript)}<span class="interim-text">${escapeHtml(interim)}</span></p>`;
      display.style.display = 'block';
      display.scrollTop = display.scrollHeight;
    }
  };

  realtimeRecognition.onerror = (event) => {
    console.error('Realtime STT error:', event.error);
    if (event.error !== 'no-speech') {
      showToast('Lỗi nhận diện giọng nói: ' + event.error, 'error');
    }
  };

  realtimeRecognition.onend = () => {
    // Auto restart if still toggled on
    const toggle = document.getElementById('sttRealtimeToggle');
    if (toggle?.checked && realtimeRecognition) {
      try { realtimeRecognition.start(); } catch (e) { /* ignore */ }
    }
  };

  try {
    realtimeRecognition.start();
    showToast('Đang lắng nghe...', 'info');
  } catch (e) {
    showToast('Không thể bắt đầu nhận diện giọng nói.', 'error');
  }
}

function stopRealtimeSTT() {
  if (realtimeRecognition) {
    try { realtimeRecognition.stop(); } catch (e) { /* ignore */ }
    realtimeRecognition = null;
  }
  showToast('Đã dừng nhận diện giọng nói real-time.', 'info');
}


// ==============================================================
// SECTION 22: TTS ENGINE — BROWSER SPEECH SYNTHESIS
// Task: T-TTS1, T-TTS2
// ==============================================================

/**
 * Khởi tạo TTS panel
 */
function initTTS() {
  // Engine toggle
  const engineBtns = document.querySelectorAll('[data-tts-engine]');
  engineBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      engineBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const engine = btn.dataset.ttsEngine;
      STATE.ttsEngine = engine;
      document.getElementById('ttsBrowserPanel')?.classList.toggle('hidden', engine !== 'browser');
      document.getElementById('ttsGeminiPanel')?.classList.toggle('hidden', engine !== 'gemini');
    });
  });

  // Browser TTS voice list
  populateBrowserVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateBrowserVoices;
  }

  // TTS action buttons
  document.getElementById('ttsBtnPlay')?.addEventListener('click', playTTS);
  document.getElementById('ttsBtnPause')?.addEventListener('click', pauseTTS);
  document.getElementById('ttsBtnStop')?.addEventListener('click', stopTTS);
  document.getElementById('ttsBtnDownload')?.addEventListener('click', downloadTTSAudio);

  // Slider bindings
  bindSliderValue('ttsRate', 'ttsRateVal');
  bindSliderValue('ttsPitch', 'ttsPitchVal');
  bindSliderValue('ttsVolume', 'ttsVolumeVal');
}

/**
 * Bind slider value display
 */
function bindSliderValue(sliderId, displayId) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (slider && display) {
    slider.addEventListener('input', () => { display.textContent = slider.value; });
  }
}

/**
 * Load danh sách giọng Browser TTS
 */
function populateBrowserVoices() {
  const select = document.getElementById('ttsBrowserVoice');
  if (!select) return;

  const voices = speechSynthesis.getVoices();
  select.innerHTML = '';

  // Group by language
  const groups = {};
  voices.forEach(v => {
    const lang = v.lang.split('-')[0];
    if (!groups[lang]) groups[lang] = [];
    groups[lang].push(v);
  });

  // Prioritize Vietnamese, English
  const priority = ['vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de'];
  const sortedLangs = [...new Set([...priority.filter(l => groups[l]), ...Object.keys(groups)])];

  sortedLangs.forEach(lang => {
    if (!groups[lang]) return;
    const optgroup = document.createElement('optgroup');
    optgroup.label = lang.toUpperCase();
    groups[lang].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' ★' : ''}`;
      opt.dataset.lang = v.lang;
      optgroup.appendChild(opt);
    });
    select.appendChild(optgroup);
  });
}

/**
 * Phát TTS theo engine hiện tại
 */
async function playTTS() {
  const text = document.getElementById('ttsInput')?.value?.trim();
  if (!text) {
    showToast('Vui lòng nhập văn bản cần đọc.', 'warning');
    return;
  }

  if (STATE.ttsEngine === 'gemini') {
    await playGeminiTTS(text);
  } else {
    playBrowserTTS(text);
  }
}

/**
 * Browser TTS playback với highlight (T-TTS1)
 */
function playBrowserTTS(text) {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voiceName = document.getElementById('ttsBrowserVoice')?.value;
  const voices = speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.name === voiceName);
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.rate = parseFloat(document.getElementById('ttsRate')?.value || 1);
  utterance.pitch = parseFloat(document.getElementById('ttsPitch')?.value || 1);
  utterance.volume = parseFloat(document.getElementById('ttsVolume')?.value || 1);

  // Reading display panel – highlight (T-TTS1)
  const readingDisplay = document.getElementById('ttsReadingDisplay');
  if (readingDisplay) {
    readingDisplay.style.display = 'block';
    readingDisplay.innerHTML = `<p>${escapeHtml(text)}</p>`;
  }

  // Word-level highlighting via onboundary
  utterance.onboundary = (event) => {
    if (event.name === 'word' && readingDisplay) {
      const charIndex = event.charIndex;
      const charLength = event.charLength || 1;
      const before = escapeHtml(text.substring(0, charIndex));
      const word = escapeHtml(text.substring(charIndex, charIndex + charLength));
      const after = escapeHtml(text.substring(charIndex + charLength));
      readingDisplay.innerHTML = `<p>${before}<mark class="tts-highlight">${word}</mark>${after}</p>`;

      // Auto-scroll to highlighted word
      const mark = readingDisplay.querySelector('mark');
      if (mark) mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  utterance.onstart = () => {
    STATE.ttsPlaying = true;
    updateTTSButtons();
    showProgress(document.getElementById('ttsProgress'), -1, 'Đang đọc...');
  };

  utterance.onend = () => {
    STATE.ttsPlaying = false;
    STATE.ttsPaused = false;
    updateTTSButtons();
    showProgress(document.getElementById('ttsProgress'), 100, 'Hoàn tất');
    if (readingDisplay) {
      readingDisplay.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }
  };

  utterance.onerror = (e) => {
    STATE.ttsPlaying = false;
    updateTTSButtons();
    if (e.error !== 'canceled') {
      showToast('Lỗi TTS: ' + e.error, 'error');
    }
  };

  STATE.currentUtterance = utterance;
  speechSynthesis.speak(utterance);
}

/**
 * Tạm dừng TTS
 */
function pauseTTS() {
  if (STATE.ttsEngine === 'browser') {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      STATE.ttsPaused = true;
      updateTTSButtons();
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      STATE.ttsPaused = false;
      updateTTSButtons();
    }
  } else {
    // Gemini TTS audio pause/resume
    const audio = STATE.geminiAudioElement;
    if (audio) {
      if (audio.paused) { audio.play(); STATE.ttsPaused = false; }
      else { audio.pause(); STATE.ttsPaused = true; }
      updateTTSButtons();
    }
  }
}

/**
 * Dừng TTS
 */
function stopTTS() {
  speechSynthesis.cancel();
  if (STATE.geminiAudioElement) {
    STATE.geminiAudioElement.pause();
    STATE.geminiAudioElement.currentTime = 0;
    STATE.geminiAudioElement = null;
  }
  STATE.ttsPlaying = false;
  STATE.ttsPaused = false;
  updateTTSButtons();

  const readingDisplay = document.getElementById('ttsReadingDisplay');
  if (readingDisplay) readingDisplay.style.display = 'none';
  showProgress(document.getElementById('ttsProgress'), 0);
}

/**
 * Cập nhật trạng thái nút TTS
 */
function updateTTSButtons() {
  const playBtn = document.getElementById('ttsBtnPlay');
  const pauseBtn = document.getElementById('ttsBtnPause');
  const stopBtn = document.getElementById('ttsBtnStop');

  if (playBtn) playBtn.disabled = STATE.ttsPlaying;
  if (pauseBtn) {
    pauseBtn.disabled = !STATE.ttsPlaying;
    pauseBtn.innerHTML = STATE.ttsPaused
      ? '<span class="icon">▶</span> Tiếp tục'
      : '<span class="icon">⏸</span> Tạm dừng';
  }
  if (stopBtn) stopBtn.disabled = !STATE.ttsPlaying;
}


// ==============================================================
// SECTION 23: TTS ENGINE — GEMINI AI TTS (T-TTS2)
// ==============================================================

/**
 * Phát TTS qua Gemini API
 */
async function playGeminiTTS(text) {
  if (!getActiveKey()) {
    showToast('Cần API key để sử dụng Gemini TTS.', 'error');
    return;
  }

  const voice = document.getElementById('ttsGeminiVoice')?.value || 'Aoede';
  const stylePrompt = document.getElementById('ttsGeminiStyle')?.value?.trim() || '';
  const progress = document.getElementById('ttsProgress');
  const readingDisplay = document.getElementById('ttsReadingDisplay');

  showProgress(progress, 30, 'Đang tạo giọng nói AI...');
  STATE.ttsPlaying = true;
  updateTTSButtons();

  try {
    // Show reading display with sentence-level tracking (T-TTS1)
    if (readingDisplay) {
      readingDisplay.style.display = 'block';
      readingDisplay.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }

    const audioBase64 = await callGeminiTTS(text, voice, stylePrompt);
    showProgress(progress, 80, 'Đang phát...');

    // Decode and play
    const audioBlob = base64ToBlob(audioBase64, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    STATE.geminiAudioElement = audio;
    STATE.geminiTTSBlob = audioBlob;

    // Sentence-level highlight for Gemini TTS
    const sentences = text.match(/[^.!?。？！]+[.!?。？！]?\s*/g) || [text];
    let currentSentenceIndex = 0;

    audio.ontimeupdate = () => {
      if (!readingDisplay || !sentences.length) return;
      const progress_ratio = audio.currentTime / (audio.duration || 1);
      const sentenceIndex = Math.min(
        Math.floor(progress_ratio * sentences.length),
        sentences.length - 1
      );

      if (sentenceIndex !== currentSentenceIndex) {
        currentSentenceIndex = sentenceIndex;
        let html = '';
        sentences.forEach((s, i) => {
          if (i === currentSentenceIndex) {
            html += `<mark class="tts-highlight">${escapeHtml(s)}</mark>`;
          } else {
            html += escapeHtml(s);
          }
        });
        readingDisplay.innerHTML = `<p>${html}</p>`;
      }
    };

    audio.onended = () => {
      STATE.ttsPlaying = false;
      STATE.ttsPaused = false;
      updateTTSButtons();
      showProgress(progress, 100, 'Hoàn tất');
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      STATE.ttsPlaying = false;
      updateTTSButtons();
      showToast('Lỗi phát audio Gemini TTS.', 'error');
    };

    await audio.play();
    showProgress(progress, 100, 'Đang phát...');

    // Enable download
    document.getElementById('ttsBtnDownload')?.removeAttribute('disabled');

  } catch (err) {
    console.error('Gemini TTS Error:', err);
    STATE.ttsPlaying = false;
    updateTTSButtons();
    showToast('Lỗi Gemini TTS: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Chuyển base64 -> Blob
 */
function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Download audio TTS
 */
function downloadTTSAudio() {
  if (STATE.geminiTTSBlob) {
    downloadBlob(STATE.geminiTTSBlob, 'tts-audio.wav');
    showToast('Đã tải audio TTS!', 'success');
  } else {
    showToast('Chưa có audio để tải.', 'warning');
  }
}


// ==============================================================
// SECTION 24: SCREEN RECORDING & MEETING MINUTES
// Task: T-F1 — Fix stopRec Promise flow
// ==============================================================

let screenMediaRecorder = null;
let screenRecordedChunks = [];
let screenStream = null;

/**
 * Khởi tạo Recording panel
 */
function initRecording() {
  document.getElementById('recBtnStart')?.addEventListener('click', startScreenRec);
  document.getElementById('recBtnStop')?.addEventListener('click', stopScreenRec);
  document.getElementById('recBtnMinutes')?.addEventListener('click', generateMeetingMinutes);
  document.getElementById('recBtnDownload')?.addEventListener('click', downloadRecording);
}

/**
 * Bắt đầu ghi màn hình
 */
async function startScreenRec() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true  // Capture system audio if possible
    });

    // Also capture microphone
    let micStream = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.warn('Không thể truy cập microphone:', e);
    }

    // Combine streams
    const tracks = [...screenStream.getTracks()];
    if (micStream) {
      micStream.getAudioTracks().forEach(t => tracks.push(t));
    }

    const combinedStream = new MediaStream(tracks);
    screenRecordedChunks = [];

    screenMediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm'
    });

    screenMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) screenRecordedChunks.push(e.data);
    };

    screenMediaRecorder.start(1000); // Chunk every second

    // UI updates
    document.getElementById('recBtnStart')?.classList.add('hidden');
    document.getElementById('recBtnStop')?.classList.remove('hidden');
    document.getElementById('recStatus')?.classList.add('recording');
    const statusText = document.getElementById('recStatusText');
    if (statusText) statusText.textContent = 'Đang ghi...';

    // Start timer
    STATE.recStartTime = Date.now();
    STATE.recTimerInterval = setInterval(updateRecTimer, 1000);

    // Handle stream stop (user clicks browser "Stop sharing")
    screenStream.getVideoTracks()[0].onended = () => {
      if (screenMediaRecorder?.state !== 'inactive') {
        stopScreenRec();
      }
    };

    showToast('Bắt đầu ghi màn hình!', 'success');

  } catch (err) {
    console.error('Screen recording error:', err);
    showToast('Không thể bắt đầu ghi màn hình: ' + err.message, 'error');
  }
}

/**
 * Cập nhật timer ghi màn hình
 */
function updateRecTimer() {
  const elapsed = Date.now() - (STATE.recStartTime || Date.now());
  const seconds = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const timerEl = document.getElementById('recTimer');
  if (timerEl) timerEl.textContent = `${mm}:${ss}`;
}

/**
 * Dừng ghi màn hình — T-F1: Promise-based flow
 * Trả về Promise, chờ onstop fire xong mới resolve
 */
function stopScreenRec() {
  return new Promise((resolve, reject) => {
    if (!screenMediaRecorder || screenMediaRecorder.state === 'inactive') {
      resolve(null);
      return;
    }

    clearInterval(STATE.recTimerInterval);

    screenMediaRecorder.onstop = () => {
      const blob = new Blob(screenRecordedChunks, { type: 'video/webm' });
      STATE.screenBlob = blob;
      screenRecordedChunks = [];

      // Stop all tracks
      screenStream?.getTracks().forEach(t => t.stop());
      screenStream = null;

      // UI updates
      document.getElementById('recBtnStart')?.classList.remove('hidden');
      document.getElementById('recBtnStop')?.classList.add('hidden');
      document.getElementById('recStatus')?.classList.remove('recording');
      const statusText = document.getElementById('recStatusText');
      if (statusText) statusText.textContent = 'Đã dừng ghi';

      // Show video preview
      const preview = document.getElementById('recPreview');
      if (preview) {
        preview.src = URL.createObjectURL(blob);
        preview.style.display = 'block';
      }

      // Enable action buttons
      document.getElementById('recBtnMinutes')?.removeAttribute('disabled');
      document.getElementById('recBtnDownload')?.removeAttribute('disabled');

      showToast('Đã dừng ghi màn hình.', 'success');
      resolve(blob);
    };

    screenMediaRecorder.onerror = (e) => {
      reject(e.error || new Error('Recording error'));
    };

    screenMediaRecorder.stop();
  });
}

/**
 * Tạo biên bản cuộc họp AI — T-F1 fix
 */
async function generateMeetingMinutes() {
  // Nếu đang ghi -> dừng trước, ĐỢI blob sẵn sàng
  if (screenMediaRecorder?.state === 'recording') {
    showToast('Đang dừng ghi và chuẩn bị audio...', 'info');
    try {
      await stopScreenRec();
    } catch (err) {
      showToast('Lỗi khi dừng ghi: ' + err.message, 'error');
      return;
    }
  }

  if (!STATE.screenBlob) {
    showToast('Chưa có bản ghi nào. Hãy ghi màn hình trước.', 'warning');
    return;
  }

  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const progress = document.getElementById('recProgress');
  const resultArea = document.getElementById('recResult');
  showProgress(progress, 20, 'Đang chuẩn bị audio...');

  try {
    // Extract audio or send video directly
    const base64 = await fileToBase64(STATE.screenBlob);
    showProgress(progress, 50, 'Đang phân tích nội dung cuộc họp...');

    const prompt = `Bạn là trợ lý AI chuyên tạo biên bản cuộc họp.
Hãy nghe/xem nội dung video/audio cuộc họp này và tạo biên bản cuộc họp chi tiết gồm:

## 📋 BIÊN BẢN CUỘC HỌP

### 1. Thông tin chung
- Thời gian: ${new Date().toLocaleString('vi-VN')}
- Thời lượng: (ước tính từ nội dung)

### 2. Người tham gia
- Liệt kê các người nói nhận diện được

### 3. Nội dung chính
- Tóm tắt từng chủ đề thảo luận

### 4. Quyết định & Kết luận
- Các quyết định đã đưa ra

### 5. Hành động tiếp theo (Action Items)
- Ai làm gì, deadline khi nào

### 6. Ghi chú bổ sung

Hãy viết chi tiết, chính xác, chuyên nghiệp. Nếu không nghe rõ phần nào, ghi chú "[không rõ]".`;

    const mimeType = STATE.screenBlob.type || 'video/webm';
    const result = await callGemini(prompt, [{
      inlineData: { mimeType, data: base64 }
    }]);

    showProgress(progress, 100, 'Hoàn tất!');
    if (resultArea) {
      resultArea.innerHTML = md2html(result);
      resultArea.style.display = 'block';
    }
    STATE.meetingMinutes = result;
    showToast('Đã tạo biên bản cuộc họp thành công!', 'success');

  } catch (err) {
    console.error('Meeting minutes error:', err);
    showToast('Lỗi tạo biên bản: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Download bản ghi màn hình
 */
function downloadRecording() {
  if (!STATE.screenBlob) {
    showToast('Chưa có bản ghi.', 'warning');
    return;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadBlob(STATE.screenBlob, `recording-${timestamp}.webm`);
  showToast('Đã tải bản ghi!', 'success');
}


// ==============================================================
// SECTION 25: FILE CONVERSION ENGINE
// Task: T-F4 — Single processCvt(), no duplicates
// ==============================================================

/**
 * Khởi tạo Convert panel
 */
function initConvert() {
  const cvtFileInput = document.getElementById('cvtFileInput');
  const cvtDropzone = document.getElementById('cvtDropzone');

  cvtDropzone?.addEventListener('click', () => cvtFileInput?.click());
  cvtDropzone?.addEventListener('dragover', e => { e.preventDefault(); cvtDropzone.classList.add('dragover'); });
  cvtDropzone?.addEventListener('dragleave', () => cvtDropzone.classList.remove('dragover'));
  cvtDropzone?.addEventListener('drop', e => {
    e.preventDefault();
    cvtDropzone.classList.remove('dragover');
    handleCvtFiles(e.dataTransfer.files);
  });

  cvtFileInput?.addEventListener('change', () => handleCvtFiles(cvtFileInput.files));
  document.getElementById('cvtBtnProcess')?.addEventListener('click', processCvt);
  document.getElementById('cvtBtnClear')?.addEventListener('click', clearCvt);
  document.getElementById('cvtBtnBatch')?.addEventListener('click', toggleBatchMode);
}

/**
 * Xử lý file được chọn cho Convert
 */
function handleCvtFiles(files) {
  if (!files || !files.length) return;

  STATE.cvtFiles = Array.from(files);
  const infoEl = document.getElementById('cvtFileInfo');
  const listEl = document.getElementById('cvtFileList');

  if (STATE.cvtFiles.length === 1) {
    if (infoEl) {
      infoEl.textContent = `${STATE.cvtFiles[0].name} (${formatFileSize(STATE.cvtFiles[0].size)})`;
      infoEl.style.display = 'block';
    }
  } else {
    // Multiple files → show list for batch
    if (listEl) {
      listEl.innerHTML = STATE.cvtFiles.map((f, i) =>
        `<div class="cvt-file-item" data-index="${i}">
          <span>${f.name} (${formatFileSize(f.size)})</span>
          <button class="btn-icon" onclick="removeCvtFile(${i})" title="Xóa">✕</button>
        </div>`
      ).join('');
      listEl.style.display = 'block';
    }
  }

  document.getElementById('cvtBtnProcess')?.removeAttribute('disabled');
  updateCvtBadge();
}

/**
 * Xóa 1 file khỏi batch
 */
function removeCvtFile(index) {
  STATE.cvtFiles.splice(index, 1);
  if (STATE.cvtFiles.length) {
    handleCvtFiles(STATE.cvtFiles);
  } else {
    clearCvt();
  }
}

/**
 * Bật/tắt batch mode
 */
function toggleBatchMode() {
  STATE.cvtBatchMode = !STATE.cvtBatchMode;
  const btn = document.getElementById('cvtBtnBatch');
  if (btn) btn.classList.toggle('active', STATE.cvtBatchMode);
  showToast(STATE.cvtBatchMode ? 'Chế độ Batch đã bật.' : 'Chế độ Batch đã tắt.', 'info');
}

/**
 * Cập nhật badge số file
 */
function updateCvtBadge() {
  const badge = document.getElementById('cvtBadge');
  if (badge) {
    badge.textContent = STATE.cvtFiles?.length || 0;
    badge.style.display = STATE.cvtFiles?.length ? 'inline-flex' : 'none';
  }
}

/**
 * UNIFIED processCvt() — T-F4: Một hàm duy nhất, không duplicate
 * Kiểm tra batch mode → nếu có chạy processBatch(), nếu không chạy single-file
 */
async function processCvt() {
  if (!STATE.cvtFiles?.length) {
    showToast('Chưa chọn file.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  // Check batch mode or multiple files
  if (STATE.cvtBatchMode || STATE.cvtFiles.length > 1) {
    await processCvtBatch();
  } else {
    await processCvtSingle(STATE.cvtFiles[0]);
  }
}

/**
 * Xử lý single file convert
 */
async function processCvtSingle(file) {
  const action = document.getElementById('cvtAction')?.value || 'summarize';
  const language = document.getElementById('cvtLanguage')?.value || 'vi';
  const progress = document.getElementById('cvtProgress');
  const resultArea = document.getElementById('cvtResult');

  showProgress(progress, 20, 'Đang đọc file...');
  document.getElementById('cvtBtnProcess').disabled = true;

  try {
    const base64 = await fileToBase64(file);
    showProgress(progress, 50, 'Đang xử lý với AI...');

    const prompt = buildCvtPrompt(action, language, file.name);
    const mimeType = file.type || guessMimeType(file.name);

    const result = await callGemini(prompt, [{
      inlineData: { mimeType, data: base64 }
    }]);

    showProgress(progress, 100, 'Hoàn tất!');
    if (resultArea) {
      resultArea.innerHTML = md2html(result);
      resultArea.style.display = 'block';
    }
    STATE.cvtResult = result;

    document.getElementById('cvtBtnCopy')?.removeAttribute('disabled');
    document.getElementById('cvtBtnExport')?.removeAttribute('disabled');
    showToast('Xử lý file thành công!', 'success');

  } catch (err) {
    console.error('Convert error:', err);
    showToast('Lỗi xử lý file: ' + err.message, 'error');
    showProgress(progress, 0);
  } finally {
    document.getElementById('cvtBtnProcess').disabled = false;
  }
}

/**
 * Xử lý batch convert — nhiều file liên tiếp
 */
async function processCvtBatch() {
  const action = document.getElementById('cvtAction')?.value || 'summarize';
  const language = document.getElementById('cvtLanguage')?.value || 'vi';
  const progress = document.getElementById('cvtProgress');
  const resultArea = document.getElementById('cvtResult');
  const total = STATE.cvtFiles.length;

  document.getElementById('cvtBtnProcess').disabled = true;
  let allResults = [];

  for (let i = 0; i < total; i++) {
    const file = STATE.cvtFiles[i];
    showProgress(progress, Math.round(((i) / total) * 100),
      `Đang xử lý ${i + 1}/${total}: ${file.name}...`);

    try {
      const base64 = await fileToBase64(file);
      const prompt = buildCvtPrompt(action, language, file.name);
      const mimeType = file.type || guessMimeType(file.name);

      const result = await callGemini(prompt, [{
        inlineData: { mimeType, data: base64 }
      }]);

      allResults.push({ file: file.name, result, success: true });
    } catch (err) {
      allResults.push({ file: file.name, result: 'Lỗi: ' + err.message, success: false });
    }

    // Small delay between files to avoid rate limiting
    if (i < total - 1) await sleep(500);
  }

  showProgress(progress, 100, 'Hoàn tất batch!');

  // Render all results
  const html = allResults.map((r, i) =>
    `<div class="cvt-batch-result ${r.success ? '' : 'error'}">
      <h4>${i + 1}. ${escapeHtml(r.file)} ${r.success ? '✅' : '❌'}</h4>
      <div class="cvt-batch-content">${r.success ? md2html(r.result) : escapeHtml(r.result)}</div>
    </div>`
  ).join('<hr>');

  if (resultArea) {
    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
  }

  STATE.cvtResult = allResults.map(r => `## ${r.file}\n\n${r.result}`).join('\n\n---\n\n');
  document.getElementById('cvtBtnProcess').disabled = false;
  document.getElementById('cvtBtnCopy')?.removeAttribute('disabled');
  document.getElementById('cvtBtnExport')?.removeAttribute('disabled');

  const successCount = allResults.filter(r => r.success).length;
  showToast(`Batch hoàn tất: ${successCount}/${total} thành công.`, successCount === total ? 'success' : 'warning');
}

/**
 * Xây dựng prompt cho Convert
 */
function buildCvtPrompt(action, language, fileName) {
  const langText = language === 'vi' ? 'Tiếng Việt' :
                   language === 'en' ? 'English' :
                   language === 'ja' ? '日本語' : 'ngôn ngữ gốc';

  const prompts = {
    summarize: `Hãy tóm tắt chi tiết nội dung file "${fileName}" bằng ${langText}. Giữ các điểm chính, số liệu quan trọng, kết luận.`,
    extract: `Hãy trích xuất toàn bộ nội dung văn bản từ file "${fileName}" bằng ${langText}. Giữ nguyên cấu trúc, heading, danh sách.`,
    translate: `Hãy dịch toàn bộ nội dung file "${fileName}" sang ${langText}. Dịch chính xác, tự nhiên.`,
    analyze: `Hãy phân tích chi tiết file "${fileName}" bằng ${langText}: chủ đề chính, luận điểm, dẫn chứng, điểm mạnh/yếu, kết luận.`,
    qa: `Từ nội dung file "${fileName}", hãy tạo 20 câu hỏi & đáp bằng ${langText} bao quát nội dung quan trọng.`,
    outline: `Hãy tạo dàn ý chi tiết (outline) nội dung file "${fileName}" bằng ${langText}. Dùng heading nhiều cấp.`,
    keypoints: `Hãy liệt kê tất cả các ý chính (key points) từ file "${fileName}" bằng ${langText}. Mỗi ý 1-2 câu.`,
    ocr: `Hãy nhận diện và trích xuất toàn bộ văn bản từ hình ảnh/scan trong file "${fileName}" bằng ${langText}. Giữ nguyên layout.`
  };

  return prompts[action] || prompts.summarize;
}

/**
 * Đoán MIME type từ extension
 */
function guessMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
    mp4: 'video/mp4', webm: 'video/webm', txt: 'text/plain',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv', json: 'application/json', md: 'text/markdown',
    html: 'text/html', xml: 'text/xml'
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Xóa Convert
 */
function clearCvt() {
  STATE.cvtFiles = [];
  STATE.cvtResult = '';
  STATE.cvtBatchMode = false;
  const resultArea = document.getElementById('cvtResult');
  if (resultArea) { resultArea.innerHTML = ''; resultArea.style.display = 'none'; }
  document.getElementById('cvtFileInfo')?.setAttribute('style', 'display:none');
  document.getElementById('cvtFileList')?.setAttribute('style', 'display:none');
  showProgress(document.getElementById('cvtProgress'), 0);
  const cvtFileInput = document.getElementById('cvtFileInput');
  if (cvtFileInput) cvtFileInput.value = '';
  document.getElementById('cvtBtnProcess')?.setAttribute('disabled', '');
  document.getElementById('cvtBtnCopy')?.setAttribute('disabled', '');
  document.getElementById('cvtBtnExport')?.setAttribute('disabled', '');
  document.getElementById('cvtBtnBatch')?.classList.remove('active');
  updateCvtBadge();
  showToast('Đã xóa.', 'info');
}

/**
 * Sleep helper
 */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }


// ==============================================================
// SECTION 26: QUICK ACTIONS (Notebook Tab)
// Summary, Key Points, FAQ, Timeline, Mind Map, Questions
// ==============================================================

/**
 * Xử lý Quick Actions
 */
async function handleQuickAction(action) {
  if (!STATE.sources.length) {
    showToast('Chưa có nguồn tài liệu. Hãy thêm nguồn trước.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const sourceTexts = STATE.sources.map((s, i) => `[Nguồn ${i + 1}: ${s.name}]\n${s.text || s.content || ''}`).join('\n\n---\n\n');

  const prompts = {
    summary: `Dựa trên các tài liệu nguồn sau, hãy tạo BẢN TÓM TẮT CHI TIẾT:
- Tổng quan chung
- Các điểm chính của từng nguồn
- Mối liên hệ giữa các nguồn
- Kết luận tổng hợp

Tài liệu:\n${sourceTexts}`,

    keypoints: `Dựa trên các tài liệu nguồn sau, hãy liệt kê TẤT CẢ CÁC Ý CHÍNH (Key Points):
- Mỗi ý 1-2 câu, rõ ràng
- Ghi chú nguồn tham chiếu [Nguồn X]
- Sắp xếp theo mức độ quan trọng

Tài liệu:\n${sourceTexts}`,

    faq: `Dựa trên các tài liệu nguồn sau, hãy tạo danh sách FAQ (20 câu hỏi thường gặp):
Mỗi câu gồm:
**Q:** Câu hỏi
**A:** Câu trả lời chi tiết kèm tham chiếu [Nguồn X]

Tài liệu:\n${sourceTexts}`,

    timeline: `Dựa trên các tài liệu nguồn sau, hãy tạo TIMELINE (dòng thời gian):
- Sắp xếp theo thứ tự thời gian
- Mỗi mốc gồm: ngày/thời điểm, sự kiện, chi tiết
- Nếu không có timeline rõ ràng, tạo timeline logic của nội dung

Tài liệu:\n${sourceTexts}`,

    mindmap: `Dựa trên các tài liệu nguồn sau, hãy tạo MIND MAP dạng cấu trúc text:

# Chủ đề chính
## Nhánh 1
### Nhánh con 1.1
### Nhánh con 1.2
## Nhánh 2
### Nhánh con 2.1

(Tối đa 4 cấp độ, bao quát toàn bộ nội dung quan trọng)

Tài liệu:\n${sourceTexts}`,

    questions: `Dựa trên các tài liệu nguồn sau, hãy tạo 15 CÂU HỎI KHÁM PHÁ SÂU:
- 5 câu cơ bản (hiểu biết)
- 5 câu nâng cao (phân tích)
- 5 câu tư duy phản biện
Mỗi câu kèm gợi ý ngắn về hướng trả lời.

Tài liệu:\n${sourceTexts}`
  };

  const prompt = prompts[action];
  if (!prompt) return;

  // Add as user message
  addChatMessage('user', `🔍 ${getActionLabel(action)}`);
  addTypingIndicator();

  try {
    const result = await callGeminiStream(prompt, [], (chunk) => {
      updateStreamingMessage(chunk);
    });

    removeTypingIndicator();
    addChatMessage('ai', result);

    // If mindmap → offer visual render
    if (action === 'mindmap') {
      setTimeout(() => offerMindmapVisualization(result), 500);
    }

  } catch (err) {
    removeTypingIndicator();
    addChatMessage('ai', `❌ Lỗi: ${err.message}`);
  }
}

/**
 * Nhãn cho Quick Action
 */
function getActionLabel(action) {
  const labels = {
    summary: 'Tóm tắt tổng hợp',
    keypoints: 'Các ý chính',
    faq: 'Câu hỏi thường gặp (FAQ)',
    timeline: 'Dòng thời gian (Timeline)',
    mindmap: 'Sơ đồ tư duy (Mind Map)',
    questions: 'Câu hỏi khám phá'
  };
  return labels[action] || action;
}

/**
 * Đề xuất render mindmap visual (T-N1)
 */
function offerMindmapVisualization(mdText) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-accent btn-sm';
  btn.innerHTML = '🗺️ Xem Mind Map trực quan';
  btn.onclick = () => renderVisualMindmap(mdText);

  const lastMsg = document.querySelector('.chat-messages .message-bubble:last-child');
  if (lastMsg) lastMsg.appendChild(btn);
}


// ==============================================================
// SECTION 27: VISUAL MIND MAP — SVG RENDERING (T-N1)
// ==============================================================

/**
 * Render mind map trực quan từ Markdown heading structure
 */
function renderVisualMindmap(mdText) {
  const overlay = document.getElementById('mindmapOverlay');
  const container = document.getElementById('mindmapContainer');
  if (!overlay || !container) return;

  // Parse markdown headings into tree
  const tree = parseMdToTree(mdText);
  if (!tree.children.length) {
    showToast('Không thể phân tích cấu trúc mind map.', 'warning');
    return;
  }

  // Clear and render
  container.innerHTML = '';
  const svg = createMindmapSVG(tree, container.clientWidth || 800, container.clientHeight || 600);
  container.appendChild(svg);

  openOverlay('mindmapOverlay');

  // Setup zoom/pan
  initMindmapZoomPan(svg);
}

/**
 * Parse Markdown headings thành tree
 */
function parseMdToTree(md) {
  const lines = md.split('\n').filter(l => l.trim().startsWith('#'));
  const root = { text: 'Chủ đề', level: 0, children: [] };
  const stack = [root];

  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (!match) return;
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, '').trim();
    const node = { text, level, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });

  return root;
}

/**
 * Tạo SVG mind map
 */
function createMindmapSVG(tree, width, height) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.classList.add('mindmap-svg');

  const colors = [
    'var(--clr-primary)', 'var(--clr-accent)', 'var(--clr-success)',
    '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c', '#3498db'
  ];

  // Calculate layout
  const centerX = width / 2;
  const centerY = height / 2;

  // Draw root node
  drawNode(svg, svgNS, centerX, centerY, tree.text || 'Root', 0, colors[0], true);

  // Draw children in radial layout
  const childCount = tree.children.length;
  if (childCount === 0) return svg;

  const radius1 = Math.min(width, height) * 0.3;

  tree.children.forEach((child, i) => {
    const angle = (2 * Math.PI * i / childCount) - Math.PI / 2;
    const x = centerX + radius1 * Math.cos(angle);
    const y = centerY + radius1 * Math.sin(angle);
    const color = colors[(i + 1) % colors.length];

    // Draw line from root
    drawLine(svg, svgNS, centerX, centerY, x, y, color);
    drawNode(svg, svgNS, x, y, child.text, 1, color, false);

    // Draw grandchildren
    if (child.children.length) {
      const radius2 = Math.min(width, height) * 0.15;
      const subCount = child.children.length;
      const spreadAngle = Math.PI * 0.6;
      const startAngle = angle - spreadAngle / 2;

      child.children.forEach((gc, j) => {
        const subAngle = subCount > 1
          ? startAngle + (spreadAngle * j / (subCount - 1))
          : angle;
        const gx = x + radius2 * Math.cos(subAngle);
        const gy = y + radius2 * Math.sin(subAngle);

        drawLine(svg, svgNS, x, y, gx, gy, color, true);
        drawNode(svg, svgNS, gx, gy, gc.text, 2, color, false);

        // Level 3 children (small labels)
        if (gc.children.length) {
          const radius3 = Math.min(width, height) * 0.08;
          gc.children.forEach((l3, k) => {
            const l3Angle = subAngle + (k - gc.children.length / 2) * 0.3;
            const lx = gx + radius3 * Math.cos(l3Angle);
            const ly = gy + radius3 * Math.sin(l3Angle);
            drawLine(svg, svgNS, gx, gy, lx, ly, color, true);
            drawNode(svg, svgNS, lx, ly, l3.text, 3, color, false);
          });
        }
      });
    }
  });

  return svg;
}

function drawNode(svg, ns, x, y, text, level, color, isRoot) {
  const g = document.createElementNS(ns, 'g');
  g.classList.add('mindmap-node');
  g.setAttribute('data-level', level);

  const fontSize = isRoot ? 16 : level === 1 ? 13 : level === 2 ? 11 : 10;
  const padding = isRoot ? 20 : level === 1 ? 14 : 10;
  const maxWidth = isRoot ? 160 : level === 1 ? 130 : 110;

  // Truncate text
  const displayText = text.length > 30 ? text.substring(0, 28) + '...' : text;

  // Background rect
  const textWidth = Math.min(displayText.length * fontSize * 0.55, maxWidth);
  const rectW = textWidth + padding * 2;
  const rectH = fontSize + padding * 1.5;

  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', x - rectW / 2);
  rect.setAttribute('y', y - rectH / 2);
  rect.setAttribute('width', rectW);
  rect.setAttribute('height', rectH);
  rect.setAttribute('rx', isRoot ? rectH / 2 : 8);
  rect.setAttribute('fill', isRoot ? color : 'white');
  rect.setAttribute('stroke', color);
  rect.setAttribute('stroke-width', isRoot ? 3 : 2);
  if (!isRoot) rect.setAttribute('fill-opacity', '0.95');
  g.appendChild(rect);

  // Text
  const textEl = document.createElementNS(ns, 'text');
  textEl.setAttribute('x', x);
  textEl.setAttribute('y', y + fontSize * 0.35);
  textEl.setAttribute('text-anchor', 'middle');
  textEl.setAttribute('font-size', fontSize);
  textEl.setAttribute('fill', isRoot ? 'white' : '#333');
  textEl.setAttribute('font-weight', isRoot || level === 1 ? 'bold' : 'normal');
  textEl.textContent = displayText;
  g.appendChild(textEl);

  // Tooltip for full text
  const title = document.createElementNS(ns, 'title');
  title.textContent = text;
  g.appendChild(title);

  // Click to toggle children visibility (collapse/expand)
  g.style.cursor = 'pointer';
  g.addEventListener('click', (e) => {
    e.stopPropagation();
    showToast(text, 'info');
  });

  svg.appendChild(g);
}

function drawLine(svg, ns, x1, y1, x2, y2, color, thin = false) {
  const line = document.createElementNS(ns, 'path');
  // Curved line
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const ctrlX = midX + (y2 - y1) * 0.1;
  const ctrlY = midY - (x2 - x1) * 0.1;

  line.setAttribute('d', `M${x1},${y1} Q${ctrlX},${ctrlY} ${x2},${y2}`);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', thin ? 1.5 : 2.5);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke-opacity', thin ? 0.5 : 0.7);
  svg.insertBefore(line, svg.firstChild); // Lines behind nodes
}

/**
 * Zoom/Pan for mindmap
 */
function initMindmapZoomPan(svg) {
  let scale = 1, panX = 0, panY = 0, isDragging = false, startX, startY;

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.3, Math.min(3, scale * delta));
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  });

  svg.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    svg.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
  });

  // Export PNG button
  document.getElementById('mindmapExportPng')?.addEventListener('click', () => exportMindmapPNG(svg));
}

/**
 * Export mindmap SVG to PNG
 */
function exportMindmapPNG(svg) {
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      downloadBlob(blob, 'mindmap.png');
      showToast('Đã xuất Mind Map PNG!', 'success');
    });
  };

  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
}


// ==============================================================
// SECTION 28: FLASHCARD GENERATOR (T-F3 — Slider up to 50)
// ==============================================================

/**
 * Khởi tạo Flashcard
 */
function initFlashcard() {
  document.getElementById('flashcardBtnGenerate')?.addEventListener('click', generateFlashcards);
  document.getElementById('flashcardBtnPrev')?.addEventListener('click', prevFlashcard);
  document.getElementById('flashcardBtnNext')?.addEventListener('click', nextFlashcard);
  document.getElementById('flashcardBtnFlip')?.addEventListener('click', flipFlashcard);
  document.getElementById('flashcardBtnShuffle')?.addEventListener('click', shuffleFlashcards);
  document.getElementById('flashcardBtnExport')?.addEventListener('click', exportFlashcards);

  // Slider for count (T-F3)
  const slider = document.getElementById('flashcardCount');
  const display = document.getElementById('flashcardCountVal');
  if (slider && display) {
    slider.min = 5;
    slider.max = 50;
    slider.value = 20;
    display.textContent = '20';
    slider.addEventListener('input', () => { display.textContent = slider.value; });
  }

  // Filter learned/unlearned
  document.getElementById('flashcardFilterLearned')?.addEventListener('change', filterFlashcards);
}

/**
 * Tạo Flashcard bằng AI
 */
async function generateFlashcards() {
  if (!STATE.sources.length) {
    showToast('Cần thêm nguồn tài liệu trước.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const count = parseInt(document.getElementById('flashcardCount')?.value || '20');
  const progress = document.getElementById('flashcardProgress');
  showProgress(progress, 30, 'Đang tạo flashcard...');

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}: ${s.name}]\n${(s.text || s.content || '').substring(0, 3000)}`
  ).join('\n\n');

  const prompt = `Từ các tài liệu nguồn sau, hãy tạo CHÍNH XÁC ${count} thẻ flashcard học tập.

Trả về dạng JSON array:
[
  {"front": "Câu hỏi / Thuật ngữ", "back": "Đáp án / Giải thích chi tiết", "difficulty": "easy|medium|hard"},
  ...
]

Yêu cầu:
- Đa dạng: có thuật ngữ, câu hỏi hiểu biết, câu hỏi ứng dụng
- Phân bố độ khó: 30% easy, 50% medium, 20% hard
- Mặt sau (back) giải thích đầy đủ, không quá ngắn
- Tham chiếu nguồn khi cần

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT THỪA.

Tài liệu:\n${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    showProgress(progress, 80, 'Đang xử lý...');

    // Parse JSON
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Không thể parse flashcard JSON');

    const cards = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(cards) || cards.length === 0) throw new Error('Flashcard rỗng');

    // Add metadata
    STATE.flashcards = cards.map((c, i) => ({
      ...c,
      id: i,
      learned: false,
      flipped: false
    }));
    STATE.flashcardIndex = 0;
    STATE.flashcardFiltered = [...STATE.flashcards];

    showProgress(progress, 100, `Đã tạo ${cards.length} flashcard!`);
    renderFlashcard();
    openOverlay('flashcardOverlay');
    showToast(`Đã tạo ${cards.length} flashcard!`, 'success');

  } catch (err) {
    console.error('Flashcard error:', err);
    showToast('Lỗi tạo flashcard: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Render flashcard hiện tại
 */
function renderFlashcard() {
  const cards = STATE.flashcardFiltered || STATE.flashcards;
  if (!cards?.length) return;

  const idx = STATE.flashcardIndex;
  const card = cards[idx];
  if (!card) return;

  const frontEl = document.getElementById('flashcardFront');
  const backEl = document.getElementById('flashcardBack');
  const counterEl = document.getElementById('flashcardCounter');
  const diffEl = document.getElementById('flashcardDifficulty');
  const learnedBtn = document.getElementById('flashcardBtnLearned');
  const cardEl = document.getElementById('flashcardCard');

  if (frontEl) frontEl.innerHTML = md2html(card.front);
  if (backEl) backEl.innerHTML = md2html(card.back);
  if (counterEl) counterEl.textContent = `${idx + 1} / ${cards.length}`;
  if (diffEl) {
    const diffLabels = { easy: '🟢 Dễ', medium: '🟡 Trung bình', hard: '🔴 Khó' };
    diffEl.textContent = diffLabels[card.difficulty] || '🟡';
  }
  if (learnedBtn) {
    learnedBtn.textContent = card.learned ? '✅ Đã thuộc' : '☐ Đánh dấu thuộc';
    learnedBtn.classList.toggle('active', card.learned);
  }

  // Reset flip
  if (cardEl) cardEl.classList.remove('flipped');

  // Update progress bar
  const learnedCount = STATE.flashcards.filter(c => c.learned).length;
  const progressEl = document.getElementById('flashcardLearnedProgress');
  if (progressEl) {
    const pct = Math.round((learnedCount / STATE.flashcards.length) * 100);
    progressEl.style.width = pct + '%';
    progressEl.textContent = `${learnedCount}/${STATE.flashcards.length} đã thuộc`;
  }
}

function prevFlashcard() {
  const cards = STATE.flashcardFiltered || STATE.flashcards;
  if (!cards?.length) return;
  STATE.flashcardIndex = (STATE.flashcardIndex - 1 + cards.length) % cards.length;
  renderFlashcard();
}

function nextFlashcard() {
  const cards = STATE.flashcardFiltered || STATE.flashcards;
  if (!cards?.length) return;
  STATE.flashcardIndex = (STATE.flashcardIndex + 1) % cards.length;
  renderFlashcard();
}

function flipFlashcard() {
  const cardEl = document.getElementById('flashcardCard');
  if (cardEl) cardEl.classList.toggle('flipped');
}

function shuffleFlashcards() {
  const cards = STATE.flashcardFiltered || STATE.flashcards;
  if (!cards?.length) return;
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  STATE.flashcardIndex = 0;
  renderFlashcard();
  showToast('Đã xáo trộn flashcard!', 'info');
}

function toggleFlashcardLearned() {
  const cards = STATE.flashcardFiltered || STATE.flashcards;
  const card = cards?.[STATE.flashcardIndex];
  if (!card) return;
  card.learned = !card.learned;
  // Also update in main array
  const mainCard = STATE.flashcards.find(c => c.id === card.id);
  if (mainCard) mainCard.learned = card.learned;
  renderFlashcard();
}

function filterFlashcards() {
  const filter = document.getElementById('flashcardFilterLearned')?.value || 'all';
  if (filter === 'learned') {
    STATE.flashcardFiltered = STATE.flashcards.filter(c => c.learned);
  } else if (filter === 'unlearned') {
    STATE.flashcardFiltered = STATE.flashcards.filter(c => !c.learned);
  } else {
    STATE.flashcardFiltered = [...STATE.flashcards];
  }
  STATE.flashcardIndex = 0;
  if (!STATE.flashcardFiltered.length) {
    showToast('Không có thẻ nào phù hợp.', 'info');
  }
  renderFlashcard();
}

/**
 * Export flashcards
 */
function exportFlashcards() {
  if (!STATE.flashcards?.length) {
    showToast('Chưa có flashcard.', 'warning');
    return;
  }
  const format = document.getElementById('flashcardExportFormat')?.value || 'json';

  if (format === 'csv') {
    const csv = 'Front,Back,Difficulty,Learned\n' +
      STATE.flashcards.map(c =>
        `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}","${c.difficulty}","${c.learned}"`
      ).join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'flashcards.csv');
  } else {
    const json = JSON.stringify(STATE.flashcards, null, 2);
    downloadBlob(new Blob([json], { type: 'application/json' }), 'flashcards.json');
  }
  showToast('Đã xuất flashcard!', 'success');
}


// ==============================================================
// SECTION 29: QUIZ GENERATOR WITH SCORING (T-AI3)
// ==============================================================

/**
 * Tạo quiz từ tài liệu
 */
async function generateQuiz() {
  if (!STATE.sources.length) {
    showToast('Cần thêm nguồn tài liệu.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const count = parseInt(document.getElementById('quizCount')?.value || '10');
  const progress = document.getElementById('quizProgress');
  showProgress(progress, 30, 'Đang tạo bài kiểm tra...');

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}]\n${(s.text || s.content || '').substring(0, 3000)}`
  ).join('\n\n');

  const prompt = `Từ tài liệu sau, hãy tạo ${count} câu hỏi trắc nghiệm.

Trả về JSON array:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct": 0,
    "explanation": "Giải thích đáp án đúng và tham chiếu nguồn"
  }
]

Yêu cầu: đa dạng mức độ, đáp án giải thích rõ. CHỈ TRẢ VỀ JSON.

Tài liệu:\n${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Không thể parse quiz JSON');

    STATE.quizQuestions = JSON.parse(jsonMatch[0]);
    STATE.quizAnswers = new Array(STATE.quizQuestions.length).fill(-1);
    STATE.quizSubmitted = false;

    showProgress(progress, 100, `Đã tạo ${STATE.quizQuestions.length} câu hỏi!`);
    renderQuiz();
    openOverlay('quizOverlay');
    showToast('Bài kiểm tra đã sẵn sàng!', 'success');

  } catch (err) {
    console.error('Quiz error:', err);
    showToast('Lỗi tạo quiz: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Render quiz UI
 */
function renderQuiz() {
  const container = document.getElementById('quizContainer');
  if (!container || !STATE.quizQuestions?.length) return;

  container.innerHTML = STATE.quizQuestions.map((q, i) => `
    <div class="quiz-question" data-index="${i}">
      <h4>Câu ${i + 1}: ${escapeHtml(q.question)}</h4>
      <div class="quiz-options">
        ${q.options.map((opt, j) => `
          <label class="quiz-option ${STATE.quizSubmitted ? (j === q.correct ? 'correct' : (STATE.quizAnswers[i] === j ? 'wrong' : '')) : ''}"
                 ${STATE.quizSubmitted ? '' : `onclick="selectQuizAnswer(${i}, ${j})"`}>
            <input type="radio" name="quiz-${i}" value="${j}"
                   ${STATE.quizAnswers[i] === j ? 'checked' : ''}
                   ${STATE.quizSubmitted ? 'disabled' : ''}>
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
      ${STATE.quizSubmitted ? `<div class="quiz-explanation">
        <strong>${STATE.quizAnswers[i] === q.correct ? '✅ Đúng!' : '❌ Sai!'}</strong>
        <p>${escapeHtml(q.explanation)}</p>
      </div>` : ''}
    </div>
  `).join('');

  // Score display
  if (STATE.quizSubmitted) {
    const score = STATE.quizAnswers.reduce((acc, ans, i) =>
      acc + (ans === STATE.quizQuestions[i].correct ? 1 : 0), 0);
    const total = STATE.quizQuestions.length;
    const pct = Math.round((score / total) * 100);

    const scoreHtml = `
      <div class="quiz-score">
        <h3>Kết quả: ${score}/${total} (${pct}%)</h3>
        <div class="quiz-score-bar">
          <div class="quiz-score-fill" style="width:${pct}%;background:${pct >= 70 ? 'var(--clr-success)' : pct >= 50 ? 'var(--clr-accent)' : 'var(--clr-danger)'}"></div>
        </div>
        <p>${pct >= 90 ? '🌟 Xuất sắc!' : pct >= 70 ? '👍 Tốt lắm!' : pct >= 50 ? '📚 Cần ôn thêm.' : '💪 Hãy cố gắng hơn!'}</p>
      </div>`;
    container.insertAdjacentHTML('afterbegin', scoreHtml);
  }

  // Submit / Reset buttons
  const btnArea = document.getElementById('quizActions');
  if (btnArea) {
    btnArea.innerHTML = STATE.quizSubmitted
      ? `<button class="btn btn-primary" onclick="resetQuiz()">🔄 Làm lại</button>
         <button class="btn btn-accent" onclick="generateQuiz()">📝 Tạo quiz mới</button>`
      : `<button class="btn btn-primary" onclick="submitQuiz()">✅ Nộp bài</button>`;
  }
}

function selectQuizAnswer(qIndex, optIndex) {
  if (STATE.quizSubmitted) return;
  STATE.quizAnswers[qIndex] = optIndex;

  // Update radio visually
  const options = document.querySelectorAll(`[name="quiz-${qIndex}"]`);
  options.forEach((opt, i) => {
    opt.checked = (i === optIndex);
    opt.closest('.quiz-option')?.classList.toggle('selected', i === optIndex);
  });
}

function submitQuiz() {
  const unanswered = STATE.quizAnswers.filter(a => a === -1).length;
  if (unanswered > 0) {
    if (!confirm(`Bạn chưa trả lời ${unanswered} câu. Vẫn nộp bài?`)) return;
  }
  STATE.quizSubmitted = true;
  renderQuiz();

  const score = STATE.quizAnswers.reduce((acc, ans, i) =>
    acc + (ans === STATE.quizQuestions[i].correct ? 1 : 0), 0);
  showToast(`Điểm: ${score}/${STATE.quizQuestions.length}`, 'info');
}

function resetQuiz() {
  STATE.quizAnswers = new Array(STATE.quizQuestions.length).fill(-1);
  STATE.quizSubmitted = false;
  renderQuiz();
}


// ==============================================================
// SECTION 30: GLOSSARY BUILDER (T-AI4)
// ==============================================================

/**
 * Tạo glossary từ tài liệu
 */
async function generateGlossary() {
  if (!STATE.sources.length) {
    showToast('Cần thêm nguồn tài liệu.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const progress = document.getElementById('glossaryProgress');
  showProgress(progress, 30, 'Đang trích xuất thuật ngữ...');

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}]\n${(s.text || s.content || '').substring(0, 4000)}`
  ).join('\n\n');

  const prompt = `Từ tài liệu sau, hãy trích xuất và định nghĩa TẤT CẢ thuật ngữ chuyên ngành, khái niệm quan trọng.

Trả về JSON array:
[
  {
    "term": "Thuật ngữ",
    "definition": "Định nghĩa đầy đủ, dễ hiểu",
    "category": "Danh mục (VD: Công nghệ, Kinh tế, Y tế...)",
    "source": "Nguồn tham chiếu"
  }
]

Sắp xếp theo bảng chữ cái A-Z. CHỈ TRẢ VỀ JSON.

Tài liệu:\n${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Không thể parse glossary JSON');

    STATE.glossary = JSON.parse(jsonMatch[0]).sort((a, b) =>
      a.term.localeCompare(b.term, 'vi')
    );

    showProgress(progress, 100, `${STATE.glossary.length} thuật ngữ!`);
    renderGlossary();
    openOverlay('glossaryOverlay');
    showToast(`Đã tạo bảng thuật ngữ (${STATE.glossary.length} mục)!`, 'success');

  } catch (err) {
    console.error('Glossary error:', err);
    showToast('Lỗi tạo glossary: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Render glossary table
 */
function renderGlossary(filter = '') {
  const container = document.getElementById('glossaryContainer');
  if (!container || !STATE.glossary?.length) return;

  const filtered = filter
    ? STATE.glossary.filter(g =>
        g.term.toLowerCase().includes(filter.toLowerCase()) ||
        g.definition.toLowerCase().includes(filter.toLowerCase())
      )
    : STATE.glossary;

  // Group by first letter
  const groups = {};
  filtered.forEach(g => {
    const letter = g.term.charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(g);
  });

  let html = '<div class="glossary-list">';
  Object.keys(groups).sort().forEach(letter => {
    html += `<div class="glossary-group">
      <h3 class="glossary-letter">${letter}</h3>`;
    groups[letter].forEach(g => {
      html += `<div class="glossary-item">
        <dt class="glossary-term">${escapeHtml(g.term)}</dt>
        <dd class="glossary-def">${escapeHtml(g.definition)}</dd>
        <small class="glossary-meta">${escapeHtml(g.category || '')} ${g.source ? `· ${escapeHtml(g.source)}` : ''}</small>
      </div>`;
    });
    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Tìm kiếm glossary
 */
function searchGlossary() {
  const query = document.getElementById('glossarySearch')?.value || '';
  renderGlossary(query);
}

/**
 * Export glossary
 */
function exportGlossary() {
  if (!STATE.glossary?.length) {
    showToast('Chưa có glossary.', 'warning');
    return;
  }
  const json = JSON.stringify(STATE.glossary, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), 'glossary.json');
  showToast('Đã xuất bảng thuật ngữ!', 'success');
}


// ==============================================================
// SECTION 31: AI PODCAST GENERATION (T-C4)
// ==============================================================

/**
 * Tạo podcast từ tài liệu
 */
async function generatePodcast() {
  if (!STATE.sources.length) {
    showToast('Cần thêm nguồn tài liệu.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const host1 = document.getElementById('podcastHost1')?.value || 'Minh';
  const host2 = document.getElementById('podcastHost2')?.value || 'Lan';
  const duration = document.getElementById('podcastDuration')?.value || 'medium';
  const progress = document.getElementById('podcastProgress');
  const resultArea = document.getElementById('podcastResult');

  showProgress(progress, 10, 'Bước 1/3: Đang tạo kịch bản...');

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}: ${s.name}]\n${(s.text || s.content || '').substring(0, 3000)}`
  ).join('\n\n');

  const wordCount = duration === 'short' ? '500-800' : duration === 'long' ? '1500-2000' : '800-1200';

  try {
    // Step 1: Generate script
    const scriptPrompt = `Bạn là biên kịch podcast chuyên nghiệp. Hãy viết kịch bản podcast dialog giữa 2 nhân vật:
- **${host1}** (Host): Dẫn dắt, đặt câu hỏi, tóm tắt
- **${host2}** (Guest/Expert): Giải thích sâu, đưa ví dụ, phân tích

Độ dài: ${wordCount} từ.

Format CHÍNH XÁC:
[${host1}]: Nội dung lời thoại...
[${host2}]: Nội dung lời thoại...

Yêu cầu:
- Mở đầu tự nhiên, giới thiệu chủ đề
- Thảo luận sâu các điểm chính trong tài liệu
- Có ví dụ thực tế, so sánh dễ hiểu
- Kết thúc với tóm tắt và lời khuyên
- Giọng điệu thân thiện, truyền cảm hứng

Tài liệu:\n${sourceTexts}`;

    const script = await callGemini(scriptPrompt);
    showProgress(progress, 35, 'Kịch bản đã sẵn sàng!');

    if (resultArea) {
      resultArea.innerHTML = `<h4>📝 Kịch bản Podcast</h4>${md2html(script)}`;
      resultArea.style.display = 'block';
    }
    STATE.podcastScript = script;

    // Step 2: Generate audio using Gemini TTS
    showProgress(progress, 40, 'Bước 2/3: Đang tạo giọng nói AI...');

    // Parse dialog lines
    const lines = script.split('\n').filter(l => l.trim());
    const dialogLines = [];
    lines.forEach(line => {
      const match = line.match(/\[([^\]]+)\]:\s*(.+)/);
      if (match) {
        dialogLines.push({
          speaker: match[1].trim(),
          text: match[2].trim()
        });
      }
    });

    if (!dialogLines.length) {
      showProgress(progress, 100, 'Kịch bản đã tạo (không thể tạo audio).');
      showToast('Đã tạo kịch bản podcast! Audio cần Gemini TTS.', 'success');
      return;
    }

    // Assign voices
    const voice1 = document.getElementById('podcastVoice1')?.value || 'Aoede';
    const voice2 = document.getElementById('podcastVoice2')?.value || 'Charon';

    const audioChunks = [];
    for (let i = 0; i < dialogLines.length; i++) {
      const dl = dialogLines[i];
      const voice = dl.speaker === host1 ? voice1 : voice2;

      showProgress(progress, 40 + Math.round((i / dialogLines.length) * 50),
        `Đang tạo audio ${i + 1}/${dialogLines.length}...`);

      try {
        const audioBase64 = await callGeminiTTS(dl.text, voice, '');
        const blob = base64ToBlob(audioBase64, 'audio/wav');
        audioChunks.push(blob);
      } catch (err) {
        console.warn(`Audio chunk ${i} error:`, err);
        // Skip failed chunks
      }

      // Rate limit respect
      await sleep(300);
    }

    if (!audioChunks.length) {
      showProgress(progress, 100, 'Kịch bản đã tạo, audio thất bại.');
      showToast('Kịch bản đã tạo nhưng không thể tạo audio.', 'warning');
      return;
    }

    // Step 3: Merge audio
    showProgress(progress, 95, 'Bước 3/3: Đang ghép audio...');
    const mergedBlob = new Blob(audioChunks, { type: 'audio/wav' });
    STATE.podcastBlob = mergedBlob;

    // Show audio player
    const audioPreview = document.getElementById('podcastAudioPreview');
    if (audioPreview) {
      audioPreview.src = URL.createObjectURL(mergedBlob);
      audioPreview.style.display = 'block';
    }

    document.getElementById('podcastBtnDownload')?.removeAttribute('disabled');
    showProgress(progress, 100, 'Hoàn tất!');
    showToast('Đã tạo podcast hoàn chỉnh!', 'success');

  } catch (err) {
    console.error('Podcast error:', err);
    showToast('Lỗi tạo podcast: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Download podcast audio
 */
function downloadPodcast() {
  if (STATE.podcastBlob) {
    downloadBlob(STATE.podcastBlob, 'podcast.wav');
    showToast('Đã tải podcast!', 'success');
  } else if (STATE.podcastScript) {
    downloadBlob(
      new Blob([STATE.podcastScript], { type: 'text/plain' }),
      'podcast-script.txt'
    );
    showToast('Đã tải kịch bản podcast!', 'success');
  }
}


// ==============================================================
// SECTION 32: SMART SUGGESTED QUESTIONS (T-C5)
// ==============================================================

/**
 * Tạo câu hỏi gợi ý tự động (background, non-blocking)
 */
async function generateSuggestedQuestions() {
  if (!STATE.sources.length || !getActiveKey()) return;

  const container = document.getElementById('suggestedQuestions');
  if (!container) return;

  // Show skeleton
  container.innerHTML = '<div class="skeleton skeleton-text"></div>'.repeat(3);
  container.style.display = 'flex';

  const sourceTexts = STATE.sources.map((s, i) =>
    `${s.name}: ${(s.text || s.content || '').substring(0, 1000)}`
  ).join('\n');

  const prompt = `Dựa trên tài liệu sau, tạo 5-7 câu hỏi khám phá thú vị mà người dùng có thể hỏi.
Mỗi câu hỏi ngắn gọn (< 15 từ), đa dạng (có câu cơ bản, phân tích, so sánh, ứng dụng).
Trả về JSON array: ["câu hỏi 1", "câu hỏi 2", ...]
CHỈ TRẢ VỀ JSON.

Tài liệu:\n${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Parse error');

    const questions = JSON.parse(jsonMatch[0]);

    container.innerHTML = questions.map(q =>
      `<button class="suggested-question-chip" onclick="useSuggestedQuestion(this)" title="${escapeHtml(q)}">${escapeHtml(q)}</button>`
    ).join('') +
    `<button class="suggested-question-chip refresh" onclick="generateSuggestedQuestions()" title="Làm mới">🔄</button>`;

  } catch (err) {
    console.warn('Suggested questions error:', err);
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

/**
 * Dùng câu hỏi gợi ý – điền vào chat
 */
function useSuggestedQuestion(el) {
  const chatInput = document.getElementById('chatInput');
  if (chatInput && el.textContent) {
    chatInput.value = el.textContent;
    chatInput.focus();
    // Optionally auto-send
    // sendChat();
  }
}


// ==============================================================
// SECTION 33: CITATION GENERATOR (T-AI5)
// APA / MLA / Chicago
// ==============================================================

/**
 * Mở citation generator
 */
function openCitationGenerator() {
  openOverlay('citationOverlay');
  renderCitationSources();
}

/**
 * Render nguồn cho citation
 */
function renderCitationSources() {
  const container = document.getElementById('citationSourceList');
  if (!container) return;

  if (!STATE.sources.length) {
    container.innerHTML = '<p class="text-muted">Chưa có nguồn tài liệu.</p>';
    return;
  }

  container.innerHTML = STATE.sources.map((s, i) => `
    <div class="citation-source-item">
      <input type="checkbox" id="citSrc${i}" checked>
      <label for="citSrc${i}">${escapeHtml(s.name)}</label>
      <div class="citation-meta-inputs">
        <input type="text" placeholder="Tác giả" id="citAuthor${i}" value="${escapeHtml(s.author || '')}">
        <input type="text" placeholder="Năm" id="citYear${i}" value="${s.year || new Date().getFullYear()}">
        <input type="text" placeholder="Nhà xuất bản" id="citPublisher${i}" value="${escapeHtml(s.publisher || '')}">
        <input type="text" placeholder="URL" id="citUrl${i}" value="${escapeHtml(s.url || '')}">
      </div>
    </div>
  `).join('');
}

/**
 * Tạo trích dẫn
 */
async function generateCitations() {
  const style = document.getElementById('citationStyle')?.value || 'apa';
  const resultArea = document.getElementById('citationResult');

  // Collect selected sources with metadata
  const selectedSources = [];
  STATE.sources.forEach((s, i) => {
    const checkbox = document.getElementById(`citSrc${i}`);
    if (checkbox?.checked) {
      selectedSources.push({
        title: s.name,
        author: document.getElementById(`citAuthor${i}`)?.value || 'Unknown',
        year: document.getElementById(`citYear${i}`)?.value || new Date().getFullYear(),
        publisher: document.getElementById(`citPublisher${i}`)?.value || '',
        url: document.getElementById(`citUrl${i}`)?.value || ''
      });
    }
  });

  if (!selectedSources.length) {
    showToast('Chọn ít nhất 1 nguồn.', 'warning');
    return;
  }

  if (getActiveKey()) {
    // Use AI for better citations
    const prompt = `Hãy tạo trích dẫn theo chuẩn ${style.toUpperCase()} cho các nguồn sau:

${selectedSources.map((s, i) =>
  `Nguồn ${i + 1}: Title="${s.title}", Author="${s.author}", Year=${s.year}, Publisher="${s.publisher}", URL="${s.url}"`
).join('\n')}

Trả về danh sách trích dẫn hoàn chỉnh, đúng format. Nếu thiếu thông tin, điền [n.d.] hoặc bỏ qua.`;

    try {
      const result = await callGemini(prompt);
      if (resultArea) {
        resultArea.innerHTML = md2html(result);
        resultArea.style.display = 'block';
      }
      STATE.citations = result;
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  } else {
    // Fallback: basic formatting
    const citations = selectedSources.map(s => formatCitationBasic(s, style));
    if (resultArea) {
      resultArea.innerHTML = citations.map(c => `<p>${escapeHtml(c)}</p>`).join('');
      resultArea.style.display = 'block';
    }
    STATE.citations = citations.join('\n');
  }
}

/**
 * Basic citation formatter (fallback without AI)
 */
function formatCitationBasic(source, style) {
  const { author, year, title, publisher, url } = source;

  switch (style) {
    case 'mla':
      return `${author}. "${title}." ${publisher ? publisher + ', ' : ''}${year}. ${url ? 'Web. ' + url : ''}`;
    case 'chicago':
      return `${author}. "${title}." ${publisher || ''}, ${year}. ${url || ''}`;
    case 'apa':
    default:
      return `${author} (${year}). ${title}. ${publisher ? publisher + '. ' : ''}${url ? 'Retrieved from ' + url : ''}`;
  }
}

/**
 * Copy citations
 */
function copyCitations() {
  if (STATE.citations) {
    copyToClipboard(STATE.citations);
  }
}


// ==============================================================
// SECTION 34: SENTIMENT & TONE ANALYZER (T-AI6)
// ==============================================================

/**
 * Phân tích cảm xúc & tone tài liệu
 */
async function analyzeSentiment() {
  if (!STATE.sources.length) {
    showToast('Cần thêm nguồn tài liệu.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const progress = document.getElementById('sentimentProgress');
  const resultArea = document.getElementById('sentimentResult');
  showProgress(progress, 30, 'Đang phân tích...');

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}: ${s.name}]\n${(s.text || s.content || '').substring(0, 3000)}`
  ).join('\n\n');

  const prompt = `Phân tích cảm xúc và tone (giọng điệu) của tài liệu sau. Trả về JSON:
{
  "overall_sentiment": "positive|negative|neutral|mixed",
  "sentiment_score": 0.0-1.0,
  "tone": ["trang trọng", "thân thiện", "học thuật"...],
  "emotions": [
    {"emotion": "tên cảm xúc", "percentage": 30, "color": "#hex"}
  ],
  "key_phrases": {
    "positive": ["cụm từ tích cực 1", ...],
    "negative": ["cụm từ tiêu cực 1", ...],
    "neutral": ["cụm từ trung tính 1", ...]
  },
  "summary": "Tóm tắt phân tích 2-3 câu",
  "word_cloud": [
    {"word": "từ", "weight": 10, "sentiment": "positive|negative|neutral"}
  ]
}

CHỈ TRẢ VỀ JSON.

Tài liệu:\n${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Không thể parse kết quả');

    const analysis = JSON.parse(jsonMatch[0]);
    showProgress(progress, 100, 'Hoàn tất!');
    renderSentimentAnalysis(analysis, resultArea);
    openOverlay('sentimentOverlay');
    showToast('Phân tích hoàn tất!', 'success');

  } catch (err) {
    console.error('Sentiment error:', err);
    showToast('Lỗi phân tích: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}

/**
 * Render kết quả phân tích sentiment
 */
function renderSentimentAnalysis(analysis, container) {
  if (!container) return;

  const sentimentColors = {
    positive: '#27ae60', negative: '#e74c3c', neutral: '#95a5a6', mixed: '#f39c12'
  };
  const sentimentLabels = {
    positive: 'Tích cực', negative: 'Tiêu cực', neutral: 'Trung tính', mixed: 'Hỗn hợp'
  };

  const score = (analysis.sentiment_score || 0.5) * 100;

  let html = `
    <div class="sentiment-overview">
      <div class="sentiment-gauge-container">
        <div class="sentiment-gauge">
          <div class="sentiment-gauge-fill" style="width:${score}%;background:${sentimentColors[analysis.overall_sentiment] || '#999'}"></div>
        </div>
        <div class="sentiment-label">
          <strong>${sentimentLabels[analysis.overall_sentiment] || 'N/A'}</strong>
          <span>${score.toFixed(0)}%</span>
        </div>
      </div>

      <div class="sentiment-tones">
        <h4>Giọng điệu:</h4>
        <div class="tag-list">${(analysis.tone || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>

      <p class="sentiment-summary">${escapeHtml(analysis.summary || '')}</p>
    </div>

    <div class="sentiment-emotions">
      <h4>Phân bố cảm xúc:</h4>
      ${(analysis.emotions || []).map(e => `
        <div class="emotion-bar">
          <span class="emotion-label">${escapeHtml(e.emotion)}</span>
          <div class="emotion-bar-track">
            <div class="emotion-bar-fill" style="width:${e.percentage}%;background:${e.color || '#3498db'}"></div>
          </div>
          <span class="emotion-pct">${e.percentage}%</span>
        </div>
      `).join('')}
    </div>

    <div class="sentiment-phrases">
      <h4>Cụm từ nổi bật:</h4>
      <div class="phrase-group positive">
        <h5>😊 Tích cực</h5>
        ${(analysis.key_phrases?.positive || []).map(p => `<span class="phrase-tag positive">${escapeHtml(p)}</span>`).join('')}
      </div>
      <div class="phrase-group negative">
        <h5>😞 Tiêu cực</h5>
        ${(analysis.key_phrases?.negative || []).map(p => `<span class="phrase-tag negative">${escapeHtml(p)}</span>`).join('')}
      </div>
      <div class="phrase-group neutral">
        <h5>😐 Trung tính</h5>
        ${(analysis.key_phrases?.neutral || []).map(p => `<span class="phrase-tag neutral">${escapeHtml(p)}</span>`).join('')}
      </div>
    </div>`;

  // Word cloud (simple CSS version)
  if (analysis.word_cloud?.length) {
    html += `<div class="sentiment-wordcloud"><h4>Word Cloud:</h4><div class="wordcloud-container">`;
    analysis.word_cloud.forEach(w => {
      const size = Math.max(12, Math.min(36, 12 + w.weight * 2));
      const color = sentimentColors[w.sentiment] || '#666';
      html += `<span class="wordcloud-word" style="font-size:${size}px;color:${color}">${escapeHtml(w.word)}</span> `;
    });
    html += `</div></div>`;
  }

  container.innerHTML = html;
  container.style.display = 'block';
}


// ==============================================================
// SECTION 35: AI WRITING ASSISTANT (T-N6)
// ==============================================================

/**
 * Khởi tạo Writing Assistant
 */
function initWritingAssistant() {
  // Listen for text selection in chat messages
  document.querySelector('.chat-messages')?.addEventListener('mouseup', handleTextSelection);
}

/**
 * Xử lý text selection trong chat
 */
function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection?.toString()?.trim();
  const popup = document.getElementById('writingAssistantPopup');

  if (!selectedText || selectedText.length < 5 || !popup) {
    if (popup) popup.style.display = 'none';
    return;
  }

  STATE.selectedText = selectedText;

  // Position popup near selection
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.display = 'flex';
}

/**
 * Thực hiện writing action
 */
async function writeAssistAction(action) {
  if (!STATE.selectedText) return;
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const popup = document.getElementById('writingAssistantPopup');
  if (popup) popup.style.display = 'none';

  const actions = {
    expand: `Hãy mở rộng đoạn văn sau thành chi tiết hơn (gấp 2-3 lần), giữ nguyên ý chính:\n\n"${STATE.selectedText}"`,
    shorten: `Hãy rút gọn đoạn văn sau còn khoảng 1/3 độ dài, giữ ý chính:\n\n"${STATE.selectedText}"`,
    paraphrase: `Hãy viết lại (paraphrase) đoạn văn sau bằng cách diễn đạt khác, giữ nguyên nghĩa:\n\n"${STATE.selectedText}"`,
    translate_en: `Dịch đoạn văn sau sang tiếng Anh tự nhiên, chuyên nghiệp:\n\n"${STATE.selectedText}"`,
    formal: `Viết lại đoạn văn sau với tone chuyên nghiệp, trang trọng hơn:\n\n"${STATE.selectedText}"`,
    simple: `Viết lại đoạn văn sau đơn giản hơn, dễ hiểu cho mọi đối tượng:\n\n"${STATE.selectedText}"`,
    bullet: `Chuyển đoạn văn sau thành dạng bullet points rõ ràng:\n\n"${STATE.selectedText}"`
  };

  const prompt = actions[action];
  if (!prompt) return;

  addChatMessage('user', `✍️ [${getWriteActionLabel(action)}]: "${STATE.selectedText.substring(0, 100)}${STATE.selectedText.length > 100 ? '...' : ''}"`);
  addTypingIndicator();

  try {
    const result = await callGemini(prompt);
    removeTypingIndicator();
    addChatMessage('ai', result);
  } catch (err) {
    removeTypingIndicator();
    addChatMessage('ai', `❌ Lỗi: ${err.message}`);
  }
}

function getWriteActionLabel(action) {
  const labels = {
    expand: 'Mở rộng', shorten: 'Rút gọn', paraphrase: 'Viết lại',
    translate_en: 'Dịch sang English', formal: 'Chuyên nghiệp hóa',
    simple: 'Đơn giản hóa', bullet: 'Bullet points'
  };
  return labels[action] || action;
}


// ==============================================================
// SECTION 36: OCR PRE-PROCESSING (T-N8)
// ==============================================================

/**
 * Tiền xử lý ảnh cho OCR
 */
function preprocessImageForOCR(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Scale up small images
          const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Draw original
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert to grayscale
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
          }

          // Increase contrast
          const contrast = 50;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = data[i];
            data[i + 2] = data[i];
          }

          // Apply threshold (binarization)
          const threshold = 128;
          for (let i = 0; i < data.length; i += 4) {
            const val = data[i] > threshold ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
          }

          ctx.putImageData(imageData, 0, 0);

          // Sharpen (simple unsharp mask)
          // Skip complex sharpen for performance — the above is sufficient

          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/png');

        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Show OCR preview before/after
 */
function showOCRPreview(originalFile, processedBlob) {
  const overlay = document.getElementById('ocrPreviewOverlay');
  if (!overlay) return;

  const originalImg = document.getElementById('ocrOriginal');
  const processedImg = document.getElementById('ocrProcessed');

  if (originalImg) originalImg.src = URL.createObjectURL(originalFile);
  if (processedImg) processedImg.src = URL.createObjectURL(processedBlob);

  openOverlay('ocrPreviewOverlay');
}


// ==============================================================
// SECTION 37: DOCUMENT COMPARISON TABLE (T-AI2)
// So sánh N nguồn bằng bảng matrix
// ==============================================================

/**
 * So sánh N nguồn bằng bảng matrix
 */
async function compareDocuments() {
  if (STATE.sources.length < 2) {
    showToast('Cần ít nhất 2 nguồn để so sánh.', 'warning');
    return;
  }
  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  addChatMessage('user', '📊 So sánh tài liệu (bảng matrix)');
  addTypingIndicator();

  const sourceTexts = STATE.sources.map((s, i) =>
    `[Nguồn ${i + 1}: ${s.name}]\n${(s.text || s.content || '').substring(0, 3000)}`
  ).join('\n\n---\n\n');

  const sourceNames = STATE.sources.map((s, i) => `Nguồn ${i + 1}: ${s.name}`);

  const prompt = `Bạn là chuyên gia phân tích so sánh tài liệu. Hãy so sánh ${STATE.sources.length} nguồn tài liệu sau bằng BẢNG SO SÁNH CHI TIẾT.

Trả về JSON:
{
  "title": "Tiêu đề bảng so sánh",
  "criteria": [
    {
      "name": "Tên tiêu chí (VD: Chủ đề chính, Phạm vi, Quan điểm, Dẫn chứng, Độ tin cậy, Ưu điểm, Hạn chế, Kết luận...)",
      "values": ["Giá trị Nguồn 1", "Giá trị Nguồn 2", ...]
    }
  ],
  "summary": "Nhận xét tổng hợp 3-5 câu về sự giống/khác nhau giữa các nguồn",
  "recommendation": "Khuyến nghị cho người đọc"
}

Yêu cầu:
- Tối thiểu 8 tiêu chí so sánh
- Mỗi ô trong bảng viết 1-3 câu ngắn gọn
- Nhận xét khách quan, có dẫn chứng
- CHỈ TRẢ VỀ JSON, KHÔNG text thừa

Các nguồn:
${sourceNames.join('\n')}

Nội dung:
${sourceTexts}`;

  try {
    const result = await callGemini(prompt);
    removeTypingIndicator();

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: hiển thị kết quả dạng text
      addChatMessage('ai', result);
      return;
    }

    const comparison = JSON.parse(jsonMatch[0]);
    STATE.lastComparison = comparison;

    // Render bảng so sánh HTML
    const tableHtml = renderComparisonTable(comparison, sourceNames);
    addChatMessage('ai', tableHtml, true); // true = rawHTML

  } catch (err) {
    removeTypingIndicator();
    console.error('Compare error:', err);
    addChatMessage('ai', `❌ Lỗi so sánh: ${err.message}`);
  }
}

/**
 * Render bảng so sánh thành HTML table
 */
function renderComparisonTable(comparison, sourceNames) {
  const cols = sourceNames || STATE.sources.map((s, i) => `Nguồn ${i + 1}`);

  let html = `<div class="comparison-table-wrapper">`;
  html += `<h3>📊 ${escapeHtml(comparison.title || 'Bảng so sánh tài liệu')}</h3>`;
  html += `<div class="table-scroll"><table class="comparison-table">`;

  // Header row
  html += `<thead><tr><th class="criteria-col">Tiêu chí</th>`;
  cols.forEach(name => {
    html += `<th>${escapeHtml(name)}</th>`;
  });
  html += `</tr></thead>`;

  // Data rows
  html += `<tbody>`;
  if (comparison.criteria && Array.isArray(comparison.criteria)) {
    comparison.criteria.forEach((row, idx) => {
      html += `<tr class="${idx % 2 === 0 ? 'even' : 'odd'}">`;
      html += `<td class="criteria-name"><strong>${escapeHtml(row.name)}</strong></td>`;
      (row.values || []).forEach(val => {
        html += `<td>${escapeHtml(val || '—')}</td>`;
      });
      // Fill missing columns
      for (let i = (row.values || []).length; i < cols.length; i++) {
        html += `<td>—</td>`;
      }
      html += `</tr>`;
    });
  }
  html += `</tbody></table></div>`;

  // Summary
  if (comparison.summary) {
    html += `<div class="comparison-summary"><h4>📝 Nhận xét tổng hợp</h4><p>${escapeHtml(comparison.summary)}</p></div>`;
  }
  if (comparison.recommendation) {
    html += `<div class="comparison-recommendation"><h4>💡 Khuyến nghị</h4><p>${escapeHtml(comparison.recommendation)}</p></div>`;
  }

  // Action buttons
  html += `<div class="comparison-actions">`;
  html += `<button class="btn btn-sm btn-primary" onclick="exportComparisonTable()">📥 Export Markdown</button>`;
  html += `<button class="btn btn-sm btn-accent" onclick="copyComparisonTable()">📋 Copy</button>`;
  html += `</div>`;
  html += `</div>`;

  return html;
}

/**
 * Export bảng so sánh ra Markdown
 */
function exportComparisonTable() {
  const comp = STATE.lastComparison;
  if (!comp) {
    showToast('Chưa có bảng so sánh.', 'warning');
    return;
  }

  const sourceNames = STATE.sources.map((s, i) => `Nguồn ${i + 1}: ${s.name}`);
  let md = `# ${comp.title || 'Bảng so sánh tài liệu'}\n\n`;

  // Table header
  md += `| Tiêu chí | ${sourceNames.join(' | ')} |\n`;
  md += `|${'----|'.repeat(sourceNames.length + 1)}\n`;

  // Table rows
  (comp.criteria || []).forEach(row => {
    md += `| **${row.name}** |`;
    (row.values || []).forEach(val => {
      md += ` ${(val || '—').replace(/\|/g, '\\|')} |`;
    });
    md += '\n';
  });

  md += `\n## Nhận xét\n${comp.summary || ''}\n`;
  md += `\n## Khuyến nghị\n${comp.recommendation || ''}\n`;

  downloadBlob(new Blob([md], { type: 'text/markdown' }), 'comparison-table.md');
  showToast('Đã xuất bảng so sánh!', 'success');
}

/**
 * Copy bảng so sánh
 */
function copyComparisonTable() {
  const comp = STATE.lastComparison;
  if (!comp) return;

  let text = `${comp.title || 'Bảng so sánh'}\n\n`;
  (comp.criteria || []).forEach(row => {
    text += `${row.name}:\n`;
    (row.values || []).forEach((val, i) => {
      text += `  Nguồn ${i + 1}: ${val || '—'}\n`;
    });
    text += '\n';
  });
  text += `Nhận xét: ${comp.summary || ''}\n`;
  text += `Khuyến nghị: ${comp.recommendation || ''}\n`;

  copyToClipboard(text);
}


// ==============================================================
// SECTION 38: AUTO-TAGGING & CATEGORIZATION (T-AI7)
// AI chạy background phân tích 200 từ đầu gán tag
// ==============================================================

/**
 * Auto-tag nguồn khi upload (chạy background)
 */
async function autoTagSource(sourceIndex) {
  if (!getActiveKey()) return; // Silent fail — background task

  const source = STATE.sources[sourceIndex];
  if (!source) return;

  const textSample = (source.text || source.content || '').substring(0, 800);
  if (!textSample.trim()) return;

  const prompt = `Phân tích đoạn văn bản sau và trả về JSON:
{
  "topic": "Chủ đề chính (1-3 từ)",
  "language": "vi|en|ja|zh|ko|other",
  "docType": "article|report|book|presentation|code|data|note|legal|medical|academic|news|other",
  "complexity": "basic|intermediate|advanced|expert",
  "tags": ["tag1", "tag2", "tag3"],
  "summary_30w": "Tóm tắt 30 từ"
}

CHỈ TRẢ VỀ JSON.

Văn bản:\n${textSample}`;

  try {
    const result = await callGemini(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const meta = JSON.parse(jsonMatch[0]);

    // Update source metadata
    source.autoTags = meta.tags || [];
    source.topic = meta.topic || '';
    source.language = meta.language || '';
    source.docType = meta.docType || '';
    source.complexity = meta.complexity || '';
    source.summary30 = meta.summary_30w || '';

    // Re-render source list to show tags
    renderSourceList();

    // Save to IndexedDB
    saveCurrentSession();

    console.log(`Auto-tagged source "${source.name}":`, meta);

  } catch (err) {
    console.warn('Auto-tag error for', source.name, err);
    // Silent fail — non-critical background task
  }
}

/**
 * Render auto-tags cho source item
 */
function renderSourceAutoTags(source) {
  if (!source.autoTags?.length && !source.topic) return '';

  let html = '<div class="source-auto-tags">';

  if (source.topic) {
    html += `<span class="auto-tag topic" title="Chủ đề">${escapeHtml(source.topic)}</span>`;
  }
  if (source.docType) {
    const typeLabels = {
      article: '📰 Bài viết', report: '📊 Báo cáo', book: '📚 Sách',
      presentation: '📽️ Trình bày', code: '💻 Code', data: '📈 Dữ liệu',
      note: '📝 Ghi chú', legal: '⚖️ Pháp lý', medical: '🏥 Y tế',
      academic: '🎓 Học thuật', news: '📰 Tin tức', other: '📄 Khác'
    };
    html += `<span class="auto-tag doctype">${typeLabels[source.docType] || source.docType}</span>`;
  }
  if (source.complexity) {
    const compLabels = {
      basic: '🟢 Cơ bản', intermediate: '🟡 Trung bình',
      advanced: '🟠 Nâng cao', expert: '🔴 Chuyên sâu'
    };
    html += `<span class="auto-tag complexity">${compLabels[source.complexity] || source.complexity}</span>`;
  }
  if (source.language) {
    const langLabels = { vi: '🇻🇳 VI', en: '🇺🇸 EN', ja: '🇯🇵 JA', zh: '🇨🇳 ZH', ko: '🇰🇷 KO' };
    html += `<span class="auto-tag lang">${langLabels[source.language] || source.language.toUpperCase()}</span>`;
  }

  (source.autoTags || []).forEach(tag => {
    html += `<span class="auto-tag custom">${escapeHtml(tag)}</span>`;
  });

  html += '</div>';
  return html;
}


// ==============================================================
// SECTION 39: PINNED NOTES BOARD (T-C6)
// ==============================================================

/**
 * Khởi tạo Notes Board
 */
function initNotesBoard() {
  document.getElementById('notesBtnAdd')?.addEventListener('click', addManualNote);
  document.getElementById('notesBtnExport')?.addEventListener('click', exportNotes);
  document.getElementById('notesBtnClear')?.addEventListener('click', clearAllNotes);
  document.getElementById('notesSearch')?.addEventListener('input', filterNotes);
}

/**
 * Mở Notes Board overlay
 */
function openNotesBoard() {
  renderNotesBoard();
  openOverlay('notesBoardOverlay');
  updateNotesBadge();
}

/**
 * Ghim câu trả lời AI vào notes
 */
function pinToNotes(messageText, sourceLabel) {
  if (!STATE.pinnedNotes) STATE.pinnedNotes = [];

  const note = {
    id: generateId(),
    text: messageText,
    source: sourceLabel || 'Chat AI',
    tag: 'default',
    tagColor: '#3498db',
    createdAt: new Date().toISOString(),
    isManual: false
  };

  STATE.pinnedNotes.push(note);
  saveCurrentSession();
  updateNotesBadge();
  showToast('Đã ghim vào Ghi chú!', 'success');
}

/**
 * Thêm ghi chú thủ công
 */
function addManualNote() {
  const input = document.getElementById('notesManualInput');
  const text = input?.value?.trim();
  if (!text) {
    showToast('Nhập nội dung ghi chú.', 'warning');
    return;
  }

  if (!STATE.pinnedNotes) STATE.pinnedNotes = [];

  const tagSelect = document.getElementById('notesTagSelect');
  const selectedTag = tagSelect?.value || 'default';
  const tagColors = {
    'default': '#3498db',
    'important': '#e74c3c',
    'reference': '#f39c12',
    'idea': '#9b59b6',
    'todo': '#27ae60',
    'question': '#1abc9c'
  };

  const note = {
    id: generateId(),
    text: text,
    source: 'Ghi chú tay',
    tag: selectedTag,
    tagColor: tagColors[selectedTag] || '#3498db',
    createdAt: new Date().toISOString(),
    isManual: true
  };

  STATE.pinnedNotes.push(note);
  if (input) input.value = '';
  renderNotesBoard();
  saveCurrentSession();
  updateNotesBadge();
  showToast('Đã thêm ghi chú!', 'success');
}

/**
 * Xóa 1 note
 */
function deleteNote(noteId) {
  if (!STATE.pinnedNotes) return;
  STATE.pinnedNotes = STATE.pinnedNotes.filter(n => n.id !== noteId);
  renderNotesBoard();
  saveCurrentSession();
  updateNotesBadge();
}

/**
 * Đổi tag/color note
 */
function changeNoteTag(noteId, newTag) {
  const note = STATE.pinnedNotes?.find(n => n.id === noteId);
  if (!note) return;

  const tagColors = {
    'default': '#3498db', 'important': '#e74c3c', 'reference': '#f39c12',
    'idea': '#9b59b6', 'todo': '#27ae60', 'question': '#1abc9c'
  };

  note.tag = newTag;
  note.tagColor = tagColors[newTag] || '#3498db';
  renderNotesBoard();
  saveCurrentSession();
}

/**
 * Render Notes Board
 */
function renderNotesBoard(filter = '') {
  const container = document.getElementById('notesBoardContainer');
  if (!container) return;

  const notes = (STATE.pinnedNotes || []).filter(n => {
    if (!filter) return true;
    return n.text.toLowerCase().includes(filter.toLowerCase()) ||
           n.source.toLowerCase().includes(filter.toLowerCase()) ||
           n.tag.toLowerCase().includes(filter.toLowerCase());
  });

  if (!notes.length) {
    container.innerHTML = '<p class="text-muted text-center">Chưa có ghi chú nào. Ghim câu trả lời AI hoặc thêm ghi chú thủ công.</p>';
    return;
  }

  const tagLabels = {
    'default': '📌 Mặc định', 'important': '🔴 Quan trọng', 'reference': '📙 Tham khảo',
    'idea': '💡 Ý tưởng', 'todo': '✅ Cần làm', 'question': '❓ Hỏi đáp'
  };

  container.innerHTML = notes.map(note => `
    <div class="note-card" style="border-left: 4px solid ${note.tagColor}" data-id="${note.id}">
      <div class="note-header">
        <span class="note-tag" style="background:${note.tagColor}20;color:${note.tagColor}">
          ${tagLabels[note.tag] || note.tag}
        </span>
        <span class="note-date">${new Date(note.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        <div class="note-actions">
          <select class="note-tag-select" onchange="changeNoteTag('${note.id}', this.value)" title="Đổi tag">
            <option value="default" ${note.tag === 'default' ? 'selected' : ''}>📌 Mặc định</option>
            <option value="important" ${note.tag === 'important' ? 'selected' : ''}>🔴 Quan trọng</option>
            <option value="reference" ${note.tag === 'reference' ? 'selected' : ''}>📙 Tham khảo</option>
            <option value="idea" ${note.tag === 'idea' ? 'selected' : ''}>💡 Ý tưởng</option>
            <option value="todo" ${note.tag === 'todo' ? 'selected' : ''}>✅ Cần làm</option>
            <option value="question" ${note.tag === 'question' ? 'selected' : ''}>❓ Hỏi đáp</option>
          </select>
          <button class="btn-icon" onclick="copyToClipboard(${JSON.stringify(note.text).replace(/"/g, '&quot;')})" title="Copy">📋</button>
          <button class="btn-icon" onclick="deleteNote('${note.id}')" title="Xóa">🗑️</button>
        </div>
      </div>
      <div class="note-body">${md2html(note.text.length > 500 ? note.text.substring(0, 500) + '...' : note.text)}</div>
      <div class="note-source">Nguồn: ${escapeHtml(note.source)}</div>
    </div>
  `).join('');
}

/**
 * Filter notes
 */
function filterNotes() {
  const query = document.getElementById('notesSearch')?.value || '';
  renderNotesBoard(query);
}

/**
 * Export tất cả notes
 */
function exportNotes() {
  if (!STATE.pinnedNotes?.length) {
    showToast('Chưa có ghi chú.', 'warning');
    return;
  }

  const format = document.getElementById('notesExportFormat')?.value || 'md';

  if (format === 'md') {
    let md = `# 📌 Ghi chú — ${STATE.currentNotebook?.name || 'Notebook'}\n`;
    md += `_Xuất lúc: ${new Date().toLocaleString('vi-VN')}_\n\n---\n\n`;

    STATE.pinnedNotes.forEach((note, i) => {
      md += `## ${i + 1}. [${note.tag.toUpperCase()}] ${note.source}\n`;
      md += `_${new Date(note.createdAt).toLocaleString('vi-VN')}_\n\n`;
      md += `${note.text}\n\n---\n\n`;
    });

    downloadBlob(new Blob([md], { type: 'text/markdown' }), 'notes.md');
  } else {
    const text = STATE.pinnedNotes.map((note, i) =>
      `[${i + 1}] [${note.tag}] ${note.source} (${new Date(note.createdAt).toLocaleString('vi-VN')})\n${note.text}`
    ).join('\n\n---\n\n');

    downloadBlob(new Blob([text], { type: 'text/plain' }), 'notes.txt');
  }

  showToast('Đã xuất ghi chú!', 'success');
}

/**
 * Xóa tất cả notes
 */
function clearAllNotes() {
  if (!STATE.pinnedNotes?.length) return;
  if (!confirm(`Xóa tất cả ${STATE.pinnedNotes.length} ghi chú?`)) return;

  STATE.pinnedNotes = [];
  renderNotesBoard();
  saveCurrentSession();
  updateNotesBadge();
  showToast('Đã xóa tất cả ghi chú.', 'info');
}

/**
 * Cập nhật badge số notes
 */
function updateNotesBadge() {
  const badge = document.getElementById('notesBadge');
  const count = STATE.pinnedNotes?.length || 0;
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}


// ==============================================================
// SECTION 40: YOUTUBE TRANSCRIPT IMPORT (T-N2)
// ==============================================================

/**
 * Mở overlay nhập YouTube URL
 */
function openYouTubeImport() {
  openOverlay('youtubeSourceOverlay');
}

/**
 * Import transcript từ YouTube URL qua Gemini
 */
async function importYouTubeTranscript() {
  const urlInput = document.getElementById('youtubeUrl');
  const url = urlInput?.value?.trim();

  if (!url) {
    showToast('Vui lòng nhập YouTube URL.', 'warning');
    return;
  }

  // Validate YouTube URL
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(ytRegex);
  if (!match) {
    showToast('URL YouTube không hợp lệ.', 'error');
    return;
  }

  if (!getActiveKey()) {
    showToast('Cần API key.', 'error');
    return;
  }

  const videoId = match[1];
  const progress = document.getElementById('youtubeProgress');
  showProgress(progress, 20, 'Đang phân tích video YouTube...');

  const prompt = `Bạn là trợ lý AI. Hãy truy cập và phân tích video YouTube với URL: ${url}

Hãy trả về JSON:
{
  "title": "Tên video",
  "channel": "Tên kênh",
  "transcript": "Toàn bộ nội dung/transcript của video, viết dạng văn bản liên tục, chi tiết nhất có thể",
  "summary": "Tóm tắt nội dung 100-200 từ",
  "keypoints": ["Điểm chính 1", "Điểm chính 2", ...]
}

Nếu không thể truy cập trực tiếp, hãy cung cấp thông tin tốt nhất bạn biết về video ID: ${videoId}.
CHỈ TRẢ VỀ JSON.`;

  try {
    showProgress(progress, 50, 'Đang trích xuất transcript...');
    const result = await callGemini(prompt);

    const jsonMatch2 = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch2) throw new Error('Không thể phân tích kết quả');

    const videoData = JSON.parse(jsonMatch2[0]);
    showProgress(progress, 80, 'Đang thêm vào nguồn...');

    // Add as source
    const source = {
      id: generateId(),
      name: `🎬 ${videoData.title || 'YouTube Video'}`,
      type: 'youtube',
      url: url,
      text: videoData.transcript || videoData.summary || '',
      content: `# ${videoData.title || 'YouTube Video'}\n**Kênh:** ${videoData.channel || 'N/A'}\n\n## Transcript\n${videoData.transcript || ''}\n\n## Tóm tắt\n${videoData.summary || ''}\n\n## Các điểm chính\n${(videoData.keypoints || []).map((k, i) => `${i + 1}. ${k}`).join('\n')}`,
      addedAt: new Date().toISOString(),
      size: 0
    };

    STATE.sources.push(source);
    renderSourceList();
    saveCurrentSession();

    // Auto-tag background
    autoTagSource(STATE.sources.length - 1);

    // Regenerate suggested questions
    generateSuggestedQuestions();

    showProgress(progress, 100, 'Hoàn tất!');
    closeOverlay('youtubeSourceOverlay');
    if (urlInput) urlInput.value = '';
    showToast(`Đã thêm: ${source.name}`, 'success');

  } catch (err) {
    console.error('YouTube import error:', err);
    showToast('Lỗi import YouTube: ' + err.message, 'error');
    showProgress(progress, 0);
  }
}


// ==============================================================
// SECTION 41: EXPORT DOCX (T-N4)
// Sử dụng docx.js CDN
// ==============================================================

/**
 * Export nội dung chat/convert/STT ra DOCX
 */
async function exportToDOCX(content, filename) {
  if (!content) {
    showToast('Không có nội dung để xuất.', 'warning');
    return;
  }

  // Check if docx library is loaded
  if (typeof docx === 'undefined') {
    showToast('Đang tải thư viện DOCX...', 'info');
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js');
    } catch (err) {
      showToast('Không thể tải thư viện DOCX.', 'error');
      return;
    }
  }

  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
            Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    // Parse markdown content into docx elements
    const children = parseMarkdownToDocxElements(content, { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle });

    const doc = new Document({
      creator: 'TuongTanDigital-AI',
      title: filename || 'Export',
      description: 'Generated by TuongTanDigital-AI — AI Suite Powered by Gemini',
      sections: [{
        properties: {},
        children: [
          // Header with branding
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'TuongTanDigital-AI', bold: true, size: 32, color: '0891b2' }),
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'AI Suite Powered by Gemini', italics: true, size: 20, color: '666666' }),
            ]
          }),
          new Paragraph({ children: [] }), // spacer
          ...children,
          // Footer
          new Paragraph({ children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `© 2025-${new Date().getFullYear()} TuongTanDigital. All rights reserved.`,
                size: 16, color: '999999', italics: true
              }),
            ]
          }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `${filename || 'export'}.docx`);
    showToast('Đã xuất file DOCX!', 'success');

  } catch (err) {
    console.error('DOCX export error:', err);
    showToast('Lỗi xuất DOCX: ' + err.message, 'error');
  }
}

/**
 * Parse Markdown text thành DOCX elements
 */
function parseMarkdownToDocxElements(md, lib) {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType,
          Table, TableRow, TableCell, WidthType } = lib;

  const elements = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith('######')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_6,
        children: [new TextRun({ text: line.replace(/^#{6}\s*/, ''), bold: true })]
      }));
    } else if (line.startsWith('#####')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_5,
        children: [new TextRun({ text: line.replace(/^#{5}\s*/, ''), bold: true })]
      }));
    } else if (line.startsWith('####')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_4,
        children: [new TextRun({ text: line.replace(/^#{4}\s*/, ''), bold: true })]
      }));
    } else if (line.startsWith('###')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: line.replace(/^#{3}\s*/, ''), bold: true })]
      }));
    } else if (line.startsWith('##')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: line.replace(/^#{2}\s*/, ''), bold: true })]
      }));
    } else if (line.startsWith('#')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: line.replace(/^#\s*/, ''), bold: true })]
      }));
    }
    // Horizontal rule
    else if (line.match(/^(-{3,}|\*{3,}|_{3,})\s*$/)) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: '─'.repeat(60), color: 'CCCCCC' })]
      }));
    }
    // Bullet list
    else if (line.match(/^\s*[-*+]\s+/)) {
      const indent = (line.match(/^(\s*)/)[1].length / 2) * 360;
      const text = line.replace(/^\s*[-*+]\s+/, '');
      elements.push(new Paragraph({
        indent: { left: 360 + indent },
        children: [
          new TextRun({ text: '• ' }),
          ...parseInlineMarkdown(text, TextRun)
        ]
      }));
    }
    // Numbered list
    else if (line.match(/^\s*\d+\.\s+/)) {
      const numMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
      if (numMatch) {
        elements.push(new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${numMatch[1]}. ` }),
            ...parseInlineMarkdown(numMatch[2], TextRun)
          ]
        }));
      }
    }
    // Blockquote
    else if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      elements.push(new Paragraph({
        indent: { left: 720 },
        children: [
          new TextRun({ text: quoteText, italics: true, color: '666666' })
        ]
      }));
    }
    // Table detection
    else if (line.includes('|') && i + 1 < lines.length && lines[i + 1]?.match(/\|[\s-]+\|/)) {
      // Parse markdown table
      const tableRows = [];
      let j = i;
      while (j < lines.length && lines[j].includes('|')) {
        if (!lines[j].match(/^\|[\s-:|]+\|$/)) { // skip separator row
          const cells = lines[j].split('|').filter(c => c.trim()).map(c => c.trim());
          tableRows.push(cells);
        }
        j++;
      }

      if (tableRows.length > 0) {
        const maxCols = Math.max(...tableRows.map(r => r.length));
        try {
          const table = new Table({
            rows: tableRows.map((row, rIdx) =>
              new TableRow({
                children: Array.from({ length: maxCols }, (_, cIdx) =>
                  new TableCell({
                    width: { size: Math.floor(9000 / maxCols), type: WidthType.DXA },
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: row[cIdx] || '',
                        bold: rIdx === 0,
                        size: rIdx === 0 ? 22 : 20
                      })]
                    })]
                  })
                )
              })
            )
          });
          elements.push(table);
        } catch (e) {
          // Fallback if table creation fails
          tableRows.forEach(row => {
            elements.push(new Paragraph({
              children: [new TextRun({ text: row.join(' | ') })]
            }));
          });
        }
      }
      i = j;
      continue;
    }
    // Code block
    else if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      codeLines.forEach(cl => {
        elements.push(new Paragraph({
          indent: { left: 360 },
          children: [new TextRun({ text: cl, font: 'Courier New', size: 18, color: '2d3748' })]
        }));
      });
    }
    // Empty line
    else if (!line.trim()) {
      elements.push(new Paragraph({ children: [] }));
    }
    // Normal paragraph
    else {
      elements.push(new Paragraph({
        children: parseInlineMarkdown(line, TextRun)
      }));
    }

    i++;
  }

  return elements;
}

/**
 * Parse inline Markdown (bold, italic, code, strikethrough)
 */
function parseInlineMarkdown(text, TextRun) {
  const runs = [];
  // Simplified inline parser
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~|__(.+?)__|_(.+?)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index) }));
    }

    if (match[2]) {
      // Bold + Italic ***text***
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      // Bold **text**
      runs.push(new TextRun({ text: match[3], bold: true }));
    } else if (match[4]) {
      // Italic *text*
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      // Inline code `text`
      runs.push(new TextRun({ text: match[5], font: 'Courier New', color: 'e74c3c' }));
    } else if (match[6]) {
      // Strikethrough ~~text~~
      runs.push(new TextRun({ text: match[6], strike: true }));
    } else if (match[7]) {
      // Bold __text__
      runs.push(new TextRun({ text: match[7], bold: true }));
    } else if (match[8]) {
      // Italic _text_
      runs.push(new TextRun({ text: match[8], italics: true }));
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex) }));
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }

  return runs;
}

/**
 * Dynamic script loader
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}


// ==============================================================
// SECTION 42: TEMPLATE PROMPTS LIBRARY (T-N5)
// 30+ prompt mẫu phân theo danh mục
// ==============================================================

const TEMPLATE_PROMPTS = [
  // Học thuật
  { category: 'academic', icon: '🎓', label: 'Học thuật', prompts: [
    { title: 'Tóm tắt bài nghiên cứu', prompt: 'Hãy tóm tắt bài nghiên cứu/tài liệu này theo cấu trúc: Mục tiêu, Phương pháp, Kết quả chính, Kết luận, Hạn chế.' },
    { title: 'Phân tích luận điểm', prompt: 'Hãy phân tích các luận điểm chính trong tài liệu: luận điểm là gì, dẫn chứng hỗ trợ, phản biện có thể, độ thuyết phục.' },
    { title: 'So sánh lý thuyết', prompt: 'Hãy so sánh các lý thuyết/quan điểm khác nhau được đề cập trong tài liệu dưới dạng bảng.' },
    { title: 'Đề xuất hướng nghiên cứu', prompt: 'Dựa trên tài liệu, hãy đề xuất 5 hướng nghiên cứu tiếp theo có tiềm năng.' },
    { title: 'Review văn phong học thuật', prompt: 'Hãy đánh giá văn phong học thuật của tài liệu: tính khách quan, logic, trích dẫn, cấu trúc.' },
  ]},
  // Pháp lý
  { category: 'legal', icon: '⚖️', label: 'Pháp lý', prompts: [
    { title: 'Tóm tắt văn bản pháp luật', prompt: 'Tóm tắt nội dung chính văn bản pháp luật này: phạm vi áp dụng, đối tượng, quy định chính, hình thức xử lý vi phạm.' },
    { title: 'So sánh điều khoản', prompt: 'Hãy so sánh các điều khoản quan trọng giữa các phần/nguồn tài liệu, chỉ ra khác biệt và mâu thuẫn.' },
    { title: 'Giải thích thuật ngữ pháp lý', prompt: 'Hãy liệt kê và giải thích tất cả thuật ngữ pháp lý chuyên ngành trong tài liệu bằng ngôn ngữ dễ hiểu.' },
    { title: 'Phân tích rủi ro pháp lý', prompt: 'Phân tích các rủi ro pháp lý tiềm ẩn từ nội dung tài liệu này.' },
  ]},
  // Y tế
  { category: 'medical', icon: '🏥', label: 'Y tế', prompts: [
    { title: 'Tóm tắt nghiên cứu y khoa', prompt: 'Tóm tắt nghiên cứu y khoa: thiết kế nghiên cứu, mẫu, kết quả chính, ý nghĩa lâm sàng, hạn chế.' },
    { title: 'Giải thích cho bệnh nhân', prompt: 'Hãy giải thích nội dung y khoa trong tài liệu bằng ngôn ngữ đơn giản mà bệnh nhân có thể hiểu.' },
    { title: 'So sánh phương pháp điều trị', prompt: 'So sánh các phương pháp điều trị được đề cập: ưu nhược điểm, chỉ định, chống chỉ định, hiệu quả.' },
  ]},
  // Kinh doanh
  { category: 'business', icon: '💼', label: 'Kinh doanh', prompts: [
    { title: 'Phân tích SWOT', prompt: 'Dựa trên tài liệu, hãy tạo phân tích SWOT chi tiết: Strengths, Weaknesses, Opportunities, Threats.' },
    { title: 'Tóm tắt báo cáo tài chính', prompt: 'Tóm tắt các số liệu tài chính quan trọng: doanh thu, lợi nhuận, tăng trưởng, rủi ro.' },
    { title: 'Đề xuất chiến lược', prompt: 'Dựa trên phân tích tài liệu, hãy đề xuất 5 chiến lược kinh doanh cụ thể có thể thực hiện.' },
    { title: 'Executive Summary', prompt: 'Viết Executive Summary (tóm tắt điều hành) cho tài liệu này, dài 200-300 từ, chuyên nghiệp.' },
    { title: 'Phân tích đối thủ', prompt: 'Phân tích thông tin về đối thủ cạnh tranh từ tài liệu: vị thế, chiến lược, điểm mạnh/yếu.' },
  ]},
  // Giáo dục
  { category: 'education', icon: '📚', label: 'Giáo dục', prompts: [
    { title: 'Tạo bài giảng', prompt: 'Từ tài liệu, hãy tạo outline bài giảng 45 phút: mục tiêu, nội dung chính, hoạt động, câu hỏi thảo luận.' },
    { title: 'Câu hỏi ôn tập', prompt: 'Tạo 20 câu hỏi ôn tập đa dạng (nhớ, hiểu, vận dụng, phân tích) kèm đáp án.' },
    { title: 'Giải thích dễ hiểu', prompt: 'Hãy giải thích nội dung tài liệu như đang giải thích cho học sinh lớp 10, dùng ví dụ đời thường.' },
    { title: 'Sơ đồ kiến thức', prompt: 'Tạo sơ đồ kiến thức (knowledge map) từ tài liệu, thể hiện mối quan hệ giữa các khái niệm.' },
  ]},
  // Marketing
  { category: 'marketing', icon: '📢', label: 'Marketing', prompts: [
    { title: 'Phân tích đối tượng mục tiêu', prompt: 'Phân tích đối tượng mục tiêu từ tài liệu: nhân khẩu học, hành vi, nhu cầu, pain points.' },
    { title: 'Tạo content brief', prompt: 'Từ tài liệu, tạo content brief cho bài viết marketing: headline, key messages, CTA, tone.' },
    { title: 'Phân tích thông điệp', prompt: 'Phân tích thông điệp truyền thông trong tài liệu: rõ ràng, thuyết phục, nhất quán, điểm cải thiện.' },
    { title: 'Social media posts', prompt: 'Từ nội dung tài liệu, tạo 5 bài đăng social media (Facebook, LinkedIn) hấp dẫn, kèm hashtag.' },
  ]},
  // Kỹ thuật
  { category: 'technical', icon: '⚙️', label: 'Kỹ thuật', prompts: [
    { title: 'Review code/kiến trúc', prompt: 'Review kiến trúc/code trong tài liệu: best practices, potential issues, cải thiện, security concerns.' },
    { title: 'Tạo tài liệu kỹ thuật', prompt: 'Từ tài liệu, tạo technical documentation: overview, architecture, API, deployment, troubleshooting.' },
    { title: 'Explain like I\'m 5', prompt: 'Giải thích khái niệm kỹ thuật trong tài liệu như giải thích cho trẻ 5 tuổi.' },
    { title: 'Debug & troubleshoot', prompt: 'Phân tích và đề xuất giải pháp cho các vấn đề kỹ thuật được đề cập trong tài liệu.' },
  ]},
];

/**
 * Mở Template Prompts Library
 */
function openTemplatePrompts() {
  renderTemplatePrompts();
  openOverlay('templatePromptsOverlay');
}

/**
 * Render template prompts
 */
function renderTemplatePrompts(filter = '') {
  const container = document.getElementById('templatePromptsContainer');
  if (!container) return;

  // Tabs for categories
  let html = '<div class="template-categories">';
  html += `<button class="template-cat-btn active" onclick="filterTemplateCategory('all', this)">📋 Tất cả</button>`;
  TEMPLATE_PROMPTS.forEach(cat => {
    html += `<button class="template-cat-btn" onclick="filterTemplateCategory('${cat.category}', this)">${cat.icon} ${cat.label}</button>`;
  });
  html += '</div>';

  // My prompts section
  const myPrompts = JSON.parse(localStorage.getItem('myPrompts') || '[]');
  if (myPrompts.length) {
    html += `<div class="template-section" data-category="my">
      <h4>⭐ Prompt của tôi (${myPrompts.length})</h4>
      <div class="template-grid">`;
    myPrompts.forEach((p, i) => {
      html += `<div class="template-card" data-category="my">
        <h5>${escapeHtml(p.title)}</h5>
        <p>${escapeHtml(p.prompt.substring(0, 100))}...</p>
        <div class="template-actions">
          <button class="btn btn-sm btn-primary" onclick="useTemplatePrompt(${JSON.stringify(p.prompt).replace(/"/g, '&quot;')})">Dùng</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMyPrompt(${i})">Xóa</button>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  // Built-in prompts
  TEMPLATE_PROMPTS.forEach(cat => {
    const filteredPrompts = filter && filter !== 'all'
      ? (cat.category === filter ? cat.prompts : [])
      : cat.prompts;

    if (!filteredPrompts.length) return;

    html += `<div class="template-section" data-category="${cat.category}">
      <h4>${cat.icon} ${cat.label} (${filteredPrompts.length})</h4>
      <div class="template-grid">`;

    filteredPrompts.forEach(p => {
      html += `<div class="template-card" data-category="${cat.category}">
        <h5>${escapeHtml(p.title)}</h5>
        <p>${escapeHtml(p.prompt.substring(0, 120))}...</p>
        <div class="template-actions">
          <button class="btn btn-sm btn-primary" onclick="useTemplatePrompt(${JSON.stringify(p.prompt).replace(/"/g, '&quot;')})">Dùng</button>
          <button class="btn btn-sm" onclick="saveToMyPrompts(${JSON.stringify(p.title).replace(/"/g, '&quot;')}, ${JSON.stringify(p.prompt).replace(/"/g, '&quot;')})">⭐ Lưu</button>
        </div>
      </div>`;
    });

    html += `</div></div>`;
  });

  // Add custom prompt
  html += `<div class="template-add-custom">
    <h4>➕ Thêm prompt tùy chỉnh</h4>
    <input type="text" id="customPromptTitle" placeholder="Tên prompt" class="form-input">
    <textarea id="customPromptText" placeholder="Nội dung prompt..." class="form-textarea" rows="3"></textarea>
    <button class="btn btn-primary" onclick="addCustomPrompt()">Lưu prompt</button>
  </div>`;

  container.innerHTML = html;
}

/**
 * Filter template theo category
 */
function filterTemplateCategory(category, btn) {
  // Update active button
  document.querySelectorAll('.template-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const sections = document.querySelectorAll('.template-section');
  sections.forEach(sec => {
    if (category === 'all') {
      sec.style.display = 'block';
    } else {
      sec.style.display = sec.dataset.category === category ? 'block' : 'none';
    }
  });
}

/**
 * Dùng template prompt
 */
function useTemplatePrompt(prompt) {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = prompt;
    chatInput.focus();
  }
  closeOverlay('templatePromptsOverlay');
  // Switch to Notebook tab if not active
  if (STATE.activeTab !== 'notebook') {
    switchTab('notebook');
  }
  showToast('Đã điền prompt vào chat!', 'success');
}

/**
 * Lưu vào My Prompts
 */
function saveToMyPrompts(title, prompt) {
  const myPrompts = JSON.parse(localStorage.getItem('myPrompts') || '[]');
  if (myPrompts.find(p => p.title === title)) {
    showToast('Prompt này đã có trong danh sách.', 'info');
    return;
  }
  myPrompts.push({ title, prompt });
  localStorage.setItem('myPrompts', JSON.stringify(myPrompts));
  showToast('Đã lưu vào My Prompts!', 'success');
  renderTemplatePrompts();
}

/**
 * Thêm custom prompt
 */
function addCustomPrompt() {
  const title = document.getElementById('customPromptTitle')?.value?.trim();
  const prompt = document.getElementById('customPromptText')?.value?.trim();
  if (!title || !prompt) {
    showToast('Nhập tên và nội dung prompt.', 'warning');
    return;
  }

  const myPrompts = JSON.parse(localStorage.getItem('myPrompts') || '[]');
  myPrompts.push({ title, prompt });
  localStorage.setItem('myPrompts', JSON.stringify(myPrompts));

  document.getElementById('customPromptTitle').value = '';
  document.getElementById('customPromptText').value = '';

  renderTemplatePrompts();
  showToast('Đã thêm prompt tùy chỉnh!', 'success');
}

/**
 * Xóa my prompt
 */
function deleteMyPrompt(index) {
  const myPrompts = JSON.parse(localStorage.getItem('myPrompts') || '[]');
  myPrompts.splice(index, 1);
  localStorage.setItem('myPrompts', JSON.stringify(myPrompts));
  renderTemplatePrompts();
  showToast('Đã xóa.', 'info');
}


// ==============================================================
// SECTION 43: GEMINI 2.0 LIVE API VOICE CHAT (T-AI8)
// WebSocket real-time, fallback Web Speech API
// ==============================================================

let liveWebSocket = null;
let liveAudioContext = null;
let liveMediaStream = null;
let liveProcessor = null;

/**
 * Khởi tạo Live Voice Chat
 */
function initLiveVoiceChat() {
  document.getElementById('liveBtnStart')?.addEventListener('click', startLiveVoiceChat);
  document.getElementById('liveBtnStop')?.addEventListener('click', stopLiveVoiceChat);
}

/**
 * Bắt đầu Live Voice Chat qua WebSocket
 */
async function startLiveVoiceChat() {
  if (!getActiveKey()) {
    showToast('Cần API key cho Live Voice Chat.', 'error');
    return;
  }

  const statusEl = document.getElementById('liveStatus');
  const startBtn = document.getElementById('liveBtnStart');
  const stopBtn = document.getElementById('liveBtnStop');

  // Attempt WebSocket connection to Gemini Live API
  const apiKey = getActiveKey();
  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  try {
    // First, get microphone access
    liveMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    if (statusEl) statusEl.textContent = 'Đang kết nối...';
    if (startBtn) startBtn.disabled = true;

    liveWebSocket = new WebSocket(wsUrl);

    liveWebSocket.onopen = () => {
      console.log('Live API WebSocket connected');
      if (statusEl) statusEl.textContent = '🟢 Đã kết nối — Hãy nói...';
      if (startBtn) startBtn.classList.add('hidden');
      if (stopBtn) stopBtn.classList.remove('hidden');

      // Send setup message
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.0-flash-live-001',
          generationConfig: {
            responseModalities: ['AUDIO', 'TEXT'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: document.getElementById('liveVoice')?.value || 'Aoede'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `Bạn là trợ lý AI thông minh tên TuongTanDigital-AI. Trả lời ngắn gọn, tự nhiên, thân thiện. Trả lời bằng tiếng Việt trừ khi được yêu cầu khác. Nếu có tài liệu nguồn trong notebook, hãy tham chiếu khi cần.`
            }]
          }
        }
      };
      liveWebSocket.send(JSON.stringify(setupMessage));

      // Start streaming microphone audio
      startAudioStreaming();
    };

    liveWebSocket.onmessage = (event) => {
      handleLiveResponse(event.data);
    };

    liveWebSocket.onerror = (error) => {
      console.error('Live WebSocket error:', error);
      if (statusEl) statusEl.textContent = '🔴 Lỗi kết nối';
      showToast('Lỗi kết nối Live API. Đang chuyển sang fallback...', 'warning');
      stopLiveVoiceChat();
      // Fallback to Web Speech API
      startFallbackVoiceChat();
    };

    liveWebSocket.onclose = (event) => {
      console.log('Live WebSocket closed:', event.code, event.reason);
      if (statusEl) statusEl.textContent = '⚪ Đã ngắt kết nối';
      cleanupLiveAudio();
      if (startBtn) { startBtn.classList.remove('hidden'); startBtn.disabled = false; }
      if (stopBtn) stopBtn.classList.add('hidden');
    };

  } catch (err) {
    console.error('Live voice chat error:', err);
    if (statusEl) statusEl.textContent = '🔴 Lỗi';
    if (startBtn) startBtn.disabled = false;
    showToast('Không thể khởi tạo: ' + err.message, 'error');

    // Fallback
    startFallbackVoiceChat();
  }
}

/**
 * Stream audio từ microphone qua WebSocket
 */
function startAudioStreaming() {
  if (!liveMediaStream || !liveWebSocket) return;

  liveAudioContext = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: 16000
  });

  const source = liveAudioContext.createMediaStreamSource(liveMediaStream);
  liveProcessor = liveAudioContext.createScriptProcessor(4096, 1, 1);

  liveProcessor.onaudioprocess = (event) => {
    if (liveWebSocket?.readyState !== WebSocket.OPEN) return;

    const inputData = event.inputBuffer.getChannelData(0);

    // Convert float32 to int16
    const int16Data = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      int16Data[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
    }

    // Send as base64
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));

    const audioMessage = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Audio
        }]
      }
    };

    try {
      liveWebSocket.send(JSON.stringify(audioMessage));
    } catch (e) {
      // WebSocket might be closing
    }
  };

  source.connect(liveProcessor);
  liveProcessor.connect(liveAudioContext.destination);
}

/**
 * Xử lý response từ Live API
 */
function handleLiveResponse(data) {
  try {
    const response = typeof data === 'string' ? JSON.parse(data) : data;

    // Handle text response
    if (response.serverContent?.modelTurn?.parts) {
      response.serverContent.modelTurn.parts.forEach(part => {
        if (part.text) {
          appendLiveTranscript('ai', part.text);
        }
        if (part.inlineData) {
          // Audio response — play it
          playLiveAudioResponse(part.inlineData.data, part.inlineData.mimeType);
        }
      });
    }

    // Handle turn complete
    if (response.serverContent?.turnComplete) {
      const liveIndicator = document.getElementById('liveIndicator');
      if (liveIndicator) liveIndicator.classList.remove('speaking');
    }

    // Handle setup complete
    if (response.setupComplete) {
      console.log('Live API setup complete');
    }

  } catch (err) {
    console.warn('Live response parse error:', err);
  }
}

/**
 * Phát audio response từ AI
 */
function playLiveAudioResponse(base64Audio, mimeType) {
  try {
    const audioData = atob(base64Audio);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }

    const audioBlob = new Blob([arrayBuffer], { type: mimeType || 'audio/pcm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    const liveIndicator = document.getElementById('liveIndicator');
    if (liveIndicator) liveIndicator.classList.add('speaking');

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (liveIndicator) liveIndicator.classList.remove('speaking');
    };
    audio.play().catch(e => console.warn('Audio play error:', e));

  } catch (err) {
    console.warn('Live audio playback error:', err);
  }
}

/**
 * Thêm transcript vào Live chat display
 */
function appendLiveTranscript(role, text) {
  const container = document.getElementById('liveTranscript');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `live-msg ${role}`;
  msgDiv.innerHTML = `<span class="live-role">${role === 'ai' ? '🤖 AI' : '🗣️ Bạn'}:</span> ${escapeHtml(text)}`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

/**
 * Dừng Live Voice Chat
 */
function stopLiveVoiceChat() {
  if (liveWebSocket) {
    try { liveWebSocket.close(); } catch (e) { /* ignore */ }
    liveWebSocket = null;
  }
  cleanupLiveAudio();

  const statusEl = document.getElementById('liveStatus');
  const startBtn = document.getElementById('liveBtnStart');
  const stopBtn = document.getElementById('liveBtnStop');

  if (statusEl) statusEl.textContent = '⚪ Đã dừng';
  if (startBtn) { startBtn.classList.remove('hidden'); startBtn.disabled = false; }
  if (stopBtn) stopBtn.classList.add('hidden');
}

/**
 * Cleanup audio resources
 */
function cleanupLiveAudio() {
  if (liveProcessor) {
    try { liveProcessor.disconnect(); } catch (e) { /* ignore */ }
    liveProcessor = null;
  }
  if (liveAudioContext) {
    try { liveAudioContext.close(); } catch (e) { /* ignore */ }
    liveAudioContext = null;
  }
  if (liveMediaStream) {
    liveMediaStream.getTracks().forEach(t => t.stop());
    liveMediaStream = null;
  }
}

/**
 * Fallback: Voice chat dùng Web Speech API
 */
function startFallbackVoiceChat() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Trình duyệt không hỗ trợ voice chat.', 'error');
    return;
  }

  showToast('Đang dùng chế độ fallback (Web Speech API).', 'info');

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'vi-VN';

  const statusEl = document.getElementById('liveStatus');
  const startBtn = document.getElementById('liveBtnStart');
  const stopBtn = document.getElementById('liveBtnStop');

  if (statusEl) statusEl.textContent = '🎤 Đang nghe (Fallback mode)...';
  if (startBtn) startBtn.classList.add('hidden');
  if (stopBtn) stopBtn.classList.remove('hidden');

  STATE.fallbackRecognition = recognition;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    appendLiveTranscript('user', transcript);

    if (statusEl) statusEl.textContent = '🤔 Đang suy nghĩ...';

    try {
      // Call Gemini for text response
      const result = await callGemini(transcript);
      appendLiveTranscript('ai', result);

      // Use Browser TTS to speak response
      const utterance = new SpeechSynthesisUtterance(result.substring(0, 500));
      utterance.lang = 'vi-VN';
      utterance.rate = 1.1;
      utterance.onend = () => {
        // Listen again after speaking
        if (STATE.fallbackRecognition) {
          try { recognition.start(); } catch (e) { /* ignore */ }
          if (statusEl) statusEl.textContent = '🎤 Đang nghe...';
        }
      };
      speechSynthesis.speak(utterance);
      if (statusEl) statusEl.textContent = '🔊 Đang nói...';

    } catch (err) {
      appendLiveTranscript('ai', '❌ Lỗi: ' + err.message);
      if (statusEl) statusEl.textContent = '🎤 Đang nghe...';
      try { recognition.start(); } catch (e) { /* ignore */ }
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.error('Fallback STT error:', event.error);
    }
    // Restart listening
    if (STATE.fallbackRecognition) {
      setTimeout(() => {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }, 500);
    }
  };

  recognition.onend = () => {
    if (STATE.fallbackRecognition) {
      setTimeout(() => {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }, 300);
    }
  };

  // Override stop button for fallback mode
  const origStop = stopLiveVoiceChat;
  document.getElementById('liveBtnStop').onclick = () => {
    STATE.fallbackRecognition = null;
    try { recognition.stop(); } catch (e) { /* ignore */ }
    speechSynthesis.cancel();
    origStop();
  };

  try {
    recognition.start();
  } catch (e) {
    showToast('Không thể bắt đầu nhận diện giọng nói.', 'error');
  }
}


// ==============================================================
// SECTION 44: EXPORT / IMPORT SESSION (Enhancement)
// ==============================================================

/**
 * Export toàn bộ session hiện tại
 */
function exportSession() {
  const format = document.getElementById('exportFormat')?.value || 'json';

  const sessionData = {
    app: 'TuongTanDigital-AI',
    version: APP_VERSION,
    exportDate: new Date().toISOString(),
    notebook: STATE.currentNotebook,
    sources: STATE.sources.map(s => ({
      ...s,
      // Exclude large binary data for markdown/text export
      ...(format !== 'json' ? { data: undefined, base64: undefined } : {})
    })),
    chatHistory: STATE.chatHistory,
    pinnedNotes: STATE.pinnedNotes,
    flashcards: STATE.flashcards,
    glossary: STATE.glossary
  };

  switch (format) {
    case 'md': {
      let md = `# 📒 ${STATE.currentNotebook?.name || 'Notebook'}\n`;
      md += `_Xuất từ TuongTanDigital-AI — ${new Date().toLocaleString('vi-VN')}_\n\n---\n\n`;

      // Sources
      md += `## 📚 Nguồn tài liệu (${STATE.sources.length})\n\n`;
      STATE.sources.forEach((s, i) => {
        md += `### ${i + 1}. ${s.name}\n`;
        if (s.summary30) md += `> ${s.summary30}\n`;
        md += '\n';
      });

      // Chat
      md += `## 💬 Lịch sử chat\n\n`;
      (STATE.chatHistory || []).forEach(msg => {
        md += `**${msg.role === 'user' ? '👤 Bạn' : '🤖 AI'}:** ${msg.content}\n\n`;
      });

      // Notes
      if (STATE.pinnedNotes?.length) {
        md += `## 📌 Ghi chú ghim (${STATE.pinnedNotes.length})\n\n`;
        STATE.pinnedNotes.forEach((n, i) => {
          md += `### ${i + 1}. [${n.tag}] ${n.source}\n${n.text}\n\n`;
        });
      }

      downloadBlob(new Blob([md], { type: 'text/markdown' }), 'session.md');
      break;
    }
    case 'html': {
      let html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
        <title>${escapeHtml(STATE.currentNotebook?.name || 'Notebook')} — TuongTanDigital-AI</title>
        <style>body{font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:0 auto;padding:20px;line-height:1.6;color:#333}
        .user{background:#e3f2fd;padding:12px;border-radius:12px;margin:8px 0}.ai{background:#f5f5f5;padding:12px;border-radius:12px;margin:8px 0}
        h1{color:#0891b2}h2{color:#333;border-bottom:2px solid #0891b2;padding-bottom:8px}
        .note{border-left:4px solid #3498db;padding:8px 16px;margin:8px 0;background:#fafafa}
        .footer{text-align:center;color:#999;margin-top:40px;font-size:0.85em}</style></head><body>`;

      html += `<h1>📒 ${escapeHtml(STATE.currentNotebook?.name || 'Notebook')}</h1>`;
      html += `<p><em>Xuất từ TuongTanDigital-AI — ${new Date().toLocaleString('vi-VN')}</em></p><hr>`;

      html += `<h2>📚 Nguồn tài liệu (${STATE.sources.length})</h2><ul>`;
      STATE.sources.forEach(s => { html += `<li><strong>${escapeHtml(s.name)}</strong></li>`; });
      html += `</ul>`;

      html += `<h2>💬 Lịch sử chat</h2>`;
      (STATE.chatHistory || []).forEach(msg => {
        html += `<div class="${msg.role}"><strong>${msg.role === 'user' ? '👤 Bạn' : '🤖 AI'}:</strong> ${md2html(msg.content)}</div>`;
      });

      if (STATE.pinnedNotes?.length) {
        html += `<h2>📌 Ghi chú ghim</h2>`;
        STATE.pinnedNotes.forEach(n => {
          html += `<div class="note"><strong>[${escapeHtml(n.tag)}]</strong> ${md2html(n.text)}</div>`;
        });
      }

      html += `<div class="footer">© 2025-${new Date().getFullYear()} TuongTanDigital. All rights reserved.</div>`;
      html += `</body></html>`;

      downloadBlob(new Blob([html], { type: 'text/html' }), 'session.html');
      break;
    }
    case 'docx': {
      // Use DOCX export engine
      let content = `# ${STATE.currentNotebook?.name || 'Notebook'}\n\n`;
      (STATE.chatHistory || []).forEach(msg => {
        content += `## ${msg.role === 'user' ? 'Bạn' : 'AI'}\n${msg.content}\n\n`;
      });
      exportToDOCX(content, 'session');
      return; // exportToDOCX handles download
    }
    case 'txt': {
      let text = `${STATE.currentNotebook?.name || 'Notebook'}\n`;
      text += `Xuất từ TuongTanDigital-AI — ${new Date().toLocaleString('vi-VN')}\n`;
      text += '='.repeat(60) + '\n\n';

      text += `NGUỒN TÀI LIỆU (${STATE.sources.length}):\n`;
      STATE.sources.forEach((s, i) => { text += `  ${i + 1}. ${s.name}\n`; });
      text += '\n' + '-'.repeat(40) + '\n\n';

      text += `LỊCH SỬ CHAT:\n\n`;
      (STATE.chatHistory || []).forEach(msg => {
        text += `[${msg.role === 'user' ? 'BẠN' : 'AI'}]: ${msg.content}\n\n`;
      });

      downloadBlob(new Blob([text], { type: 'text/plain' }), 'session.txt');
      break;
    }
    default: {
      // JSON — full data
      const json = JSON.stringify(sessionData, null, 2);
      downloadBlob(new Blob([json], { type: 'application/json' }), 'session.json');
    }
  }

  showToast('Đã xuất session!', 'success');
}

/**
 * Import session từ file JSON
 */
function importSession() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.app !== 'TuongTanDigital-AI') {
        showToast('File không phải session TuongTanDigital-AI.', 'error');
        return;
      }

      if (!confirm('Import session sẽ thay thế dữ liệu hiện tại. Tiếp tục?')) return;

      // Restore data
      if (data.notebook) STATE.currentNotebook = data.notebook;
      if (data.sources) STATE.sources = data.sources;
      if (data.chatHistory) STATE.chatHistory = data.chatHistory;
      if (data.pinnedNotes) STATE.pinnedNotes = data.pinnedNotes;
      if (data.flashcards) STATE.flashcards = data.flashcards;
      if (data.glossary) STATE.glossary = data.glossary;

      // Re-render everything
      renderSourceList();
      renderChatHistory();
      updateNotesBadge();
      saveCurrentSession();

      showToast(`Đã import session từ ${file.name}!`, 'success');

    } catch (err) {
      console.error('Import error:', err);
      showToast('Lỗi import: ' + err.message, 'error');
    }
  };

  input.click();
}

/**
 * Render lại chat history từ STATE
 */
function renderChatHistory() {
  const container = document.querySelector('.chat-messages');
  if (!container) return;
  container.innerHTML = '';

  (STATE.chatHistory || []).forEach(msg => {
    addChatMessage(msg.role, msg.content, false, true); // true = skipSave
  });
}


// ==============================================================
// SECTION 45: WATERMARK CHO FILE EXPORT (T-B1)
// ==============================================================

/**
 * Thêm watermark text vào đầu/cuối content export
 */
function addExportWatermark(content, format) {
  const watermark = `© ${new Date().getFullYear()} TuongTanDigital-AI — AI Suite Powered by Gemini`;

  switch (format) {
    case 'md':
      return `${content}\n\n---\n_${watermark}_`;
    case 'html':
      return `${content}<footer style="text-align:center;color:#999;margin-top:2em;font-size:0.8em;border-top:1px solid #eee;padding-top:1em">${escapeHtml(watermark)}</footer>`;
    case 'txt':
      return `${content}\n\n${'─'.repeat(50)}\n${watermark}`;
    default:
      return content;
  }
}


// ==============================================================
// SECTION 46: PERSONA SELECTOR PROMPTS (T-N7)
// Các system prompt cho từng persona
// ==============================================================

const PERSONA_PROMPTS = {
  default: {
    label: '🤖 Mặc định',
    prompt: 'Bạn là trợ lý AI thông minh, trả lời chính xác và hữu ích dựa trên tài liệu nguồn.'
  },
  professor: {
    label: '👨‍🏫 Giáo sư',
    prompt: 'Bạn là một giáo sư đại học uyên bác. Trả lời chuyên sâu, có dẫn chứng học thuật, phân tích nhiều góc độ, và đặt câu hỏi mở rộng tư duy. Sử dụng thuật ngữ chuyên ngành khi cần nhưng luôn giải thích rõ.'
  },
  friend: {
    label: '🤝 Bạn bè',
    prompt: 'Bạn là một người bạn thân thiện, vui vẻ. Trả lời tự nhiên, dùng ngôn ngữ đời thường, có ví dụ gần gũi. Đôi khi pha trò nhẹ để cuộc trò chuyện thú vị hơn.'
  },
  expert: {
    label: '🎯 Chuyên gia',
    prompt: 'Bạn là chuyên gia hàng đầu trong lĩnh vực liên quan đến tài liệu. Trả lời cực kỳ chi tiết, chính xác, có số liệu cụ thể. Đưa ra nhận định chuyên môn sâu và khuyến nghị thực tiễn.'
  },
  journalist: {
    label: '📰 Phóng viên',
    prompt: 'Bạn là phóng viên điều tra sắc sảo. Phân tích thông tin từ nhiều góc độ, đặt câu hỏi "Ai? Cái gì? Khi nào? Ở đâu? Tại sao? Như thế nào?". Tìm kiếm sự thật, chỉ ra mâu thuẫn, và trình bày khách quan.'
  },
  tutor: {
    label: '👩‍🏫 Gia sư',
    prompt: 'Bạn là gia sư kiên nhẫn và giỏi giải thích. Chia nhỏ kiến thức phức tạp thành từng bước dễ hiểu. Sử dụng ví dụ thực tế, so sánh trực quan. Kiểm tra hiểu biết bằng câu hỏi sau mỗi phần. Khuyến khích và động viên.'
  },
  creative: {
    label: '🎨 Sáng tạo',
    prompt: 'Bạn là một nhà tư duy sáng tạo. Nhìn mọi thứ từ góc độ mới lạ, liên kết ý tưởng bất ngờ, đề xuất giải pháp sáng tạo. Sử dụng ẩn dụ, câu chuyện, và tư duy đột phá.'
  },
  critic: {
    label: '🔍 Phản biện',
    prompt: 'Bạn là nhà phê bình sắc sảo và công bằng. Phân tích cả mặt mạnh và yếu. Chỉ ra lỗi logic, bias, thiếu sót trong luận điểm. Luôn yêu cầu bằng chứng và so sánh với quan điểm đối lập.'
  }
};

/**
 * Lấy system prompt theo persona hiện tại
 */
function getPersonaSystemPrompt() {
  const persona = STATE.currentPersona || 'default';
  return PERSONA_PROMPTS[persona]?.prompt || PERSONA_PROMPTS.default.prompt;
}

/**
 * Thay đổi persona
 */
function changePersona(persona) {
  STATE.currentPersona = persona;
  localStorage.setItem('persona', persona);

  const label = PERSONA_PROMPTS[persona]?.label || '🤖 Mặc định';
  showToast(`Đã chuyển persona: ${label}`, 'success');

  // Update UI selector
  const selector = document.getElementById('personaSelector');
  if (selector) selector.value = persona;
}

/**
 * Render persona selector
 */
function renderPersonaSelector() {
  const selector = document.getElementById('personaSelector');
  if (!selector) return;

  selector.innerHTML = Object.entries(PERSONA_PROMPTS).map(([key, val]) =>
    `<option value="${key}" ${STATE.currentPersona === key ? 'selected' : ''}>${val.label}</option>`
  ).join('');

  selector.addEventListener('change', () => changePersona(selector.value));
}


// ==============================================================
// SECTION 47: INIT PART 2 — Bind tất cả events cho Part 2
// ==============================================================

/**
 * Khởi tạo tất cả modules trong Part 2
 */
function initPart2() {
  // STT
  initSTT();

  // TTS
  initTTS();

  // Screen Recording
  initRecording();

  // File Conversion
  initConvert();

  // Flashcard
  initFlashcard();

  // Notes Board
  initNotesBoard();

  // Writing Assistant
  initWritingAssistant();

  // Live Voice Chat
  initLiveVoiceChat();

  // Persona Selector
  STATE.currentPersona = localStorage.getItem('persona') || 'default';
  renderPersonaSelector();

  // Quick Action buttons
  document.querySelectorAll('[data-quick-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.quickAction;
      if (action) handleQuickAction(action);
    });
  });

  // Flashcard generate from Quick Action
  document.getElementById('btnGenerateFlashcard')?.addEventListener('click', generateFlashcards);

  // Quiz generate
  document.getElementById('btnGenerateQuiz')?.addEventListener('click', generateQuiz);

  // Glossary generate
  document.getElementById('btnGenerateGlossary')?.addEventListener('click', generateGlossary);

  // Podcast generate
  document.getElementById('btnGeneratePodcast')?.addEventListener('click', generatePodcast);
  document.getElementById('podcastBtnDownload')?.addEventListener('click', downloadPodcast);

  // Comparison
  document.getElementById('btnCompareDocuments')?.addEventListener('click', compareDocuments);

  // Sentiment
  document.getElementById('btnAnalyzeSentiment')?.addEventListener('click', analyzeSentiment);

  // Citation
  document.getElementById('btnGenerateCitation')?.addEventListener('click', generateCitations);

  // YouTube import
  document.getElementById('btnImportYoutube')?.addEventListener('click', importYouTubeTranscript);

  // Template prompts
  document.getElementById('btnTemplatePrompts')?.addEventListener('click', openTemplatePrompts);

  // Notes board
  document.getElementById('btnNotesBoard')?.addEventListener('click', openNotesBoard);

  // Export/Import session
  document.getElementById('btnExportSession')?.addEventListener('click', exportSession);
  document.getElementById('btnImportSession')?.addEventListener('click', importSession);

  // Glossary search
  document.getElementById('glossarySearch')?.addEventListener('input', searchGlossary);

  // Citation
  document.getElementById('btnCopyCitation')?.addEventListener('click', copyCitations);

  console.log('✅ Part 2 initialized: STT, TTS, Record, Convert, Quick Actions, Flashcard, Quiz, Glossary, Podcast, Citations, Sentiment, Notes, YouTube, Templates, Persona, Live Voice, Export/Import');
}


// ==============================================================
// END OF APP.JS — PART 2/3
// ==============================================================
// Tiếp theo: Part 3 sẽ triển khai:
// - Settings panel (theme, font, API management)
// - History manager
// - Command Palette (T-N3)
// - Keyboard Shortcuts (T-U3)
// - Onboarding Tour (T-U2)
// - Help System (T-H1, T-H2)
// - Font Selector (T-U10)
// - Full-text Search (T-U6)
// - Focus Mode details (T-U8)
// - Skeleton Loading (T-U9)
// - PWA Init (T-N10)
// - Master Init function — DOMContentLoaded
// ==============================================================

// ==============================================================
// APP.JS — PART 3/3
// SETTINGS, HISTORY, COMMAND PALETTE, KEYBOARD SHORTCUTS,
// ONBOARDING TOUR, HELP SYSTEM, FONT SELECTOR, FULL-TEXT
// SEARCH, FOCUS MODE, SKELETON LOADING, SOURCE TAGS,
// BOTTOM NAV, PWA INIT, MASTER INIT
// ==============================================================
// Tasks: T-B1(init), T-F2, T-F5(restore), T-F7, T-N3, T-N9,
//   T-N10, T-U1–T-U10, T-H1, T-H2, Master DOMContentLoaded
// ==============================================================


// ==============================================================
// SECTION 48: SETTINGS PANEL
// Theme, Font, API, Persona, General preferences
// ==============================================================

/**
 * Khởi tạo Settings panel
 */
function initSettings() {
  // Theme selector
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      setTheme(theme);
      document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Dark mode toggle
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.checked = STATE.darkMode || false;
    darkToggle.addEventListener('change', () => toggleDarkMode(darkToggle.checked));
  }

  // Header dark mode button
  document.getElementById('btnDarkMode')?.addEventListener('click', () => {
    const newState = !STATE.darkMode;
    toggleDarkMode(newState);
    if (darkToggle) darkToggle.checked = newState;
  });

  // Font selector (T-U10)
  const fontSelect = document.getElementById('fontSelector');
  if (fontSelect) {
    fontSelect.value = STATE.fontFamily || 'system';
    fontSelect.addEventListener('change', () => setFont(fontSelect.value));
  }

  // Clear all data
  document.getElementById('btnClearAllData')?.addEventListener('click', clearAllData);

  // Restore saved settings
  restoreSettings();
}

/**
 * Set theme
 */
function setTheme(theme) {
  // Remove old theme classes
  document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-rose', 'theme-amber');

  if (theme && theme !== 'default') {
    document.body.classList.add(`theme-${theme}`);
  }

  STATE.theme = theme;
  localStorage.setItem('theme', theme);
  showToast(`Giao diện: ${getThemeLabel(theme)}`, 'success');
}

function getThemeLabel(theme) {
  const labels = {
    default: 'Mặc định', ocean: 'Đại dương', forest: 'Rừng xanh',
    rose: 'Hồng', amber: 'Hoàng hôn'
  };
  return labels[theme] || theme;
}

/**
 * Toggle dark mode
 */
function toggleDarkMode(enabled) {
  STATE.darkMode = enabled;
  document.body.classList.toggle('dark-mode', enabled);
  localStorage.setItem('darkMode', enabled ? '1' : '0');

  const btnIcon = document.querySelector('#btnDarkMode .icon');
  if (btnIcon) btnIcon.textContent = enabled ? '☀️' : '🌙';
}

/**
 * Set font (T-U10)
 */
function setFont(fontKey) {
  // Remove all font classes
  document.body.classList.remove('font-inter', 'font-merriweather', 'font-firacode', 'font-bevietnam');

  const fontMap = {
    system: null,
    inter: 'font-inter',
    merriweather: 'font-merriweather',
    firacode: 'font-firacode',
    bevietnam: 'font-bevietnam'
  };

  if (fontMap[fontKey]) {
    document.body.classList.add(fontMap[fontKey]);
    // Lazy load Google Font
    loadGoogleFont(fontKey);
  }

  STATE.fontFamily = fontKey;
  localStorage.setItem('fontFamily', fontKey);
  showToast(`Font: ${getFontLabel(fontKey)}`, 'success');
}

function getFontLabel(key) {
  const labels = {
    system: 'Hệ thống (Segoe UI)', inter: 'Inter', merriweather: 'Merriweather',
    firacode: 'Fira Code', bevietnam: 'Be Vietnam Pro'
  };
  return labels[key] || key;
}

/**
 * Lazy load Google Fonts (T-U10)
 */
function loadGoogleFont(fontKey) {
  const fontUrls = {
    inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    firacode: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
    bevietnam: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
  };

  const url = fontUrls[fontKey];
  if (!url) return;

  // Check if already loaded
  if (document.querySelector(`link[href="${url}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Restore saved settings
 */
function restoreSettings() {
  // Theme
  const savedTheme = localStorage.getItem('theme') || 'default';
  STATE.theme = savedTheme;
  if (savedTheme !== 'default') {
    document.body.classList.add(`theme-${savedTheme}`);
  }
  document.querySelector(`[data-theme="${savedTheme}"]`)?.classList.add('active');

  // Dark mode
  const savedDark = localStorage.getItem('darkMode') === '1';
  STATE.darkMode = savedDark;
  if (savedDark) document.body.classList.add('dark-mode');
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = savedDark;

  // Font
  const savedFont = localStorage.getItem('fontFamily') || 'system';
  STATE.fontFamily = savedFont;
  if (savedFont !== 'system') {
    setFont(savedFont);
  }
  const fontSelect = document.getElementById('fontSelector');
  if (fontSelect) fontSelect.value = savedFont;

  // Persona
  STATE.currentPersona = localStorage.getItem('persona') || 'default';
}

/**
 * Clear all data
 */
async function clearAllData() {
  if (!confirm('Xóa TẤT CẢ dữ liệu ứng dụng? Hành động này không thể hoàn tác.')) return;
  if (!confirm('Xác nhận lần cuối: Xóa hết notebooks, nguồn, chat, ghi chú, flashcard, settings?')) return;

  try {
    // Clear IndexedDB
    const dbNames = ['TuongTanDigitalAI'];
    for (const name of dbNames) {
      await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = resolve;
        req.onerror = reject;
      });
    }

    // Clear localStorage
    localStorage.clear();

    // Reset STATE
    Object.keys(STATE).forEach(key => {
      if (Array.isArray(STATE[key])) STATE[key] = [];
      else if (typeof STATE[key] === 'object' && STATE[key] !== null) STATE[key] = {};
      else if (typeof STATE[key] === 'boolean') STATE[key] = false;
      else if (typeof STATE[key] === 'number') STATE[key] = 0;
      else STATE[key] = null;
    });

    showToast('Đã xóa tất cả dữ liệu. Trang sẽ reload.', 'info');
    setTimeout(() => location.reload(), 1500);

  } catch (err) {
    console.error('Clear all data error:', err);
    showToast('Lỗi xóa dữ liệu: ' + err.message, 'error');
  }
}


// ==============================================================
// SECTION 49: HISTORY MANAGER
// Quản lý lịch sử chat sessions
// ==============================================================

/**
 * Khởi tạo History
 */
function initHistory() {
  document.getElementById('btnHistory')?.addEventListener('click', openHistory);
  document.getElementById('btnClearHistory')?.addEventListener('click', clearHistory);
  document.getElementById('historySearch')?.addEventListener('input', filterHistory);
}

/**
 * Mở History overlay
 */
function openHistory() {
  renderHistoryList();
  openOverlay('historyOverlay');
}

/**
 * Lưu session hiện tại vào history
 */
function saveToHistory() {
  if (!STATE.chatHistory?.length) return;

  const historyList = JSON.parse(localStorage.getItem('chatHistoryList') || '[]');

  const entry = {
    id: generateId(),
    notebookName: STATE.currentNotebook?.name || 'Notebook',
    date: new Date().toISOString(),
    messageCount: STATE.chatHistory.length,
    preview: STATE.chatHistory[STATE.chatHistory.length - 1]?.content?.substring(0, 150) || '',
    sources: STATE.sources.map(s => s.name),
    chatHistory: STATE.chatHistory
  };

  // Keep max 50 entries
  historyList.unshift(entry);
  if (historyList.length > 50) historyList.pop();

  localStorage.setItem('chatHistoryList', JSON.stringify(historyList));
}

/**
 * Render danh sách history
 */
function renderHistoryList(filter = '') {
  const container = document.getElementById('historyList');
  if (!container) return;

  const historyList = JSON.parse(localStorage.getItem('chatHistoryList') || '[]');

  const filtered = filter
    ? historyList.filter(h =>
        h.notebookName.toLowerCase().includes(filter.toLowerCase()) ||
        h.preview.toLowerCase().includes(filter.toLowerCase()) ||
        h.sources?.some(s => s.toLowerCase().includes(filter.toLowerCase()))
      )
    : historyList;

  if (!filtered.length) {
    container.innerHTML = '<p class="text-muted text-center">Chưa có lịch sử cuộc trò chuyện.</p>';
    return;
  }

  container.innerHTML = filtered.map(h => `
    <div class="history-item" data-id="${h.id}">
      <div class="history-item-header">
        <h4>${escapeHtml(h.notebookName)}</h4>
        <span class="history-date">${new Date(h.date).toLocaleString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}</span>
      </div>
      <p class="history-preview">${escapeHtml(h.preview)}${h.preview.length >= 150 ? '...' : ''}</p>
      <div class="history-meta">
        <span>${h.messageCount} tin nhắn</span>
        <span>${h.sources?.length || 0} nguồn</span>
      </div>
      <div class="history-actions">
        <button class="btn btn-sm btn-primary" onclick="restoreHistory('${h.id}')">📂 Mở lại</button>
        <button class="btn btn-sm btn-danger" onclick="deleteHistoryEntry('${h.id}')">🗑️ Xóa</button>
      </div>
    </div>
  `).join('');
}

/**
 * Filter history
 */
function filterHistory() {
  const query = document.getElementById('historySearch')?.value || '';
  renderHistoryList(query);
}

/**
 * Restore 1 entry từ history
 */
function restoreHistory(entryId) {
  const historyList = JSON.parse(localStorage.getItem('chatHistoryList') || '[]');
  const entry = historyList.find(h => h.id === entryId);
  if (!entry) return;

  if (STATE.chatHistory?.length && !confirm('Mở lại sẽ thay thế cuộc trò chuyện hiện tại. Tiếp tục?')) return;

  STATE.chatHistory = entry.chatHistory || [];
  renderChatHistory();
  closeOverlay('historyOverlay');
  switchTab('notebook');
  showToast(`Đã khôi phục: ${entry.notebookName}`, 'success');
}

/**
 * Xóa 1 entry
 */
function deleteHistoryEntry(entryId) {
  let historyList = JSON.parse(localStorage.getItem('chatHistoryList') || '[]');
  historyList = historyList.filter(h => h.id !== entryId);
  localStorage.setItem('chatHistoryList', JSON.stringify(historyList));
  renderHistoryList();
  showToast('Đã xóa.', 'info');
}

/**
 * Xóa tất cả history
 */
function clearHistory() {
  if (!confirm('Xóa toàn bộ lịch sử cuộc trò chuyện?')) return;
  localStorage.removeItem('chatHistoryList');
  renderHistoryList();
  showToast('Đã xóa lịch sử.', 'info');
}


// ==============================================================
// SECTION 50: COMMAND PALETTE (T-N3)
// Ctrl+P — fuzzy search all commands, sources, tabs
// ==============================================================

const COMMAND_PALETTE_COMMANDS = [
  // Tab navigation
  { id: 'tab-notebook', label: 'Chuyển tab Notebook AI', icon: '📒', category: 'Navigation', action: () => switchTab('notebook') },
  { id: 'tab-stt', label: 'Chuyển tab Speech-to-Text', icon: '🎤', category: 'Navigation', action: () => switchTab('stt') },
  { id: 'tab-tts', label: 'Chuyển tab Text-to-Speech', icon: '🔊', category: 'Navigation', action: () => switchTab('tts') },
  { id: 'tab-record', label: 'Chuyển tab Ghi màn hình', icon: '🎬', category: 'Navigation', action: () => switchTab('record') },
  { id: 'tab-convert', label: 'Chuyển tab Chuyển đổi file', icon: '🔄', category: 'Navigation', action: () => switchTab('convert') },
  { id: 'tab-settings', label: 'Chuyển tab Cài đặt', icon: '⚙️', category: 'Navigation', action: () => switchTab('settings') },

  // Quick actions
  { id: 'qa-summary', label: 'Tóm tắt tài liệu', icon: '📝', category: 'Quick Action', action: () => handleQuickAction('summary') },
  { id: 'qa-keypoints', label: 'Trích xuất ý chính', icon: '🔑', category: 'Quick Action', action: () => handleQuickAction('keypoints') },
  { id: 'qa-faq', label: 'Tạo FAQ', icon: '❓', category: 'Quick Action', action: () => handleQuickAction('faq') },
  { id: 'qa-timeline', label: 'Tạo Timeline', icon: '📅', category: 'Quick Action', action: () => handleQuickAction('timeline') },
  { id: 'qa-mindmap', label: 'Tạo Mind Map', icon: '🗺️', category: 'Quick Action', action: () => handleQuickAction('mindmap') },
  { id: 'qa-flashcard', label: 'Tạo Flashcard', icon: '🃏', category: 'Quick Action', action: () => generateFlashcards() },
  { id: 'qa-quiz', label: 'Tạo Quiz', icon: '📋', category: 'Quick Action', action: () => generateQuiz() },
  { id: 'qa-glossary', label: 'Tạo Bảng thuật ngữ', icon: '📖', category: 'Quick Action', action: () => generateGlossary() },
  { id: 'qa-podcast', label: 'Tạo Podcast AI', icon: '🎙️', category: 'Quick Action', action: () => { openOverlay('podcastOverlay'); } },
  { id: 'qa-compare', label: 'So sánh tài liệu', icon: '📊', category: 'Quick Action', action: () => compareDocuments() },
  { id: 'qa-sentiment', label: 'Phân tích cảm xúc', icon: '🎭', category: 'Quick Action', action: () => analyzeSentiment() },

  // Sources
  { id: 'src-upload', label: 'Upload tài liệu nguồn', icon: '📁', category: 'Source', action: () => document.getElementById('sourceFileInput')?.click() },
  { id: 'src-url', label: 'Thêm nguồn từ URL', icon: '🔗', category: 'Source', action: () => openOverlay('urlSourceOverlay') },
  { id: 'src-text', label: 'Nhập văn bản trực tiếp', icon: '📝', category: 'Source', action: () => openOverlay('textSourceOverlay') },
  { id: 'src-youtube', label: 'Import YouTube Transcript', icon: '🎬', category: 'Source', action: () => openYouTubeImport() },

  // Tools
  { id: 'tool-prompts', label: 'Thư viện Prompt', icon: '📚', category: 'Tool', action: () => openTemplatePrompts() },
  { id: 'tool-notes', label: 'Ghi chú & Ghim', icon: '📌', category: 'Tool', action: () => openNotesBoard() },
  { id: 'tool-citation', label: 'Tạo trích dẫn', icon: '📑', category: 'Tool', action: () => openCitationGenerator() },
  { id: 'tool-export', label: 'Xuất session', icon: '📥', category: 'Tool', action: () => openOverlay('exportOverlay') },
  { id: 'tool-import', label: 'Nhập session', icon: '📤', category: 'Tool', action: () => importSession() },
  { id: 'tool-history', label: 'Lịch sử chat', icon: '🕐', category: 'Tool', action: () => openHistory() },

  // View
  { id: 'view-focus', label: 'Chế độ tập trung (Focus Mode)', icon: '🎯', category: 'View', action: () => toggleFocusMode() },
  { id: 'view-split', label: 'Chế độ chia đôi (Split View)', icon: '⬜', category: 'View', action: () => toggleSplitView() },
  { id: 'view-sidebar', label: 'Bật/tắt Sidebar', icon: '📂', category: 'View', action: () => toggleSidebar() },
  { id: 'view-dark', label: 'Bật/tắt Dark Mode', icon: '🌙', category: 'View', action: () => toggleDarkMode(!STATE.darkMode) },
  { id: 'view-shortcuts', label: 'Xem phím tắt', icon: '⌨️', category: 'View', action: () => openOverlay('shortcutsOverlay') },

  // Help
  { id: 'help-guide', label: 'Hướng dẫn sử dụng', icon: '📖', category: 'Help', action: () => openOverlay('helpOverlay') },
  { id: 'help-tour', label: 'Tour hướng dẫn', icon: '🚀', category: 'Help', action: () => startOnboardingTour() },
];

/**
 * Mở Command Palette
 */
function openCommandPalette() {
  const overlay = document.getElementById('commandPaletteOverlay');
  const input = document.getElementById('commandPaletteInput');
  const list = document.getElementById('commandPaletteList');

  if (!overlay) return;
  openOverlay('commandPaletteOverlay');

  // Reset and focus
  if (input) {
    input.value = '';
    input.focus();
  }

  // Render default commands
  renderCommandPaletteResults('', list);

  // Bind events
  input?.addEventListener('input', () => {
    renderCommandPaletteResults(input.value, list);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay('commandPaletteOverlay');
      return;
    }
    if (e.key === 'Enter') {
      const first = list?.querySelector('.cmd-item.highlighted, .cmd-item:first-child');
      if (first) first.click();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigateCommandPalette(e.key === 'ArrowDown' ? 1 : -1, list);
    }
  });
}

/**
 * Render kết quả command palette
 */
function renderCommandPaletteResults(query, list) {
  if (!list) return;

  let commands = COMMAND_PALETTE_COMMANDS;

  // Add dynamic source commands
  STATE.sources.forEach((s, i) => {
    commands = [...commands, {
      id: `src-view-${i}`, label: `Xem nguồn: ${s.name}`, icon: '📄',
      category: 'Source', action: () => previewSource(i)
    }];
  });

  // Fuzzy filter
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    commands = commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.icon + ' ' + cmd.label).toLowerCase().includes(q)
    );
  }

  // Limit to 15 results
  commands = commands.slice(0, 15);

  if (!commands.length) {
    list.innerHTML = '<p class="text-muted text-center">Không tìm thấy lệnh nào.</p>';
    return;
  }

  // Group by category
  const groups = {};
  commands.forEach(cmd => {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  });

  let html = '';
  let isFirst = true;
  Object.entries(groups).forEach(([cat, cmds]) => {
    html += `<div class="cmd-group-label">${cat}</div>`;
    cmds.forEach(cmd => {
      html += `<div class="cmd-item ${isFirst ? 'highlighted' : ''}" data-cmd="${cmd.id}"
                   onclick="executeCommand('${cmd.id}')">
        <span class="cmd-icon">${cmd.icon}</span>
        <span class="cmd-label">${escapeHtml(cmd.label)}</span>
        <span class="cmd-cat">${cat}</span>
      </div>`;
      isFirst = false;
    });
  });

  list.innerHTML = html;
}

/**
 * Navigate command palette with arrow keys
 */
function navigateCommandPalette(direction, list) {
  if (!list) return;
  const items = list.querySelectorAll('.cmd-item');
  if (!items.length) return;

  let current = list.querySelector('.cmd-item.highlighted');
  let index = current ? Array.from(items).indexOf(current) : -1;

  items.forEach(item => item.classList.remove('highlighted'));
  index += direction;
  if (index < 0) index = items.length - 1;
  if (index >= items.length) index = 0;

  items[index].classList.add('highlighted');
  items[index].scrollIntoView({ block: 'nearest' });
}

/**
 * Execute command
 */
function executeCommand(cmdId) {
  const allCommands = [
    ...COMMAND_PALETTE_COMMANDS,
    ...STATE.sources.map((s, i) => ({
      id: `src-view-${i}`, action: () => previewSource(i)
    }))
  ];

  const cmd = allCommands.find(c => c.id === cmdId);
  if (cmd?.action) {
    closeOverlay('commandPaletteOverlay');
    cmd.action();
  }
}


// ==============================================================
// SECTION 51: KEYBOARD SHORTCUTS (T-U3)
// ==============================================================

const KEYBOARD_SHORTCUTS = {
  'Navigation': [
    { keys: 'Ctrl + 1', description: 'Tab Notebook AI', action: () => switchTab('notebook') },
    { keys: 'Ctrl + 2', description: 'Tab Speech-to-Text', action: () => switchTab('stt') },
    { keys: 'Ctrl + 3', description: 'Tab Text-to-Speech', action: () => switchTab('tts') },
    { keys: 'Ctrl + 4', description: 'Tab Ghi màn hình', action: () => switchTab('record') },
    { keys: 'Ctrl + 5', description: 'Tab Chuyển đổi file', action: () => switchTab('convert') },
    { keys: 'Ctrl + 6', description: 'Tab Cài đặt', action: () => switchTab('settings') },
  ],
  'Lệnh chung': [
    { keys: 'Ctrl + P', description: 'Mở Command Palette', action: () => openCommandPalette() },
    { keys: 'Ctrl + /', description: 'Hiện phím tắt', action: () => openOverlay('shortcutsOverlay') },
    { keys: 'Ctrl + \\', description: 'Toggle Split View', action: () => toggleSplitView() },
    { keys: 'Ctrl + D', description: 'Toggle Dark Mode', action: () => toggleDarkMode(!STATE.darkMode) },
    { keys: 'Ctrl + B', description: 'Toggle Sidebar', action: () => toggleSidebar() },
    { keys: 'F11', description: 'Focus Mode', action: () => toggleFocusMode() },
    { keys: 'Escape', description: 'Đóng overlay / Thoát Focus', action: () => handleEscapeKey() },
    { keys: '?', description: 'Hiện phím tắt (khi không focus input)', action: null },
  ],
  'Chat': [
    { keys: 'Enter', description: 'Gửi tin nhắn', action: null },
    { keys: 'Shift + Enter', description: 'Xuống dòng trong chat', action: null },
    { keys: 'Ctrl + Shift + C', description: 'Copy câu trả lời cuối', action: () => copyLastAIResponse() },
  ],
  'Source': [
    { keys: 'Ctrl + U', description: 'Upload nguồn', action: () => document.getElementById('sourceFileInput')?.click() },
    { keys: 'Ctrl + Shift + U', description: 'Thêm nguồn URL', action: () => openOverlay('urlSourceOverlay') },
    { keys: 'Ctrl + Shift + Y', description: 'Import YouTube', action: () => openYouTubeImport() },
  ]
};

/**
 * Khởi tạo keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', handleGlobalKeydown);
}

/**
 * Xử lý phím tắt toàn cục
 */
function handleGlobalKeydown(e) {
  const activeEl = document.activeElement;
  const isTyping = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );

  // Escape — always works
  if (e.key === 'Escape') {
    handleEscapeKey();
    return;
  }

  // ? — show shortcuts (only when not typing)
  if (e.key === '?' && !isTyping && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    openOverlay('shortcutsOverlay');
    return;
  }

  // Ctrl shortcuts
  if (e.ctrlKey || e.metaKey) {
    const key = e.key.toLowerCase();

    switch (key) {
      case 'p':
        e.preventDefault();
        openCommandPalette();
        return;
      case '/':
        e.preventDefault();
        openOverlay('shortcutsOverlay');
        return;
      case '\\':
        e.preventDefault();
        toggleSplitView();
        return;
      case 'd':
        if (!isTyping) {
          e.preventDefault();
          toggleDarkMode(!STATE.darkMode);
        }
        return;
      case 'b':
        if (!isTyping) {
          e.preventDefault();
          toggleSidebar();
        }
        return;
      case 'u':
        if (e.shiftKey) {
          e.preventDefault();
          openOverlay('urlSourceOverlay');
        } else if (!isTyping) {
          e.preventDefault();
          document.getElementById('sourceFileInput')?.click();
        }
        return;
    }

    // Ctrl + 1-6 — tab switching
    if (key >= '1' && key <= '6' && !isTyping) {
      e.preventDefault();
      const tabs = ['notebook', 'stt', 'tts', 'record', 'convert', 'settings'];
      const idx = parseInt(key) - 1;
      if (tabs[idx]) switchTab(tabs[idx]);
      return;
    }

    // Ctrl + Shift + C — copy last AI response
    if (key === 'c' && e.shiftKey && !isTyping) {
      e.preventDefault();
      copyLastAIResponse();
      return;
    }

    // Ctrl + Shift + Y — YouTube import
    if (key === 'y' && e.shiftKey) {
      e.preventDefault();
      openYouTubeImport();
      return;
    }
  }

  // F11 — focus mode
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFocusMode();
    return;
  }
}

/**
 * Handle Escape key
 */
function handleEscapeKey() {
  // Close any open overlay first
  const openOverlays = document.querySelectorAll('.overlay.active, .popup-overlay.active');
  if (openOverlays.length) {
    openOverlays.forEach(o => o.classList.remove('active'));
    return;
  }

  // Exit focus mode
  if (STATE.focusMode) {
    toggleFocusMode();
    return;
  }
}

/**
 * Copy last AI response
 */
function copyLastAIResponse() {
  const messages = STATE.chatHistory?.filter(m => m.role === 'ai');
  if (messages?.length) {
    copyToClipboard(messages[messages.length - 1].content);
  }
}

/**
 * Render shortcuts cheatsheet (T-U3)
 */
function renderShortcutsCheatsheet() {
  const container = document.getElementById('shortcutsContainer');
  if (!container) return;

  let html = '';
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([group, shortcuts]) => {
    html += `<div class="shortcut-group">
      <h4>${group}</h4>
      <div class="shortcut-grid">`;
    shortcuts.forEach(s => {
      html += `<div class="shortcut-item">
        <kbd>${s.keys}</kbd>
        <span>${s.description}</span>
      </div>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;
}


// ==============================================================
// SECTION 52: ONBOARDING TOUR (T-U2)
// 7-step interactive overlay tour
// ==============================================================

const ONBOARDING_STEPS = [
  {
    target: '.header-logo',
    title: 'Chào mừng đến TuongTanDigital-AI! 🎉',
    description: 'Ứng dụng AI tất-cả-trong-một: Notebook AI, Speech-to-Text, Text-to-Speech, Ghi màn hình, Chuyển đổi file. Hãy bắt đầu khám phá!',
    position: 'bottom'
  },
  {
    target: '#sourcePanel',
    title: '📚 Bước 1: Thêm tài liệu nguồn',
    description: 'Upload PDF, Word, hình ảnh, audio, hoặc nhập văn bản trực tiếp. Hỗ trợ nhiều định dạng. Tối đa 20 nguồn mỗi notebook.',
    position: 'right'
  },
  {
    target: '.chat-input-area',
    title: '💬 Bước 2: Đặt câu hỏi cho AI',
    description: 'Gõ câu hỏi về nội dung tài liệu. AI sẽ trả lời dựa trên nguồn của bạn kèm tham chiếu [Nguồn X]. Thử hỏi "Tóm tắt nội dung chính?"',
    position: 'top'
  },
  {
    target: '.quick-actions',
    title: '⚡ Bước 3: Hành động nhanh',
    description: 'Tóm tắt, Ý chính, FAQ, Timeline, Mind Map, Flashcard, Quiz... chỉ cần 1 click! AI xử lý tất cả tài liệu nguồn của bạn.',
    position: 'top'
  },
  {
    target: '.nav-tabs',
    title: '🔀 Bước 4: Nhiều công cụ',
    description: 'Chuyển đổi giữa các tab: STT (giọng → văn bản), TTS (đọc văn bản), Ghi màn hình + Biên bản AI, Chuyển đổi file hàng loạt.',
    position: 'bottom'
  },
  {
    target: '#btnDarkMode',
    title: '🌙 Bước 5: Tùy chỉnh giao diện',
    description: 'Dark mode, 5 theme màu sắc, 5 loại font, chế độ Focus đọc tập trung. Mọi thứ lưu tự động!',
    position: 'bottom-left'
  },
  {
    target: '#btnHelp',
    title: '📖 Bước 6: Hướng dẫn & Trợ giúp',
    description: 'Nhấn nút "?" bất kỳ lúc nào để xem hướng dẫn chi tiết. Ctrl+P mở Command Palette tìm kiếm nhanh mọi chức năng. Chúc bạn trải nghiệm tuyệt vời!',
    position: 'bottom-left'
  }
];

let currentTourStep = 0;

/**
 * Bắt đầu Onboarding Tour
 */
function startOnboardingTour() {
  currentTourStep = 0;
  showTourStep(0);
}

/**
 * Hiển thị 1 bước tour
 */
function showTourStep(index) {
  // Remove old highlight
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

  const overlay = document.getElementById('onboardingOverlay');
  if (!overlay) return;

  if (index >= ONBOARDING_STEPS.length) {
    // Tour complete
    closeTour();
    localStorage.setItem('onboardingDone', '1');
    showToast('Tour hoàn tất! Bạn đã sẵn sàng sử dụng. 🎉', 'success');
    return;
  }

  const step = ONBOARDING_STEPS[index];
  currentTourStep = index;

  // Highlight target element
  const target = document.querySelector(step.target);
  if (target) {
    target.classList.add('tour-highlight');
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // Position tooltip
  const tooltip = document.getElementById('tourTooltip');
  if (tooltip) {
    tooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <span class="tour-step-count">Bước ${index + 1}/${ONBOARDING_STEPS.length}</span>
        <button class="btn-icon" onclick="closeTour()" title="Bỏ qua">✕</button>
      </div>
      <h4>${step.title}</h4>
      <p>${step.description}</p>
      <div class="tour-tooltip-nav">
        ${index > 0 ? '<button class="btn btn-sm" onclick="showTourStep(currentTourStep - 1)">← Trước</button>' : '<span></span>'}
        <div class="tour-dots">
          ${ONBOARDING_STEPS.map((_, i) => `<span class="tour-dot ${i === index ? 'active' : ''} ${i < index ? 'done' : ''}"></span>`).join('')}
        </div>
        ${index < ONBOARDING_STEPS.length - 1
          ? `<button class="btn btn-sm btn-primary" onclick="showTourStep(currentTourStep + 1)">Tiếp →</button>`
          : `<button class="btn btn-sm btn-primary" onclick="showTourStep(${ONBOARDING_STEPS.length})">Hoàn tất ✓</button>`
        }
      </div>
    `;

    // Position tooltip near target
    if (target) {
      const rect = target.getBoundingClientRect();
      const pos = step.position || 'bottom';

      tooltip.className = 'tour-tooltip active';
      tooltip.dataset.position = pos;

      // Simplified positioning
      switch (pos) {
        case 'bottom':
          tooltip.style.top = `${rect.bottom + window.scrollY + 16}px`;
          tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          tooltip.style.transform = 'translateX(-50%)';
          break;
        case 'top':
          tooltip.style.top = `${rect.top + window.scrollY - 16}px`;
          tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          tooltip.style.transform = 'translate(-50%, -100%)';
          break;
        case 'right':
          tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
          tooltip.style.left = `${rect.right + window.scrollX + 16}px`;
          tooltip.style.transform = 'translateY(-50%)';
          break;
        case 'bottom-left':
          tooltip.style.top = `${rect.bottom + window.scrollY + 16}px`;
          tooltip.style.left = `${rect.left + window.scrollX}px`;
          tooltip.style.transform = 'none';
          break;
      }
    } else {
      // Center if no target found
      tooltip.className = 'tour-tooltip active center';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
    }
  }

  overlay.classList.add('active');
}

/**
 * Đóng tour
 */
function closeTour() {
  document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) overlay.classList.remove('active');
  const tooltip = document.getElementById('tourTooltip');
  if (tooltip) tooltip.classList.remove('active');
}


// ==============================================================
// SECTION 53: HELP SYSTEM (T-H1, T-H2)
// In-app Help tooltips + comprehensive Help panel
// ==============================================================

const HELP_TOOLTIPS = {
  'sourceUpload': 'Kéo thả hoặc click để upload file. Hỗ trợ: PDF, Word, PowerPoint, ảnh (JPG/PNG), audio (MP3/WAV), text, CSV, JSON. Tối đa 20MB/file.',
  'chatInput': 'Gõ câu hỏi về nội dung tài liệu. AI sẽ trả lời dựa trên nguồn kèm tham chiếu [Nguồn X]. Tips: Hỏi cụ thể sẽ cho kết quả tốt hơn.',
  'quickActions': 'Các hành động nhanh xử lý toàn bộ tài liệu: Tóm tắt, Ý chính, FAQ, Timeline, Mind Map, Flashcard, Quiz.',
  'sttUpload': 'Upload file audio (WAV, MP3, OGG, M4A, WEBM) để AI chuyển thành văn bản. File tốt nhất: WAV/MP3, < 25MB, ít tạp âm.',
  'ttsEngine': 'Browser TTS: Miễn phí, nhanh, giọng cơ bản. Gemini TTS: Chất lượng cao, 30 giọng, cần API key.',
  'screenRecord': '3 bước: (1) Bấm Ghi → chọn màn hình, (2) Bấm Dừng khi xong, (3) Bấm "Biên bản AI" để AI tự động tạo biên bản cuộc họp.',
  'fileConvert': 'Upload file → chọn hành động (Tóm tắt, Trích xuất, Dịch, Phân tích...) → Bấm Xử lý. Hỗ trợ Batch mode cho nhiều file.',
  'apiKey': 'Lấy API key miễn phí tại aistudio.google.com. Có thể thêm nhiều key để tránh rate limit. Key được lưu cục bộ, không gửi đi đâu.',
  'notebook': 'Mỗi notebook có nguồn và chat riêng. Tạo tối đa 20 notebooks. Dữ liệu lưu trong trình duyệt.',
  'persona': 'Chọn phong cách AI: Giáo sư (chuyên sâu), Bạn bè (thân thiện), Chuyên gia (chi tiết), Phóng viên (phân tích), Gia sư (dễ hiểu).'
};

/**
 * Khởi tạo Help Tooltips (T-H1)
 */
function initHelpTooltips() {
  document.querySelectorAll('[data-help]').forEach(el => {
    const key = el.dataset.help;
    const tip = HELP_TOOLTIPS[key];
    if (!tip) return;

    el.addEventListener('mouseenter', (e) => showHelpTooltip(e, tip));
    el.addEventListener('mouseleave', hideHelpTooltip);
    el.addEventListener('focus', (e) => showHelpTooltip(e, tip));
    el.addEventListener('blur', hideHelpTooltip);
  });
}

/**
 * Hiển thị help tooltip
 */
function showHelpTooltip(event, text) {
  let tooltip = document.getElementById('helpTooltipFloat');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'helpTooltipFloat';
    tooltip.className = 'help-tooltip-float';
    document.body.appendChild(tooltip);
  }

  tooltip.textContent = text;
  tooltip.style.display = 'block';

  const rect = event.target.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  tooltip.style.transform = 'translateX(-50%)';

  // Ensure tooltip stays in viewport
  requestAnimationFrame(() => {
    const tipRect = tooltip.getBoundingClientRect();
    if (tipRect.right > window.innerWidth - 16) {
      tooltip.style.left = `${window.innerWidth - tipRect.width - 16}px`;
      tooltip.style.transform = 'none';
    }
    if (tipRect.left < 16) {
      tooltip.style.left = '16px';
      tooltip.style.transform = 'none';
    }
  });
}

function hideHelpTooltip() {
  const tooltip = document.getElementById('helpTooltipFloat');
  if (tooltip) tooltip.style.display = 'none';
}

/**
 * Mở Help Panel (T-H2)
 */
function openHelpPanel() {
  renderHelpContent();
  openOverlay('helpOverlay');
}

/**
 * Render nội dung Help (T-H2)
 */
function renderHelpContent() {
  const container = document.getElementById('helpContent');
  if (!container) return;

  const sections = [
    {
      id: 'getting-started',
      title: '🚀 Bắt đầu nhanh (5 phút)',
      content: `
        <ol>
          <li><strong>Nhập API Key:</strong> Nhấn nút "🔑 API Key" ở góc trên phải. Lấy key miễn phí tại <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a>.</li>
          <li><strong>Thêm tài liệu:</strong> Kéo thả file vào vùng "Nguồn tài liệu" hoặc nhấn nút Upload. Hỗ trợ PDF, Word, ảnh, audio, text.</li>
          <li><strong>Hỏi AI:</strong> Gõ câu hỏi vào ô chat phía dưới và nhấn Enter. AI sẽ trả lời dựa trên tài liệu của bạn.</li>
          <li><strong>Dùng Quick Actions:</strong> Nhấn các nút "Tóm tắt", "Ý chính", "FAQ"... để AI tự động xử lý.</li>
          <li><strong>Khám phá thêm:</strong> Nhấn Ctrl+P để mở Command Palette tìm kiếm nhanh mọi chức năng.</li>
        </ol>
      `
    },
    {
      id: 'notebook-ai',
      title: '📒 Notebook AI',
      content: `
        <p><strong>Notebook AI</strong> là tính năng chính cho phép bạn chat với AI dựa trên tài liệu.</p>
        <p><strong>Nguồn tài liệu:</strong> Upload tối đa 20 file (PDF, DOCX, ảnh, audio). Mỗi nguồn được AI phân tích tự động.</p>
        <p><strong>Chat thông minh:</strong> AI trả lời kèm tham chiếu [Nguồn X]. Click vào tham chiếu để xem đoạn gốc.</p>
        <p><strong>Quick Actions:</strong> Tóm tắt, Ý chính, FAQ, Timeline, Mind Map, Flashcard, Quiz, Glossary, Podcast AI, So sánh tài liệu, Phân tích cảm xúc.</p>
        <p><strong>Multi-Notebook:</strong> Tạo tối đa 20 notebooks riêng biệt. Mỗi notebook có nguồn và chat riêng.</p>
        <p><strong>Persona:</strong> Chọn phong cách AI: Giáo sư, Bạn bè, Chuyên gia, Phóng viên, Gia sư, Sáng tạo, Phản biện.</p>
      `
    },
    {
      id: 'stt',
      title: '🎤 Speech-to-Text (STT)',
      content: `
        <p>Chuyển đổi audio/video thành văn bản sử dụng AI Gemini.</p>
        <p><strong>File hỗ trợ:</strong> WAV, MP3, OGG, WEBM, M4A, FLAC (tối đa 25MB).</p>
        <p><strong>Tùy chọn:</strong> Chọn ngôn ngữ, bật timestamp, phân biệt người nói.</p>
        <p><strong>Real-time STT:</strong> Bật toggle để nhận diện giọng nói trực tiếp qua microphone (dùng Web Speech API).</p>
        <p><strong>Tips:</strong> File WAV/MP3 chất lượng tốt, ít tạp âm sẽ cho kết quả chính xác nhất.</p>
      `
    },
    {
      id: 'tts',
      title: '🔊 Text-to-Speech (TTS)',
      content: `
        <p>Đọc văn bản thành giọng nói với 2 engine:</p>
        <p><strong>Browser TTS:</strong> Miễn phí, nhanh, nhiều giọng theo trình duyệt. Điều chỉnh tốc độ, cao độ, âm lượng. Highlight từng từ khi đọc.</p>
        <p><strong>Gemini AI TTS:</strong> Chất lượng cao, 30 giọng, giọng tự nhiên. Cần API key. Có thể download audio WAV. Highlight từng câu khi đọc.</p>
        <p><strong>Khi nào dùng Browser?</strong> Đọc nhanh, không cần chất lượng cao, không có API key.</p>
        <p><strong>Khi nào dùng Gemini?</strong> Cần giọng đọc tự nhiên, tạo podcast, download audio.</p>
      `
    },
    {
      id: 'record',
      title: '🎬 Ghi màn hình & Biên bản AI',
      content: `
        <p><strong>3 bước đơn giản:</strong></p>
        <ol>
          <li>Nhấn "Bắt đầu ghi" → chọn màn hình/tab cần ghi → cho phép microphone.</li>
          <li>Tiến hành cuộc họp bình thường. Nhấn "Dừng ghi" khi xong.</li>
          <li>Nhấn "Biên bản AI" → AI tự động tạo biên bản cuộc họp chi tiết: thông tin chung, người tham gia, nội dung chính, quyết định, action items.</li>
        </ol>
        <p><strong>Tips:</strong> Đảm bảo microphone được bật để AI nghe được nội dung cuộc họp.</p>
      `
    },
    {
      id: 'convert',
      title: '🔄 Chuyển đổi file',
      content: `
        <p>Xử lý file với AI: Tóm tắt, Trích xuất, Dịch, Phân tích, Q&A, Outline, OCR.</p>
        <p><strong>Batch mode:</strong> Bật để xử lý nhiều file liên tiếp.</p>
        <p><strong>Hỗ trợ:</strong> PDF, Word, PowerPoint, ảnh, CSV, JSON, TXT, MD và nhiều định dạng khác.</p>
      `
    },
    {
      id: 'shortcuts',
      title: '⌨️ Phím tắt',
      content: `
        <p><strong>Ctrl+P:</strong> Command Palette — tìm kiếm nhanh mọi chức năng.</p>
        <p><strong>Ctrl+1-6:</strong> Chuyển tab nhanh.</p>
        <p><strong>Ctrl+D:</strong> Dark mode. <strong>Ctrl+B:</strong> Sidebar. <strong>F11:</strong> Focus mode.</p>
        <p><strong>Ctrl+\\:</strong> Split view. <strong>Ctrl+/:</strong> Xem phím tắt.</p>
        <p><strong>Ctrl+U:</strong> Upload nguồn. <strong>?:</strong> Phím tắt.</p>
      `
    },
    {
      id: 'faq',
      title: '❓ FAQ — Câu hỏi thường gặp',
      content: `
        <p><strong>Q: API Key có miễn phí không?</strong><br>A: Có! Google Gemini API cho phép miễn phí với giới hạn nhất định. Lấy tại aistudio.google.com.</p>
        <p><strong>Q: Dữ liệu có được gửi lên server không?</strong><br>A: Ứng dụng chạy hoàn toàn trong trình duyệt. Dữ liệu chỉ gửi đến Google Gemini API khi bạn hỏi AI. Không có server riêng lưu trữ.</p>
        <p><strong>Q: Tại sao AI trả lời chậm?</strong><br>A: Phụ thuộc vào dung lượng tài liệu và tốc độ mạng. Thử giảm số nguồn hoặc tải liệu ngắn hơn.</p>
        <p><strong>Q: Có thể dùng offline không?</strong><br>A: Giao diện hoạt động offline (PWA). Tuy nhiên, các tính năng AI cần kết nối mạng.</p>
        <p><strong>Q: Tối đa bao nhiêu nguồn?</strong><br>A: 20 nguồn mỗi notebook, mỗi file tối đa 20MB.</p>
      `
    },
    {
      id: 'tips',
      title: '💡 Tips nâng cao',
      content: `
        <p><strong>Nhiều API Key:</strong> Thêm 2-3 key để tránh rate limit. App tự động luân chuyển key.</p>
        <p><strong>Prompt hiệu quả:</strong> Dùng Thư viện Prompt (Ctrl+P → "prompt") để lấy template chuyên ngành.</p>
        <p><strong>Flashcard & Quiz:</strong> Tạo tài liệu ôn thi tự động từ bất kỳ tài liệu nào.</p>
        <p><strong>Podcast AI:</strong> Biến tài liệu khô khan thành podcast thú vị với 2 giọng AI.</p>
        <p><strong>Export đa dạng:</strong> JSON (đầy đủ dữ liệu), MD (đẹp), HTML (chia sẻ), DOCX (chuyên nghiệp).</p>
        <p><strong>Writing Assistant:</strong> Bôi đen text trong chat → popup mở rộng, rút gọn, dịch, viết lại.</p>
      `
    }
  ];

  // Build TOC
  let tocHtml = '<nav class="help-toc"><h3>Mục lục</h3><ul>';
  sections.forEach(s => {
    tocHtml += `<li><a href="#help-${s.id}" onclick="scrollToHelpSection('${s.id}')">${s.title}</a></li>`;
  });
  tocHtml += '</ul></nav>';

  // Build content
  let contentHtml = '<div class="help-body">';
  sections.forEach(s => {
    contentHtml += `<section id="help-${s.id}" class="help-section">
      <h3>${s.title}</h3>
      ${s.content}
    </section>`;
  });
  contentHtml += '</div>';

  // Search
  const searchHtml = `<div class="help-search">
    <input type="text" id="helpSearch" placeholder="Tìm kiếm trong hướng dẫn..." class="form-input"
           oninput="searchHelp(this.value)">
  </div>`;

  container.innerHTML = searchHtml + '<div class="help-layout">' + tocHtml + contentHtml + '</div>';
}

/**
 * Scroll to help section
 */
function scrollToHelpSection(sectionId) {
  const el = document.getElementById(`help-${sectionId}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Search trong help
 */
function searchHelp(query) {
  if (!query.trim()) {
    document.querySelectorAll('.help-section').forEach(s => s.style.display = 'block');
    return;
  }

  const q = query.toLowerCase();
  document.querySelectorAll('.help-section').forEach(section => {
    const text = section.textContent.toLowerCase();
    section.style.display = text.includes(q) ? 'block' : 'none';

    // Highlight matches
    if (text.includes(q)) {
      // Simple highlight — can be enhanced
      section.querySelectorAll('mark.help-highlight').forEach(m => {
        m.outerHTML = m.textContent;
      });
    }
  });
}


// ==============================================================
// SECTION 54: FULL-TEXT SEARCH IN SOURCES (T-U6)
// ==============================================================

/**
 * Khởi tạo Source Search
 */
function initSourceSearch() {
  const searchInput = document.getElementById('sourceSearchInput');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSourceSearch(searchInput.value);
    }, 300);
  });

  // Clear button
  document.getElementById('sourceSearchClear')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearSourceSearch();
  });
}

/**
 * Tìm kiếm full-text trong sources
 */
function performSourceSearch(query) {
  const resultsContainer = document.getElementById('sourceSearchResults');
  if (!resultsContainer) return;

  if (!query.trim()) {
    clearSourceSearch();
    return;
  }

  const q = query.toLowerCase().trim();
  const results = [];

  STATE.sources.forEach((source, idx) => {
    const text = (source.text || source.content || '').toLowerCase();
    const name = source.name.toLowerCase();

    if (text.includes(q) || name.includes(q)) {
      // Find snippets
      const snippets = [];
      let searchIdx = 0;
      const maxSnippets = 3;

      while (snippets.length < maxSnippets) {
        const pos = text.indexOf(q, searchIdx);
        if (pos === -1) break;

        const start = Math.max(0, pos - 60);
        const end = Math.min(text.length, pos + q.length + 60);
        let snippet = (source.text || source.content || '').substring(start, end);

        // Highlight match
        const highlightRegex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        snippet = escapeHtml(snippet).replace(highlightRegex, '<mark>$1</mark>');

        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet += '...';

        snippets.push(snippet);
        searchIdx = pos + q.length;
      }

      results.push({ sourceIndex: idx, name: source.name, snippets, matchCount: (text.match(new RegExp(escapeRegex(q), 'gi')) || []).length });
    }
  });

  if (!results.length) {
    resultsContainer.innerHTML = `<p class="text-muted">Không tìm thấy "${escapeHtml(query)}" trong nguồn nào.</p>`;
    resultsContainer.style.display = 'block';
    return;
  }

  resultsContainer.innerHTML = `<div class="search-results-header">Tìm thấy trong ${results.length} nguồn</div>` +
    results.map(r => `
      <div class="search-result-item" onclick="previewSource(${r.sourceIndex})">
        <div class="search-result-name">
          <strong>📄 ${escapeHtml(r.name)}</strong>
          <span class="search-match-count">${r.matchCount} kết quả</span>
        </div>
        <div class="search-result-snippets">
          ${r.snippets.map(s => `<p class="search-snippet">${s}</p>`).join('')}
        </div>
      </div>
    `).join('');

  resultsContainer.style.display = 'block';
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clear search results
 */
function clearSourceSearch() {
  const resultsContainer = document.getElementById('sourceSearchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }
}


// ==============================================================
// SECTION 55: SOURCE TAGS & COLOR LABELS (T-U5)
// ==============================================================

const SOURCE_TAG_PRESETS = {
  important: { label: '🔴 Quan trọng', color: '#e74c3c' },
  reference: { label: '📙 Tham khảo', color: '#f39c12' },
  reviewed: { label: '✅ Đã xem', color: '#27ae60' },
  draft: { label: '📝 Nháp', color: '#3498db' },
  archive: { label: '📦 Lưu trữ', color: '#95a5a6' }
};

/**
 * Gán tag cho source
 */
function setSourceTag(sourceIndex, tagKey) {
  const source = STATE.sources[sourceIndex];
  if (!source) return;

  const preset = SOURCE_TAG_PRESETS[tagKey];
  source.userTag = tagKey;
  source.userTagLabel = preset?.label || tagKey;
  source.userTagColor = preset?.color || '#3498db';

  renderSourceList();
  saveCurrentSession();
}

/**
 * Filter sources theo tag
 */
function filterSourcesByTag(tagKey) {
  STATE.sourceTagFilter = tagKey;
  renderSourceList();
}

/**
 * Render tag filter bar
 */
function renderSourceTagFilter() {
  const container = document.getElementById('sourceTagFilter');
  if (!container) return;

  let html = '<button class="tag-filter-btn active" onclick="filterSourcesByTag(null)">Tất cả</button>';
  Object.entries(SOURCE_TAG_PRESETS).forEach(([key, val]) => {
    const count = STATE.sources.filter(s => s.userTag === key).length;
    if (count > 0) {
      html += `<button class="tag-filter-btn" onclick="filterSourcesByTag('${key}')" style="--tag-color:${val.color}">${val.label} (${count})</button>`;
    }
  });

  container.innerHTML = html;
}


// ==============================================================
// SECTION 56: FOCUS MODE (T-U8)
// ==============================================================

/**
 * Toggle Focus Mode
 */
function toggleFocusMode() {
  STATE.focusMode = !STATE.focusMode;
  document.body.classList.toggle('focus-mode', STATE.focusMode);

  if (STATE.focusMode) {
    showToast('Focus Mode — Nhấn Esc hoặc F11 để thoát.', 'info');
  }

  // Update button
  const btn = document.getElementById('btnFocusMode');
  if (btn) {
    const icon = btn.querySelector('.icon');
    if (icon) icon.textContent = STATE.focusMode ? '↩️' : '🎯';
  }
}


// ==============================================================
// SECTION 57: SPLIT VIEW (T-N9)
// ==============================================================

/**
 * Toggle Split View
 */
function toggleSplitView() {
  // Only on notebook tab
  if (STATE.activeTab !== 'notebook') {
    switchTab('notebook');
  }

  STATE.splitView = !STATE.splitView;
  document.querySelector('.notebook-layout')?.classList.toggle('split-view', STATE.splitView);

  if (STATE.splitView) {
    // Auto-disable on mobile
    if (window.innerWidth < 768) {
      showToast('Split View không khả dụng trên mobile.', 'warning');
      STATE.splitView = false;
      document.querySelector('.notebook-layout')?.classList.remove('split-view');
      return;
    }
    showToast('Split View đã bật. Ctrl+\\ để tắt.', 'info');
    // Load first source into viewer if available
    if (STATE.sources.length) {
      loadSourceInSplitView(0);
    }
  } else {
    showToast('Split View đã tắt.', 'info');
  }
}

/**
 * Load source vào split view panel
 */
function loadSourceInSplitView(sourceIndex) {
  const viewer = document.getElementById('splitViewContent');
  if (!viewer) return;

  const source = STATE.sources[sourceIndex];
  if (!source) return;

  const content = source.text || source.content || '';
  viewer.innerHTML = `
    <div class="split-viewer-header">
      <h4>📄 ${escapeHtml(source.name)}</h4>
      <button class="btn-icon" onclick="toggleSplitView()" title="Đóng">✕</button>
    </div>
    <div class="split-viewer-body">${md2html(content)}</div>
  `;
}


// ==============================================================
// SECTION 58: SKELETON LOADING (T-U9)
// ==============================================================

/**
 * Hiện skeleton loading cho panel
 */
function showSkeleton(containerId, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-item">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton-lines">
        <div class="skeleton skeleton-text" style="width:${70 + Math.random() * 30}%"></div>
        <div class="skeleton skeleton-text" style="width:${50 + Math.random() * 40}%"></div>
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

/**
 * Ẩn skeleton loading
 */
function hideSkeleton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.querySelectorAll('.skeleton-item').forEach(el => el.remove());
}

/**
 * Tab transition animation (T-U9)
 */
function animateTabTransition(tabId) {
  const panel = document.getElementById(`${tabId}Panel`);
  if (!panel) return;

  panel.classList.remove('tab-enter');
  // Force reflow
  void panel.offsetWidth;
  panel.classList.add('tab-enter');
}


// ==============================================================
// SECTION 59: BOTTOM NAVIGATION BAR MOBILE (T-U1, T-F7)
// ==============================================================

/**
 * Khởi tạo Bottom Navigation
 */
function initBottomNav() {
  const bottomNav = document.getElementById('bottomNav');
  if (!bottomNav) return;

  bottomNav.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
      // Update bottom nav active state
      bottomNav.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Sync with header nav
  const syncBottomNav = () => {
    bottomNav.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === STATE.activeTab);
    });
  };

  // Listen for tab changes
  const origSwitchTab = window.switchTab;
  if (typeof origSwitchTab === 'function') {
    window.switchTab = (tab) => {
      origSwitchTab(tab);
      syncBottomNav();
    };
  }
}


// ==============================================================
// SECTION 60: SPLASH SCREEN & BRANDING INIT (T-B1)
// ==============================================================

/**
 * Splash screen animation
 */
function initSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;

  // Auto hide after animation
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }, 2000); // Show for 2 seconds
}

/**
 * Update footer year dynamically (T-B1)
 */
function updateFooterYear() {
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    const currentYear = new Date().getFullYear();
    footerYear.textContent = `2025-${currentYear}`;
  }
}


// ==============================================================
// SECTION 61: TEXT SOURCE MODAL (T-F2)
// ==============================================================

/**
 * Khởi tạo Text Source input modal
 */
function initTextSourceModal() {
  const textarea = document.getElementById('textSourceInput');
  const charCount = document.getElementById('textSourceCharCount');
  const btnPaste = document.getElementById('textSourceBtnPaste');
  const btnSubmit = document.getElementById('textSourceBtnSubmit');

  // Character counter
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    if (charCount) {
      charCount.textContent = `${len.toLocaleString()} / 50,000`;
      charCount.classList.toggle('over-limit', len > 50000);
    }
  });

  // Paste from clipboard
  btnPaste?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (textarea) {
        textarea.value += text;
        textarea.dispatchEvent(new Event('input'));
      }
    } catch (err) {
      showToast('Không thể đọc clipboard. Hãy dán thủ công (Ctrl+V).', 'warning');
    }
  });

  // Submit as source
  btnSubmit?.addEventListener('click', () => {
    const text = textarea?.value?.trim();
    if (!text) {
      showToast('Nhập nội dung văn bản.', 'warning');
      return;
    }
    if (text.length > 50000) {
      showToast('Vượt quá 50,000 ký tự. Hãy rút gọn nội dung.', 'error');
      return;
    }

    // Create source
    const source = {
      id: generateId(),
      name: `📝 Văn bản nhập (${new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`,
      type: 'text',
      text: text,
      content: text,
      addedAt: new Date().toISOString(),
      size: text.length
    };

    STATE.sources.push(source);
    renderSourceList();
    saveCurrentSession();

    // Auto-tag
    autoTagSource(STATE.sources.length - 1);
    generateSuggestedQuestions();

    // Close modal
    closeOverlay('textSourceOverlay');
    if (textarea) textarea.value = '';
    if (charCount) charCount.textContent = '0 / 50,000';

    showToast(`Đã thêm: ${source.name}`, 'success');
  });
}


// ==============================================================
// SECTION 62: CHAT REACTIONS (T-U7)
// ==============================================================

/**
 * Toggle reaction trên message
 */
function toggleReaction(messageIndex, reaction) {
  const msg = STATE.chatHistory?.[messageIndex];
  if (!msg) return;

  if (!msg.reactions) msg.reactions = {};
  msg.reactions[reaction] = !msg.reactions[reaction];

  // Re-render that message's reaction buttons
  const msgEl = document.querySelectorAll('.message-bubble')[messageIndex];
  if (msgEl) {
    const reactionsEl = msgEl.querySelector('.message-reactions');
    if (reactionsEl) {
      renderMessageReactions(reactionsEl, messageIndex, msg.reactions);
    }
  }

  saveCurrentSession();
}

/**
 * Render reactions cho message
 */
function renderMessageReactions(container, messageIndex, reactions) {
  if (!container) return;

  const reactionTypes = [
    { key: 'like', emoji: '👍' },
    { key: 'love', emoji: '❤️' },
    { key: 'think', emoji: '🤔' },
    { key: 'dislike', emoji: '👎' }
  ];

  container.innerHTML = reactionTypes.map(r =>
    `<button class="reaction-btn ${reactions?.[r.key] ? 'active' : ''}"
             onclick="toggleReaction(${messageIndex}, '${r.key}')"
             title="${r.key}">${r.emoji}</button>`
  ).join('') +
  `<button class="reaction-btn feedback-btn" onclick="showFeedbackForm(${messageIndex})" title="Phản hồi">💬</button>`;
}

/**
 * Hiển thị form feedback
 */
function showFeedbackForm(messageIndex) {
  const form = document.createElement('div');
  form.className = 'feedback-form';
  form.innerHTML = `
    <p>Tại sao không hài lòng?</p>
    <textarea id="feedbackText" rows="2" placeholder="Nhập phản hồi..." class="form-textarea"></textarea>
    <div class="feedback-actions">
      <button class="btn btn-sm btn-primary" onclick="submitFeedback(${messageIndex})">Gửi</button>
      <button class="btn btn-sm" onclick="this.closest('.feedback-form').remove()">Hủy</button>
    </div>
  `;

  const msgEl = document.querySelectorAll('.message-bubble')[messageIndex];
  if (msgEl) {
    msgEl.querySelector('.feedback-form')?.remove(); // Remove old
    msgEl.appendChild(form);
  }
}

function submitFeedback(messageIndex) {
  const text = document.getElementById('feedbackText')?.value?.trim();
  if (!text) return;

  const msg = STATE.chatHistory?.[messageIndex];
  if (msg) {
    msg.feedback = text;
    saveCurrentSession();
  }

  document.querySelector('.feedback-form')?.remove();
  showToast('Cảm ơn phản hồi của bạn!', 'success');
}


// ==============================================================
// SECTION 63: PWA INIT (T-N10)
// Service Worker registration + Install banner
// ==============================================================

let deferredInstallPrompt = null;

/**
 * Khởi tạo PWA
 */
function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('✅ Service Worker registered:', reg.scope);

        // Check for updates
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'activated') {
              showToast('Ứng dụng đã được cập nhật! Reload để áp dụng.', 'info');
            }
          };
        };
      })
      .catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
  }

  // Capture install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Show install banner (only on 2nd visit)
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
    localStorage.setItem('visitCount', String(visitCount));

    if (visitCount >= 2) {
      showInstallBanner();
    }
  });

  // Track install
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
    showToast('Đã cài đặt ứng dụng!', 'success');
  });
}

/**
 * Hiển thị install banner
 */
function showInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (!banner || !deferredInstallPrompt) return;

  banner.style.display = 'flex';

  document.getElementById('installBtnAccept')?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    console.log('Install prompt result:', result.outcome);
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  document.getElementById('installBtnDismiss')?.addEventListener('click', () => {
    hideInstallBanner();
    localStorage.setItem('installDismissed', '1');
  });
}

function hideInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'none';
}


// ==============================================================
// SECTION 64: SESSION RESTORE FROM IndexedDB (T-F5)
// ==============================================================

/**
 * Khôi phục session từ IndexedDB khi load trang
 */
async function restoreSessionFromDB() {
  try {
    const db = await openDB();

    // Restore current notebook
    const notebooks = await getAllFromDB(db, 'notebooks');
    if (notebooks.length) {
      // Find pinned or last used
      const pinned = notebooks.find(n => n.pinned);
      const lastUsed = notebooks.sort((a, b) =>
        new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      )[0];

      const active = pinned || lastUsed;
      if (active) {
        STATE.currentNotebook = active;
        STATE.notebooks = notebooks;

        // Restore sources for this notebook
        const sources = await getAllFromDB(db, 'sources');
        STATE.sources = sources.filter(s => s.notebookId === active.id);

        // Restore chat history
        const chats = await getAllFromDB(db, 'chats');
        STATE.chatHistory = chats
          .filter(c => c.notebookId === active.id)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Restore pinned notes
        const notes = await getAllFromDB(db, 'notes');
        STATE.pinnedNotes = notes.filter(n => n.notebookId === active.id);
      }
    }

    // Restore API keys from localStorage (sensitive, not in IndexedDB)
    const savedKeys = localStorage.getItem('geminiKeys');
    if (savedKeys) {
      try { STATE.apiKeys = JSON.parse(savedKeys); } catch (e) { /* ignore */ }
    }

    console.log('✅ Session restored from IndexedDB');
    return true;

  } catch (err) {
    console.warn('IndexedDB restore failed, trying localStorage fallback:', err);
    return restoreSessionFromLocalStorage();
  }
}

/**
 * Fallback: Restore từ localStorage
 */
function restoreSessionFromLocalStorage() {
  try {
    const saved = localStorage.getItem('appSession');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.sources) STATE.sources = data.sources;
      if (data.chatHistory) STATE.chatHistory = data.chatHistory;
      if (data.pinnedNotes) STATE.pinnedNotes = data.pinnedNotes;
      if (data.currentNotebook) STATE.currentNotebook = data.currentNotebook;
      console.log('✅ Session restored from localStorage (fallback)');
      return true;
    }
  } catch (err) {
    console.warn('localStorage restore also failed:', err);
  }
  return false;
}

/**
 * Helper: getAllFromDB
 */
function getAllFromDB(db, storeName) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]); // Don't reject, just return empty
    } catch (e) {
      resolve([]);
    }
  });
}


// ==============================================================
// SECTION 65: SIDEBAR TOGGLE
// ==============================================================

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  const sidebar = document.getElementById('notebookSidebar');
  if (!sidebar) return;

  STATE.sidebarOpen = !STATE.sidebarOpen;
  sidebar.classList.toggle('open', STATE.sidebarOpen);
  document.querySelector('.notebook-layout')?.classList.toggle('sidebar-open', STATE.sidebarOpen);

  localStorage.setItem('sidebarOpen', STATE.sidebarOpen ? '1' : '0');
}


// ==============================================================
// SECTION 66: TAB SWITCHING (enhanced)
// ==============================================================

/**
 * Switch tab chính
 */
function switchTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  // Deactivate all nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

  // Show target panel
  const targetPanel = document.getElementById(`${tabId}Panel`);
  if (targetPanel) {
    targetPanel.style.display = 'block';
    // Trigger animation (T-U9)
    requestAnimationFrame(() => {
      targetPanel.classList.add('active');
      animateTabTransition(tabId);
    });
  }

  // Activate nav tab
  document.querySelector(`.nav-tab[data-tab="${tabId}"]`)?.classList.add('active');

  // Sync bottom nav
  document.querySelectorAll('#bottomNav [data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  STATE.activeTab = tabId;

  // Update hero visibility
  const hero = document.getElementById('heroSection');
  if (hero) hero.style.display = tabId === 'notebook' && !STATE.sources.length ? 'block' : 'none';
}


// ==============================================================
// SECTION 67: OVERLAY MANAGEMENT (enhanced)
// ==============================================================

/**
 * Mở overlay
 */
function openOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  overlay.classList.add('active');
  overlay.style.display = 'flex';

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay(overlayId);
  });

  // Trap focus
  const firstFocusable = overlay.querySelector('input, textarea, button, select');
  if (firstFocusable) firstFocusable.focus();
}

/**
 * Đóng overlay
 */
function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  overlay.classList.remove('active');
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
    }
  }, 300); // Match CSS transition
}


// ==============================================================
// SECTION 68: MASTER INIT — DOMContentLoaded
// ==============================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 TuongTanDigital-AI initializing...');
  const startTime = performance.now();

  // 1. Splash screen (T-B1)
  initSplashScreen();

  // 2. Restore settings (theme, dark mode, font)
  restoreSettings();

  // 3. Footer year (T-B1)
  updateFooterYear();

  // 4. Restore session from IndexedDB (T-F5)
  await restoreSessionFromDB();

  // 5. Init all modules
  // --- Part 1 modules (already defined in Part 1) ---
  // initAPIKeyManager() — from Part 1
  if (typeof initAPIKeyManager === 'function') initAPIKeyManager();

  // Render notebooks if any
  if (typeof renderNotebookList === 'function') renderNotebookList();

  // Render sources
  if (typeof renderSourceList === 'function') renderSourceList();

  // Render chat history
  if (typeof renderChatHistory === 'function') renderChatHistory();

  // --- Part 2 modules ---
  if (typeof initPart2 === 'function') initPart2();

  // --- Part 3 modules ---
  // Settings
  initSettings();

  // History
  initHistory();

  // Keyboard shortcuts (T-U3)
  initKeyboardShortcuts();

  // Render shortcuts cheatsheet
  renderShortcutsCheatsheet();

  // Help tooltips (T-H1)
  initHelpTooltips();

  // Help panel button (T-H2)
  document.getElementById('btnHelp')?.addEventListener('click', openHelpPanel);

  // Source search (T-U6)
  initSourceSearch();

  // Source tag filter (T-U5)
  renderSourceTagFilter();

  // Text source modal (T-F2)
  initTextSourceModal();

  // Bottom navigation (T-U1)
  initBottomNav();

  // Tab navigation — header tabs
  document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Default tab
  switchTab('notebook');

  // Focus mode button (T-U8)
  document.getElementById('btnFocusMode')?.addEventListener('click', toggleFocusMode);

  // Sidebar toggle
  document.getElementById('btnSidebar')?.addEventListener('click', toggleSidebar);
  // Restore sidebar state
  if (localStorage.getItem('sidebarOpen') === '1') {
    STATE.sidebarOpen = true;
    document.getElementById('notebookSidebar')?.classList.add('open');
    document.querySelector('.notebook-layout')?.classList.add('sidebar-open');
  }

  // Command palette button (T-N3)
  document.getElementById('btnCommandPalette')?.addEventListener('click', openCommandPalette);

  // API Key button
  document.getElementById('btnApiKey')?.addEventListener('click', () => openOverlay('apiKeyOverlay'));

  // Close overlay buttons
  document.querySelectorAll('[data-close-overlay]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlayId = btn.dataset.closeOverlay;
      if (overlayId) closeOverlay(overlayId);
    });
  });

  // Export session buttons
  document.getElementById('btnExportSession')?.addEventListener('click', () => openOverlay('exportOverlay'));
  document.getElementById('btnExportConfirm')?.addEventListener('click', exportSession);

  // Update notes badge
  updateNotesBadge();

  // Generate suggested questions if sources exist (T-C5)
  if (STATE.sources.length && typeof generateSuggestedQuestions === 'function') {
    setTimeout(() => generateSuggestedQuestions(), 1000);
  }

  // 6. PWA init (T-N10)
  initPWA();

  // 7. Onboarding tour — show on first visit (T-U2)
  if (!localStorage.getItem('onboardingDone')) {
    setTimeout(() => startOnboardingTour(), 3000); // After splash
  }

  // 8. Chat input — Enter to send, Shift+Enter for new line
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeof sendChat === 'function') sendChat();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
    });
  }

  // Send button
  document.getElementById('btnSendChat')?.addEventListener('click', () => {
    if (typeof sendChat === 'function') sendChat();
  });

  // 9. Window beforeunload — save session
  window.addEventListener('beforeunload', () => {
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
    if (typeof saveToHistory === 'function') saveToHistory();
  });

  // 10. Responsive — hide/show bottom nav
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  function handleResponsive(e) {
    const bottomNav = document.getElementById('bottomNav');
    const headerNav = document.querySelector('.nav-tabs');
    if (bottomNav) bottomNav.style.display = e.matches ? 'flex' : 'none';
    if (headerNav) headerNav.style.display = e.matches ? 'none' : 'flex';
  }
  mediaQuery.addEventListener('change', handleResponsive);
  handleResponsive(mediaQuery);

  // Done
  const elapsed = (performance.now() - startTime).toFixed(0);
  console.log(`✅ TuongTanDigital-AI initialized in ${elapsed}ms`);
  console.log(`📋 47 tasks | 68 sections | 3 parts | Ready!`);
});


// ==============================================================
// END OF APP.JS — PART 3/3
// ==============================================================
// ✅ Full app.js complete (Part 1 + Part 2 + Part 3)
// ✅ 47/47 tasks implemented
// ✅ Next: Phase 6 — manifest.json + sw.js + README.md
// ==============================================================