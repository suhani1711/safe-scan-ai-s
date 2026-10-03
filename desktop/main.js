// SafeScan AI Desktop - main process
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, globalShortcut, clipboard, nativeImage, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const SafeScan = require("./analyze.js");
const jsQR = require("./jsQR.js");

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

// Config: API base URL only from env or config.json (for a future AI backend)
let config = {};
try { config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8")); } catch (e) {}
const API_BASE = process.env.SAFESCAN_API_BASE || config.apiBaseUrl || "";

const ICON = path.join(__dirname, "icon.png");
const SIZE = 80, MENU_W = 236, POP_W = 340;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const file = (n) => path.join(app.getPath("userData"), n);
const log = (m) => fs.appendFile(file("safescan-debug.log"), new Date().toISOString() + " " + m + "\n", () => {});

let st = { show: true, x: null, y: null, autostart: false, scans: [] };
function load() { try { st = { ...st, ...JSON.parse(fs.readFileSync(file("state.json"), "utf8")) }; } catch (e) {} }
function save() { try { fs.writeFileSync(file("state.json"), JSON.stringify(st)); } catch (e) {} }

const prefs = { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false };
function floatWin(o) {
  const w = new BrowserWindow({
    frame: false, transparent: true, resizable: false, movable: false, alwaysOnTop: true, skipTaskbar: true,
    focusable: false, hasShadow: false, thickFrame: false, backgroundColor: "#00000000", show: false,
    webPreferences: prefs, ...o,
  });
  w.setAlwaysOnTop(true, "screen-saver");
  w.setMenu(null);
  return w;
}

let shield, menuWin, popWin, scanWin, snipWin, tray, snipImg, snipDisp, busy = false;

function workArea(x, y) { return screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) }).workArea; }
function clamp(x, y, w, h) {
  const a = workArea(x + w / 2, y + h / 2);
  return [Math.round(Math.min(Math.max(x, a.x), a.x + a.width - w)), Math.round(Math.min(Math.max(y, a.y), a.y + a.height - h))];
}
function defaultPos() { const a = screen.getPrimaryDisplay().workArea; return [a.x + a.width - SIZE - 16, a.y + a.height - SIZE - 16]; }

// ---------- Floating shield ----------
function createShield() {
  let [x, y] = st.x == null ? defaultPos() : clamp(st.x, st.y, SIZE, SIZE);
  shield = floatWin({ width: SIZE, height: SIZE, x, y });
  shield.loadFile("shield.html");
  shield.once("ready-to-show", () => { if (st.show) shield.showInactive(); });
}
function resetPos() { const [x, y] = defaultPos(); shield.setPosition(x, y); st.x = x; st.y = y; save(); closeMenu(); }
function setShow(v) { st.show = v; save(); closeMenu(); v ? shield.showInactive() : shield.hide(); buildTray(); }

ipcMain.on("drag-start", () => closeMenu());
ipcMain.on("drag", (_e, d) => {
  if (!shield || !d) return;
  const [x, y] = shield.getPosition();
  const [nx, ny] = clamp(x + d.dx, y + d.dy, SIZE, SIZE);
  shield.setBounds({ x: nx, y: ny, width: SIZE, height: SIZE });
});
ipcMain.on("drag-end", () => { const [x, y] = shield.getPosition(); st.x = x; st.y = y; save(); });

// Place a floating window next to the shield (above, or below near the top edge)
function placeNear(w, width, height) {
  const b = shield.getBounds(), a = workArea(b.x + SIZE / 2, b.y + SIZE / 2);
  let x = b.x + SIZE - width, y = b.y - height - 4;
  if (y < a.y) y = b.y + SIZE + 4;
  x = Math.min(Math.max(x, a.x + 4), a.x + a.width - width - 4);
  y = Math.min(Math.max(y, a.y + 4), a.y + a.height - height - 4);
  w.setBounds({ x: Math.round(x), y: Math.round(y), width, height: Math.round(height) });
}

// ---------- Custom non-focusable menu ----------
function createMenu() {
  menuWin = floatWin({ width: MENU_W, height: 300 });
  menuWin.loadFile("menu.html");
}
function openMenu() {
  if (menuWin.isVisible()) return closeMenu();
  if (popWin && popWin.isVisible()) popWin.hide();
  menuWin.webContents.send("menu-open");
}
function closeMenu() { if (menuWin && menuWin.isVisible()) menuWin.hide(); }
ipcMain.on("menu", openMenu);
ipcMain.on("menu-size", (_e, h) => { placeNear(menuWin, MENU_W, Math.min(h, 640)); if (!menuWin.isVisible()) menuWin.showInactive(); });
ipcMain.on("menu-resize", (_e, h) => { if (menuWin.isVisible()) placeNear(menuWin, MENU_W, Math.min(h, 640)); });
ipcMain.on("menu-close", closeMenu);
ipcMain.on("menu-action", (_e, a) => { closeMenu(); act(a); });

function act(a) {
  if (["link", "sms", "email", "qr", "dashboard", "help"].includes(a)) openScanner(a);
  else if (a === "snip") startSnip();
  else if (a === "sel") scanSelection();
  else if (a === "reset") resetPos();
  else if (a === "hide") setShow(false);
  else if (a === "quit") app.quit();
}

// ---------- Scanner window ----------
function openScanner(tab, text) {
  if (scanWin && !scanWin.isDestroyed()) {
    scanWin.webContents.send("tab", { tab, text });
    if (scanWin.isMinimized()) scanWin.restore();
    scanWin.show(); scanWin.focus(); return;
  }
  scanWin = new BrowserWindow({
    width: 500, height: 780, minWidth: 380, minHeight: 520, title: "SafeScan AI", icon: ICON,
    backgroundColor: "#0b1020", autoHideMenuBar: true, show: false, webPreferences: prefs,
  });
  scanWin.setMenu(null);
  scanWin.loadFile("scanner.html");
  scanWin.webContents.once("did-finish-load", () => { scanWin.webContents.send("tab", { tab, text }); scanWin.show(); });
  scanWin.on("closed", () => (scanWin = null));
}
function record(r) {
  st.scans.unshift({ type: r.type, score: r.score, status: r.status, at: Date.now() });
  st.scans = st.scans.slice(0, 100); save();
}
ipcMain.on("record", (_e, r) => r && record(r));
ipcMain.handle("stats", () => ({ scans: st.scans, apiBase: API_BASE }));

// ---------- Result popup (non-focusable) ----------
function createPop() { popWin = floatWin({ width: POP_W, height: 200 }); popWin.loadFile("popup.html"); }
function showPop(data) { closeMenu(); popWin.webContents.send("pop", data); }
ipcMain.on("pop-size", (_e, h) => { placeNear(popWin, POP_W, Math.min(h, 620)); if (!popWin.isVisible()) popWin.showInactive(); });
ipcMain.on("pop-close", () => popWin.hide());
ipcMain.on("pop-full", (_e, d) => { popWin.hide(); openScanner(d && d.tab ? d.tab : "sms", d && d.text); });

// ---------- Scan selected text in any app ----------
let u32;
function user32() {
  if (u32) return u32;
  const koffi = require("koffi");
  const lib = koffi.load("user32.dll");
  u32 = {
    keybd: lib.func("void __stdcall keybd_event(uint8_t bVk, uint8_t bScan, uint32_t dwFlags, uintptr_t dwExtraInfo)"),
    map: lib.func("uint32_t __stdcall MapVirtualKeyW(uint32_t uCode, uint32_t uMapType)"),
    key: lib.func("int16_t __stdcall GetAsyncKeyState(int vKey)"),
  };
  return u32;
}
async function nativeCopy() {
  if (process.platform !== "win32") throw new Error("not windows");
  const u = user32();
  const CTRL = 0x11, SHIFT = 0x10, ALT = 0x12, LWIN = 0x5b, RWIN = 0x5c, C = 0x43;
  const down = (k) => (u.key(k) & 0x8000) !== 0;
  const press = (vk, up) => u.keybd(vk, u.map(vk, 0), (up ? 2 : 0) | (vk === LWIN || vk === RWIN ? 1 : 0), 0);
  const end = Date.now() + 1500;
  while ([CTRL, SHIFT, ALT, LWIN, RWIN].some(down) && Date.now() < end) await sleep(25);
  for (const k of [SHIFT, ALT, LWIN, RWIN]) if (down(k)) press(k, true);
  press(CTRL, false); press(C, false); await sleep(30); press(C, true); press(CTRL, true);
}
function ps(script, timeout = 4000) {
  return new Promise((res, rej) => {
    const enc = Buffer.from(script, "utf16le").toString("base64");
    execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", enc],
      { windowsHide: true, timeout }, (err, out) => (err ? rej(err) : res(String(out || ""))));
  });
}
const psCopy = () => ps("Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')");
const uiaSelection = async () => (await ps(
  "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Add-Type -AssemblyName UIAutomationClient,UIAutomationTypes; " +
  "$e=[System.Windows.Automation.AutomationElement]::FocusedElement; $p=$null; " +
  "if($e -and $e.TryGetCurrentPattern([System.Windows.Automation.TextPattern]::Pattern,[ref]$p)){ $s=$p.GetSelection(); if($s.Length -gt 0){ $s[0].GetText(5000) } }"
)).trim();

async function poll(marker, ms) {
  const end = Date.now() + ms;
  do { const t = await clipboard.readText(); if (t && t !== marker) return t; await sleep(80); } while (Date.now() < end);
  return null;
}
async function grabSelection(steps) {
  const savedText = await clipboard.readText();
  const savedImg = clipboard.readImage();
  const marker = "__safescan_marker_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  clipboard.writeText(marker);
  let got = null;
  try { await nativeCopy(); steps.push("Ctrl+C (native): sent"); got = await poll(marker, 2000); }
  catch (e) { steps.push("Ctrl+C (native): failed"); }
  if (got == null && process.platform === "win32") {
    try { await psCopy(); steps.push("Ctrl+C (PowerShell): sent"); got = await poll(marker, 2000); }
    catch (e) { steps.push("Ctrl+C (PowerShell): failed"); }
  }
  if (got == null && process.platform === "win32") {
    try { got = (await uiaSelection()) || null; steps.push("UI Automation: " + (got ? "found" : "empty")); }
    catch (e) { steps.push("UI Automation: failed"); }
  }
  // Restore the user's clipboard (text or image)
  const hasImg = savedImg && !savedImg.isEmpty();
  if (savedText || hasImg) clipboard.write({ ...(savedText ? { text: savedText } : {}), ...(hasImg ? { image: savedImg } : {}) });
  else clipboard.clear();
  return got;
}
async function scanSelection() {
  if (busy) return;
  busy = true;
  const steps = [];
  showPop({ state: "loading" });
  try {
    const raw = await grabSelection(steps);
    const t = String(raw || "").trim().slice(0, 5000);
    if (!t) throw new Error("No selected text was found. Highlight text in any app, then press Ctrl+Shift+S.");
    const isUrl = !/\s/.test(t) && /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(t);
    const r = isUrl ? SafeScan.analyzeURL(t) : SafeScan.analyzeSMS(t);
    record(r);
    showPop({ state: "result", r, text: t, tab: isUrl ? "link" : "sms" });
    log(`select ok len=${t.length} steps=${steps.join(" > ")}`);
  } catch (e) {
    showPop({ state: "failed", steps, msg: e.message });
    log(`select fail steps=${steps.join(" > ")}`);
  } finally { busy = false; }
}

// ---------- Snip QR on screen ----------
async function startSnip() {
  if (snipWin) return;
  closeMenu(); if (popWin) popWin.hide();
  const wasShown = shield.isVisible();
  shield.hide();
  await sleep(220);
  const pt = screen.getCursorScreenPoint(), d = screen.getDisplayNearestPoint(pt);
  let src = null;
  try {
    const sources = await desktopCapturer.getSources({ types: ["screen"], thumbnailSize: { width: Math.round(d.size.width * d.scaleFactor), height: Math.round(d.size.height * d.scaleFactor) } });
    src = sources.find((s) => String(s.display_id) === String(d.id)) || sources[0];
  } catch (e) {}
  const restore = () => { if (wasShown && st.show) shield.showInactive(); };
  if (!src || src.thumbnail.isEmpty()) { restore(); log("snip capture failed"); return showPop({ state: "failed", steps: ["Screen capture: failed"], msg: "Could not capture the screen." }); }
  snipImg = src.thumbnail; snipDisp = d;
  snipWin = new BrowserWindow({
    x: d.bounds.x, y: d.bounds.y, width: d.bounds.width, height: d.bounds.height, frame: false, resizable: false, movable: false,
    alwaysOnTop: true, skipTaskbar: true, fullscreen: true, backgroundColor: "#000000", show: false, webPreferences: prefs,
  });
  snipWin.setAlwaysOnTop(true, "screen-saver");
  snipWin.loadFile("snip.html");
  snipWin.webContents.once("did-finish-load", () => { snipWin.webContents.send("snip-img", snipImg.toDataURL()); snipWin.show(); snipWin.focus(); });
  snipWin.on("closed", () => { snipWin = null; restore(); });
}
ipcMain.on("snip-done", (_e, r) => {
  if (snipWin) snipWin.close();
  if (!r || r.w < 10 || r.h < 10) return;
  const iw = snipImg.getSize().width, ih = snipImg.getSize().height, k = iw / snipDisp.bounds.width;
  const pad = Math.max(r.w, r.h) * 0.12;
  const x = Math.max(0, Math.round((r.x - pad) * k)), y = Math.max(0, Math.round((r.y - pad) * k));
  const w = Math.min(iw - x, Math.round((r.w + 2 * pad) * k)), h = Math.min(ih - y, Math.round((r.h + 2 * pad) * k));
  let img = snipImg.crop({ x, y, width: w, height: h });
  const m = Math.min(w, h);
  if (m < 400) { const up = Math.min(4, 400 / m); img = img.resize({ width: Math.round(w * up), height: Math.round(h * up), quality: "best" }); }
  const { width, height } = img.getSize();
  const bgra = img.toBitmap(), rgba = new Uint8ClampedArray(bgra.length);
  for (let i = 0; i < bgra.length; i += 4) { rgba[i] = bgra[i + 2]; rgba[i + 1] = bgra[i + 1]; rgba[i + 2] = bgra[i]; rgba[i + 3] = 255; }
  const q = jsQR(rgba, width, height);
  log(`snip crop=${width}x${height} found=${!!q}`);
  if (q && q.data) openScanner("qr", q.data);
  else showPop({ state: "failed", steps: ["Snip: " + width + "x" + height, "QR decode: not found"], msg: "QR code could not be detected. Try dragging closer around the QR code." });
});

// ---------- Tray ----------
function buildTray() {
  if (!tray) { tray = new Tray(nativeImage.createFromPath(ICON).resize({ width: 16, height: 16 })); tray.setToolTip("SafeScan AI - Your AI Shield Against Digital Scams."); tray.on("click", () => openScanner("link")); }
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Show floating shield", type: "checkbox", checked: st.show, click: (i) => setShow(i.checked) },
    { label: "Start with computer", type: "checkbox", checked: st.autostart, click: (i) => { st.autostart = i.checked; save(); app.setLoginItemSettings({ openAtLogin: i.checked }); } },
    { label: "Reset shield position", click: resetPos },
    { type: "separator" },
    { label: "Links", click: () => openScanner("link") },
    { label: "SMS", click: () => openScanner("sms") },
    { label: "Mail", click: () => openScanner("email") },
    { label: "QR (Camera / Upload)", click: () => openScanner("qr") },
    { label: "Snip QR on screen   Ctrl+Shift+Q", click: startSnip },
    { label: "Scan selected text   Ctrl+Shift+S", click: scanSelection },
    { label: "Dashboard", click: () => openScanner("dashboard") },
    { label: "Help", click: () => openScanner("help") },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
}

app.on("second-instance", () => { if (!st.show) setShow(true); openScanner("link"); });
app.whenReady().then(() => {
  if (process.platform === "win32") app.setAppUserModelId("ai.safescan.desktop");
  load();
  createShield(); createMenu(); createPop(); buildTray();
  globalShortcut.register("CommandOrControl+Shift+S", scanSelection);
  globalShortcut.register("CommandOrControl+Shift+Q", startSnip);
  screen.on("display-metrics-changed", () => { const [x, y] = shield.getPosition(); const [nx, ny] = clamp(x, y, SIZE, SIZE); shield.setPosition(nx, ny); });
  log("start v" + app.getVersion());
});
app.on("window-all-closed", (e) => e.preventDefault && e.preventDefault()); // keep running in tray
app.on("will-quit", () => globalShortcut.unregisterAll());
