/* Meu Treino — app de academia (PWA). Dados no aparelho (localStorage); backup por arquivo .json. */
(function () {
  "use strict";
  const KEY = "meutreino.v1";
  const SCHEMA = 1;
  const VERSAO = "2.0";
  const $app = document.getElementById("app");
  const M = window.Corpo.MUSCLES;
  // ---------------- utilidades ----------------
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const now = () => Date.now();
  const pad = n => String(n).padStart(2, "0");
  const fmtDur = ms => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return h ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`; };
  const fmtMin = ms => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${pad(m % 60)}`; };
  const fmtData = t => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const fmtDataLonga = t => new Date(t).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  const fmtHora = t => new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const fmtNum = n => n == null || n === "" || isNaN(n) ? "–" : (Math.round(n * 10) / 10).toLocaleString("pt-BR");
  const dia0 = t => new Date(t).setHours(0, 0, 0, 0);
  const diasAtras = t => { const d = Math.round((dia0(now()) - dia0(t)) / 864e5); return d === 0 ? "hoje" : d === 1 ? "ontem" : `há ${d} dias`; };
  const ytId = v => { if (!v) return ""; v = String(v).trim(); const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(v) ? v : ""); };
  const parseRest = r => { const n = String(r || "").match(/\d+/g); if (!n) return { min: 60, max: 90 }; const a = +n[0], b = +(n[1] || n[0]); return { min: Math.min(a, b), max: Math.max(a, b) }; };
  const isCardio = e => e && e.type === "cardio";
  const unidadeCarga = e => isCardio(e) ? "km/h" : "kg";
  const saudacao = () => { const h = new Date().getHours(); return h < 5 ? "Boa noite" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };

  // ---------------- estado ----------------
  let S = load();
  function blank() { return { schema: SCHEMA, programs: [], activeProgramId: null, ex: {}, sessions: [], current: null, settings: { sound: true, step: 2.5, lastBackup: null, theme: "auto", name: "Vinicius" } }; }
  function normalizarPrograma(p) {
    p = JSON.parse(JSON.stringify(p));
    p.id = p.id || uid(); p.createdAt = p.createdAt || new Date().toISOString(); p.status = p.status || "active";
    (p.workouts || []).forEach(w => { w.id = w.id || uid(); (w.exercises || []).forEach(e => { e.key = e.key || slug(e.name); e.p = e.p || []; e.s = e.s || []; e.tips = e.tips || []; e.sets = +e.sets || 1; e.reps = +e.reps || 0; e.video = ytId(e.video); if (e.alt) e.alt.video = ytId(e.alt.video); }); });
    return p;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); if (d && d.schema) { const b = blank(); const r = Object.assign(b, d); r.settings = Object.assign(blank().settings, d.settings || {}); delete r.chats; delete r.settings.model; return r; } }
    } catch (e) { console.warn(e); }
    const d = blank();
    if (window.PROGRAMA_INICIAL) { const p = normalizarPrograma(window.PROGRAMA_INICIAL); d.programs.push(p); d.activeProgramId = p.id; }
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Não consegui salvar no aparelho: " + e.message); } }
  try { localStorage.removeItem("meutreino.apikey"); } catch (e) { }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const prog = () => S.programs.find(p => p.id === S.activeProgramId) || S.programs[0];
  const exState = key => (S.ex[key] = S.ex[key] || { load: null, notes: "", loadLog: [] });
  const findEx = key => { for (const p of [prog(), ...S.programs]) for (const w of (p ? p.workouts : [])) for (const e of w.exercises) if (e.key === key) return e; return null; };

  function setLoad(key, val) {
    const st = exState(key); const v = val === "" || val == null || isNaN(val) ? null : Math.max(0, Math.round(val * 100) / 100);
    if (st.load === v) return;
    st.load = v; const lg = st.loadLog[st.loadLog.length - 1];
    if (lg && now() - lg.t < 120000) { lg.t = now(); lg.load = v; } else st.loadLog.push({ t: now(), load: v });
    if (S.current) S.current.items.forEach(it => { if (it.key === key) it.load = v; });
    save();
  }

  // ---------------- tema ----------------
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function applyTheme() {
    const t = S.settings.theme || "auto";
    const dark = t === "dark" || (t === "auto" && (!mq || mq.matches));
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = dark ? "#0a0c0f" : "#f3f4f7";
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", applyTheme);
  applyTheme();

  // ---------------- som / vibração / tela ligada ----------------
  let actx = null;
  function beep(n) {
    if (navigator.vibrate) navigator.vibrate(n > 1 ? [220, 120, 220] : 200);
    if (!S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < n; i++) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination); const t = actx.currentTime + i * 0.25; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.start(t); o.stop(t + 0.2); }
    } catch (e) { }
  }
  let wake = null;
  async function wakeOn() { try { if ("wakeLock" in navigator && S.current && !wake) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } } catch (e) { } }
  function wakeOff() { try { wake && wake.release(); } catch (e) { } wake = null; }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { wakeOn(); tick(); } });

  // ---------------- navegação ----------------
  let view = { name: S.current ? "treino" : "home" };
  let sheet = null;
  function go(v) { view = v; sheet = null; render(); window.scrollTo(0, 0); }
  function openSheet(s) { sheet = s; history.pushState({ sheet: 1 }, ""); renderSheet(); }
  let ignorePop = false;
  function closeSheet(fromPop) { if (!sheet) return; sheet = null; renderSheet(); if (!fromPop) { ignorePop = true; history.back(); } const y = window.scrollY; render(); window.scrollTo(0, y); }
  function guardTreino() { if (view.name === "treino" && S.current && !(history.state && history.state.treino)) history.pushState({ treino: 1 }, ""); }
  function dropGuard() { if (history.state && history.state.treino) { ignorePop = true; history.back(); } }
  window.addEventListener("popstate", () => {
    if (ignorePop) { ignorePop = false; return; }
    const dlg = document.querySelector(".dlg-bg"); if (dlg) dlg.dispatchEvent(new CustomEvent("fechar"));
    if (sheet) { closeSheet(true); return; }
    if (view.name === "treino" && S.current) { history.pushState({ treino: 1 }, ""); if (!dlg) pararTreino(); }
  });

  // ---------------- diálogos ----------------
  function ask(msg, okTxt, danger) {
    return new Promise(res => {
      const bg = document.createElement("div"); bg.className = "dlg-bg";
      bg.innerHTML = `<div class="dlg"><p>${msg}</p><div class="row"><button class="btn ghost sm" data-r="0">Cancelar</button><button class="btn sm ${danger ? "danger" : "pri"}" data-r="1">${okTxt || "OK"}</button></div></div>`;
      bg.addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b || e.target === bg) { e.stopPropagation(); bg.remove(); res(!!b && b.dataset.r === "1"); } });
      bg.addEventListener("fechar", () => { bg.remove(); res(false); });
      document.body.appendChild(bg);
    });
  }
  function choice(title, msg, ops) {
    return new Promise(res => {
      const bg = document.createElement("div"); bg.className = "dlg-bg";
      bg.innerHTML = `<div class="dlg"><h3 class="dlg-t">${title}</h3><p>${msg}</p><div class="dlg-col">${ops.map(o => `<button class="btn block ${o.cls || ""}" data-r="${o.v}">${o.label}</button>`).join("")}</div></div>`;
      const fim = v => { bg.remove(); res(v); };
      bg.addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) { e.stopPropagation(); fim(b.dataset.r); } else if (e.target === bg) fim(null); });
      bg.addEventListener("fechar", () => fim(null));
      document.body.appendChild(bg);
    });
  }
  let toastT;
  function toast(msg) { let t = document.querySelector(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); } t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }

  // ---------------- ícones ----------------
  const sv = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra || ""}>${d}</svg>`;
  const ic = {
    treino: sv(`<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>`),
    hist: sv(`<path d="M3 20h18"/><rect x="5" y="11" width="3" height="6" rx="1"/><rect x="10.5" y="6" width="3" height="11" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>`),
    ajustes: sv(`<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>`),
    play: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="#111"/></svg>`,
    go: sv(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
    home: sv(`<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>`),
    x: sv(`<path d="M6 6l12 12M18 6L6 18"/>`),
    yt: sv(`<path d="M7 17l10-10M9 7h8v8"/>`),
    timer: sv(`<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>`)
  };
  const nav = () => `<nav class="nav">
    <button data-act="nav" data-v="home" class="${["home"].includes(view.name) ? "on" : ""}">${ic.treino}Treinos</button>
    <button data-act="nav" data-v="hist" class="${["hist", "sessao"].includes(view.name) ? "on" : ""}">${ic.hist}Histórico</button>
    <button data-act="nav" data-v="ajustes" class="${["ajustes", "editor", "arquivo"].includes(view.name) ? "on" : ""}">${ic.ajustes}Ajustes</button></nav>`;

  const muscNomes = (e, max) => { const ns = [...e.p, ...e.s].map(k => M[k]).filter(Boolean); return max && ns.length > max ? ns.slice(0, max).join(" · ") + "…" : ns.join(" · "); };
  const workoutMuscles = w => { const p = new Set(), s = new Set(); w.exercises.forEach(e => { if (isCardio(e)) return; e.p.forEach(k => p.add(k)); e.s.forEach(k => s.add(k)); }); p.forEach(k => s.delete(k)); return [[...p], [...s]]; };
  const sessoesDe = (wid, pid) => S.sessions.filter(s => s.workoutId === wid && (!pid || s.programId === pid)).sort((a, b) => b.start - a.start);
  const inicioSemana = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
  const ring = (frac, size, sw, cls) => { const r = (size - sw) / 2, c = 2 * Math.PI * r; return `<svg viewBox="0 0 ${size} ${size}"><circle class="bgc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/><circle class="fgc ${cls || ""}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - Math.min(1, Math.max(0, frac)))).toFixed(2)}"/></svg>`; };

  // ---------------- telas ----------------
  function render() {
    const V = {
      home: vHome, treino: vTreino, hist: vHist, ajustes: vAjustes, editor: vEditor, arquivo: vArquivo,
      resumo: () => vResumo(view.id, true), sessao: () => vResumo(view.id, false)
    };
    $app.innerHTML = (V[view.name] || vHome)();
    tick();
    guardTreino();
  }

  function vHome() {
    const p = prog();
    if (!p) return `<div class="wrap"><h1>Meu Treino</h1><p class="mut">Nenhuma série carregada.</p><button class="btn pri" data-act="nav" data-v="ajustes">Importar série</button></div>${nav()}`;
    const last = S.sessions.filter(s => s.programId === p.id).sort((a, b) => b.start - a.start)[0];
    let sug = null;
    if (last) { const i = p.workouts.findIndex(w => w.id === last.workoutId); sug = p.workouts[(i + 1) % p.workouts.length].id; } else sug = p.workouts[0] && p.workouts[0].id;
    // semana
    const w0 = inicioSemana(now()); const nomes = ["S", "T", "Q", "Q", "S", "S", "D"];
    const semana = nomes.map((n, i) => { const d = w0 + i * 864e5; const feito = S.sessions.filter(s => dia0(s.start) === d); return `<div class="dia ${feito.length ? "on" : ""} ${d === dia0(now()) ? "hoje" : ""}"><i>${feito.length ? esc(feito[feito.length - 1].workoutId) : new Date(d).getDate()}</i>${n}</div>`; }).join("");
    const nSem = S.sessions.filter(s => s.start >= w0).length;
    const nMes = S.sessions.filter(s => { const d = new Date(s.start), h = new Date(); return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear(); }).length;
    const cur = S.current ? `<div class="banner fade"><div class="iconbtn" style="background:rgba(255,255,255,.2);border:0;color:#fff">${ic.timer}</div><div class="grow"><b>Treino ${esc(S.current.workoutId)} em andamento</b><div class="small" style="opacity:.9">desde ${fmtHora(S.current.start)} · <span data-clock="cur"></span></div></div><button class="btn sm" data-act="resume">Continuar</button></div>` : "";
    const cards = p.workouts.map(w => {
      const ss = sessoesDe(w.id, p.id); const [pm, sm] = workoutMuscles(w); const isSug = w.id === sug && !S.current;
      return `<button class="tcard fade ${isSug ? "sug" : ""}" data-act="start" data-w="${esc(w.id)}">
        <div class="top"><div class="letra">${esc(w.id)}</div>
          <div class="grow">${isSug ? `<span class="pill acc" style="margin-bottom:6px">Sugerido hoje</span>` : ""}<div class="tnome">${esc(w.name)}</div><div class="small mut">${esc(w.subtitle || "")}</div></div>
          ${window.Corpo.svg(pm, sm)}</div>
        <div class="foot"><span class="pill">${w.exercises.length} exercícios</span><span class="pill">${ss.length ? `${ss.length}× · ${diasAtras(ss[0].start)}` : "ainda não feito"}</span><span class="go">Começar ${ic.go.replace("<svg", '<svg width="16" height="16"')}</span></div></button>`;
    }).join("");
    const backupAviso = S.sessions.length >= 3 && (!S.settings.lastBackup || now() - S.settings.lastBackup > 30 * 864e5)
      ? `<div class="card small row"><div class="grow">Faz tempo que você não exporta um backup.</div><button class="btn sm" data-act="export">Exportar</button></div>` : "";
    return `<div class="wrap">
      <div class="hello"><div class="grow"><div class="small mut">${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1>${saudacao()}${S.settings.name ? ", " + esc(S.settings.name) : ""}</h1>
        <div class="row wrapx" style="gap:6px;margin-top:6px"><span class="pill acc">${esc(p.name)}</span>${p.coach ? `<span class="pill">${esc(p.coach)}</span>` : ""}</div></div></div>
      <div class="semana">${semana}</div>
      <div class="kpis"><div class="kpi"><b>${nSem}</b><span>esta semana</span></div><div class="kpi"><b>${nMes}</b><span>neste mês</span></div><div class="kpi"><b>${S.sessions.length}</b><span>no total</span></div></div>
      ${cur}${cards}${backupAviso}
    </div>${nav()}`;
  }

  function vTreino() {
    const c = S.current; if (!c) { view = { name: "home" }; return vHome(); }
    const tot = c.items.reduce((a, it) => a + it.done.length, 0), feitas = c.items.reduce((a, it) => a + it.done.filter(Boolean).length, 0);
    const prox = c.items.findIndex(it => !it.done.every(Boolean));
    const items = c.items.map((it, i) => {
      const e = findEx(it.key) || Object.assign({ p: [], s: [] }, it); const done = it.done.every(Boolean);
      const bolas = isCardio(it)
        ? `<button class="serie cardio ${it.done[0] ? "on" : ""}" data-act="set" data-i="${i}" data-s="0">${it.done[0] ? "✓ feito" : `${it.reps} ${esc(it.unit || "min")}`}</button>`
        : it.done.map((d, s) => `<button class="serie ${d ? "on" : ""}" data-act="set" data-i="${i}" data-s="${s}">${d ? "✓" : s + 1}</button>`).join("");
      return `<div class="ex ${done ? "done" : ""} ${i === prox ? "prox" : ""}">
        <button class="ex-head" data-act="ex" data-k="${esc(it.key)}">
          ${window.Corpo.svg(e.p, e.s)}
          <div class="grow"><div class="ex-tag">${i === prox ? "Agora · " : ""}${i + 1} de ${c.items.length}</div><div class="ex-nome">${esc(it.name)}</div>
            <div class="ex-chips"><span class="pill">${isCardio(it) ? `${it.reps} ${esc(it.unit || "min")}` : `${it.sets} × ${it.reps}`}</span>${it.rest ? `<span class="pill">${ic.timer.replace("<svg", '<svg width="13" height="13"')} ${esc(it.rest)}</span>` : ""}</div>
            <div class="ex-musc">${esc(muscNomes(e, 3))}</div></div>
          <div class="carga-pill"><b>${it.load == null ? "–" : fmtNum(it.load)}</b><span>${unidadeCarga(it)}</span></div>
        </button>
        <div class="series">${bolas}</div></div>`;
    }).join("");
    return `<div class="wrap" style="padding-bottom:calc(120px + var(--safe-b))">
      <div class="topbar row"><div class="ring"><svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:#ff8a3d"/><stop offset="1" style="stop-color:#ff4f6d"/></linearGradient></defs></svg>${ring(tot ? feitas / tot : 0, 64, 7)}<b>${tot ? Math.round(feitas / tot * 100) : 0}%</b></div>
        <div class="grow"><div class="small mut" style="font-weight:600">${esc(c.workoutName)} · ${feitas}/${tot}</div><div class="relogio" data-clock="cur">00:00</div></div>
        <button class="btn sm" data-act="parar">Parar</button><button class="btn ok sm" data-act="finish">Finalizar</button></div>
      ${items}
      <div class="row" style="margin-top:20px;justify-content:center"><button class="btn ghost sm" data-act="parar">Parar treino</button></div>
    </div>${vRest()}`;
  }

  function vRest() {
    const c = S.current; const r = c && c.rest;
    if (!r || !r.start) return `<div class="rest"><div class="inner"><div class="iconbtn" style="background:var(--acc-soft);color:var(--acc-tx);border:0">${ic.timer}</div><div class="grow small mut">Marque uma série e o descanso começa sozinho</div><button class="btn sm" data-act="rest-start">Iniciar</button></div></div>`;
    return `<div class="rest" id="rest"><div class="inner"><div class="rring">${ring(0, 54, 6)}</div>
      <div class="grow"><div class="t" data-clock="rest">00:00</div><div class="tiny mut" id="rest-lbl" style="margin-top:3px;font-weight:600">Alvo ${r.min}–${r.max}s</div></div>
      <button class="btn sm" data-act="rest-start">Zerar</button><button class="iconbtn" data-act="rest-stop" aria-label="Fechar">${ic.x}</button></div></div>`;
  }

  // ---- detalhe do exercício (folha) ----
  function videoBox(id, titulo) {
    if (!id) return `<div class="video"><div class="sem">Sem vídeo cadastrado para este exercício.</div></div>`;
    return `<div class="video"><img alt="" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" loading="lazy" onerror="this.style.display='none'"><button class="play" data-act="play" data-id="${id}" aria-label="Tocar vídeo de ${esc(titulo)}"><span>${ic.play}</span></button></div>
      <div class="row small" style="margin-top:8px;justify-content:flex-end"><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Abrir no YouTube ↗</a></div>`;
  }
  function historicoEx(key) {
    const pts = [];
    S.sessions.slice().sort((a, b) => a.start - b.start).forEach(s => s.items.forEach(it => { if (it.key === key && it.done.some(Boolean)) pts.push({ t: s.start, load: it.load, sets: it.done.filter(Boolean).length, of: it.done.length, reps: it.reps, w: s.workoutId }); }));
    return pts;
  }
  function chartLinha(pts, unid) {
    const P = pts.filter(p => p.load != null);
    if (P.length < 2) return `<p class="small mut">${P.length ? "Mais um treino com carga registrada e o gráfico aparece." : "Registre a carga nos treinos para ver o gráfico."}</p>`;
    const W = 340, H = 170, l = 34, r = 12, t = 14, b = 24;
    const ys = P.map(p => p.load), y0 = Math.min(...ys), y1 = Math.max(...ys), pd = (y1 - y0) * 0.15 || 2;
    const lo = Math.max(0, Math.floor(y0 - pd)), hi = Math.ceil(y1 + pd);
    const X = i => l + i * (W - l - r) / (P.length - 1), Y = v => t + (H - t - b) * (1 - (v - lo) / (hi - lo));
    const d = P.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.load).toFixed(1)}`).join("");
    const area = `${d}L${X(P.length - 1).toFixed(1)},${H - b}L${l},${H - b}Z`;
    const ticks = [lo, (lo + hi) / 2, hi].map(v => `<line class="ax" x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" stroke-dasharray="3 4"/><text x="${l - 6}" y="${Y(v) + 3}" text-anchor="end">${fmtNum(v)}</text>`).join("");
    const xl = [0, P.length - 1].map(i => `<text x="${X(i)}" y="${H - 6}" text-anchor="${i ? "end" : "start"}">${fmtData(P[i].t)}</text>`).join("");
    return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--acc);stop-opacity:0"/></linearGradient></defs>${ticks}<path class="area" d="${area}"/><path class="ln" d="${d}"/>${P.map((p, i) => `<circle class="pt" cx="${X(i)}" cy="${Y(p.load)}" r="4"/>`).join("")}${xl}<text x="${l}" y="9">${unid}</text></svg>`;
  }
  function vExSheet(key) {
    const e = findEx(key); if (!e) return `<div class="wrap">Exercício não encontrado.</div>`;
    const st = exState(key); const hist = historicoEx(key); const unid = unidadeCarga(e);
    const loads = hist.map(h => h.load).filter(v => v != null);
    const alt = e.alt && e.alt.name ? `<div class="sec">Se a máquina estiver ocupada</div><div class="card"><div class="row"><span class="pill acc">Alternativa</span><b>${esc(e.alt.name)}</b></div>${e.alt.video ? `<div style="margin-top:12px">${videoBox(e.alt.video, e.alt.name)}</div>` : ""}</div>` : "";
    return `<div class="grab"></div><div class="sheet-head"><b class="grow">${esc(e.name)}</b><button class="iconbtn" data-act="close" aria-label="Fechar">${ic.x}</button></div>
    <div class="wrap" style="padding-top:4px">
      ${videoBox(e.video, e.name)}
      <div class="row wrapx" style="gap:6px;margin-top:4px"><span class="pill">${isCardio(e) ? `${e.reps} ${esc(e.unit || "min")}` : `${e.sets} séries × ${e.reps} reps`}</span>${e.rest ? `<span class="pill">descanso ${esc(e.rest)}</span>` : ""}</div>
      <div class="sec">${isCardio(e) ? "Velocidade" : "Carga"} atual (${unid})</div>
      <div class="stepper"><button data-act="load-dn" data-k="${esc(key)}">−</button>
        <input id="carga-in" type="number" inputmode="decimal" step="0.5" value="${st.load == null ? "" : st.load}" placeholder="–" data-k="${esc(key)}">
        <button data-act="load-up" data-k="${esc(key)}">+</button></div>
      <div class="tiny mut" style="margin-top:8px">Passo de ${fmtNum(isCardio(e) ? 0.5 : S.settings.step)} ${unid}. Fica salva e vale para os próximos treinos.</div>
      <div class="sec">Minhas observações</div>
      <textarea id="notas" data-k="${esc(key)}" placeholder="Ex.: banco na posição 4, pegador mais alto…">${esc(st.notes)}</textarea>
      <div class="sec">Pontos de atenção</div>
      <div class="card" style="padding:6px 16px"><ul class="tips">${e.tips.map(t => `<li>${esc(t)}</li>`).join("") || "<li>—</li>"}</ul></div>
      ${alt}
      <div class="sec">Músculos</div>
      <div class="card"><div class="corpo-grande">${window.Corpo.svg(e.p, e.s, { labels: true })}</div>
      <div class="musc-list">${e.p.map(k => `<span class="chip p">${esc(M[k])}</span>`).join("")}${e.s.map(k => `<span class="chip s">${esc(M[k])}</span>`).join("")}</div>
      <div class="tiny mut" style="margin-top:8px">Cor forte: principal · clara: auxiliar</div></div>
      <div class="sec">Evolução</div>
      ${loads.length ? `<div class="stats" style="margin-bottom:12px"><div class="stat"><b>${fmtNum(loads[0])}</b><span>primeira (${unid})</span></div><div class="stat"><b>${fmtNum(Math.max(...loads))}</b><span>máxima (${unid})</span></div></div>` : ""}
      ${hist.length ? `<div class="card">${chartLinha(hist, unid)}</div><table style="margin-top:6px"><tr><th>Data</th><th>Treino</th><th class="n">${unid}</th><th class="n">Séries</th></tr>${hist.slice().reverse().slice(0, 30).map(h => `<tr><td>${fmtData(h.t)}</td><td>${esc(h.w)}</td><td class="n">${fmtNum(h.load)}</td><td class="n">${h.sets}/${h.of}</td></tr>`).join("")}</table>` : `<p class="small mut">Nenhum treino registrado com este exercício ainda.</p>`}
    </div>`;
  }

  function resumoDados(s) {
    let tot = 0, feitas = 0, vol = 0;
    s.items.forEach(it => { tot += it.done.length; const f = it.done.filter(Boolean).length; feitas += f; if (!isCardio(it) && it.load) vol += f * it.reps * it.load; });
    return { tot, feitas, vol, dur: (s.end || now()) - s.start };
  }
  function vResumo(id, posTreino) {
    const s = S.sessions.find(x => x.id === id); if (!s) return `<div class="wrap">Sessão não encontrada.</div>${nav()}`;
    const R = resumoDados(s);
    const ant = S.sessions.filter(x => x.workoutId === s.workoutId && x.start < s.start).sort((a, b) => b.start - a.start)[0];
    const RA = ant && resumoDados(ant);
    const delta = (a, b, fmt, inv) => { if (b == null) return ""; const d = a - b; if (Math.abs(d) < 1e-9) return ` <span style="opacity:.8">=</span>`; const good = inv ? d < 0 : d > 0; return ` <span style="opacity:.95">${good ? "▲" : "▼"} ${fmt(Math.abs(d))}</span>`; };
    const linhas = s.items.map(it => {
      const pa = ant && ant.items.find(x => x.key === it.key);
      const f = it.done.filter(Boolean).length;
      const dl = pa && pa.load != null && it.load != null && it.load !== pa.load ? `<span class="${it.load > pa.load ? "up" : "down"} tiny"> ${it.load > pa.load ? "▲" : "▼"}${fmtNum(Math.abs(it.load - pa.load))}</span>` : "";
      return `<tr data-act="ex" data-k="${esc(it.key)}" style="cursor:pointer"><td>${esc(it.name)}</td><td class="n">${f}/${it.done.length}</td><td class="n">${fmtNum(it.load)}${dl}</td></tr>`;
    }).join("");
    return `<div class="wrap">
      ${posTreino ? "" : `<button class="btn sm ghost" data-act="nav" data-v="hist">← Histórico</button>`}
      <div class="hero fade" style="margin-top:${posTreino ? 4 : 14}px">
        <div class="small" style="opacity:.9;font-weight:600">${posTreino ? "Treino concluído" : fmtDataLonga(s.start)} · ${fmtHora(s.start)}</div>
        <h1 style="color:#fff">${esc(s.workoutName)}</h1>
        <div class="stats" style="margin-top:14px">
          <div class="stat"><b>${fmtDur(R.dur)}</b><span>duração${RA ? delta(R.dur, RA.dur, fmtMin, true) : ""}</span></div>
          <div class="stat"><b>${R.feitas}/${R.tot}</b><span>séries feitas</span></div>
          <div class="stat"><b>${fmtNum(R.vol)}</b><span>volume kg×reps${RA ? delta(R.vol, RA.vol, fmtNum) : ""}</span></div>
          <div class="stat"><b>${sessoesDe(s.workoutId).filter(x => x.start <= s.start).length}º</b><span>treino ${esc(s.workoutId)}</span></div>
        </div></div>
      ${RA ? `<p class="tiny mut">Setas comparam com o ${esc(s.workoutId)} de ${fmtData(ant.start)}.</p>` : ""}
      <h2>Exercícios</h2>
      <div class="card" style="padding:4px 14px"><table><tr><th>Exercício</th><th class="n">Séries</th><th class="n">Carga</th></tr>${linhas}</table></div>
      <p class="tiny mut">Toque num exercício para ver a evolução.</p>
      ${posTreino ? `<button class="btn pri block" style="margin-top:16px" data-act="nav" data-v="home">Concluir</button>` : `<button class="btn danger sm" style="margin-top:16px" data-act="del-sessao" data-id="${s.id}">Apagar este registro</button>`}
    </div>${posTreino ? "" : nav()}`;
  }

  function vHist() {
    const ss = S.sessions.slice().sort((a, b) => b.start - a.start);
    const w0 = inicioSemana(now()); const weeks = []; for (let i = 11; i >= 0; i--) weeks.push({ t: w0 - i * 7 * 864e5, n: 0 });
    ss.forEach(s => { const w = weeks.find(x => x.t === inicioSemana(s.start)); if (w) w.n++; });
    const W = 340, H = 130, bw = (W - 20) / 12, mx = Math.max(3, ...weeks.map(w => w.n));
    const bars = weeks.map((w, i) => { const h = Math.max(3, (H - 34) * w.n / mx); return `<rect class="bar" x="${10 + i * bw + 4}" y="${H - 20 - h}" width="${bw - 8}" height="${h}" rx="5" opacity="${w.n ? 1 : .18}"/>${w.n ? `<text x="${10 + i * bw + bw / 2}" y="${H - 25 - h}" text-anchor="middle">${w.n}</text>` : ""}`; }).join("");
    const chartSem = `<svg class="chart" viewBox="0 0 ${W} ${H}">${bars}<text x="10" y="${H - 4}">${fmtData(weeks[0].t)}</text><text x="${W - 10}" y="${H - 4}" text-anchor="end">esta semana</text></svg>`;
    const mes = ss.filter(s => new Date(s.start).getMonth() === new Date().getMonth() && new Date(s.start).getFullYear() === new Date().getFullYear()).length;
    const durMed = ss.length ? ss.reduce((a, s) => a + (s.end - s.start), 0) / ss.length : 0;
    const keys = new Map(); ss.forEach(s => s.items.forEach(it => { if (it.done.some(Boolean)) { const k = keys.get(it.key) || { name: it.name, n: 0, last: null, first: null }; k.n++; if (it.load != null) { if (k.last == null) k.last = it.load; k.first = it.load; } keys.set(it.key, k); } }));
    const exList = [...keys.entries()].map(([k, v]) => `<button class="list-btn" data-act="ex" data-k="${esc(k)}"><div class="grow"><b>${esc(v.name)}</b><div class="tiny mut">${v.n} treino(s)</div></div><div class="n">${v.last == null ? `<span class="tiny mut">sem carga</span>` : `<span class="mut">${fmtNum(v.first)} →</span> <b>${fmtNum(v.last)}</b>${v.last > v.first ? ` <span class="up tiny">▲</span>` : ""}`}</div></button>`).join("");
    return `<div class="wrap"><h1>Histórico</h1>
      <div class="hero" style="margin-top:14px"><div class="stats">
        <div class="stat"><b>${ss.length}</b><span>treinos no total</span></div><div class="stat"><b>${mes}</b><span>neste mês</span></div>
        <div class="stat"><b>${ss.length ? fmtMin(durMed) : "–"}</b><span>duração média</span></div><div class="stat"><b>${ss[0] ? diasAtras(ss[0].start) : "–"}</b><span>último treino</span></div></div></div>
      <h2>Treinos por semana</h2><div class="card">${chartSem}</div>
      <h2>Evolução de carga</h2>${exList || `<p class="small mut">Complete um treino para começar a acompanhar.</p>`}
      <h2>Sessões</h2>
      ${ss.map(s => { const R = resumoDados(s); return `<button class="list-btn" data-act="sessao" data-id="${s.id}"><div class="letra sm">${esc(s.workoutId)}</div><div class="grow"><b>${fmtDataLonga(s.start)}</b><div class="tiny mut">${fmtDur(R.dur)} · ${R.feitas}/${R.tot} séries · ${fmtNum(R.vol)} kg vol.</div></div><span class="chev">›</span></button>`; }).join("") || `<p class="small mut">Nenhum treino ainda.</p>`}
    </div>${nav()}`;
  }

  function vAjustes() {
    const p = prog(); const arq = S.programs.filter(x => x.id !== S.activeProgramId);
    const size = (() => { try { return Math.round((localStorage.getItem(KEY) || "").length / 1024); } catch (e) { return "?"; } })();
    const th = S.settings.theme || "auto";
    return `<div class="wrap"><h1>Ajustes</h1>
      <div class="sec">Aparência</div>
      <div class="seg">${[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([v, n]) => `<button data-act="theme" data-v="${v}" class="${th === v ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="f"><label>Seu nome (aparece na saudação)</label><input id="opt-name" value="${esc(S.settings.name || "")}"></div>

      <div class="sec">Série atual</div>
      <div class="card"><b style="font-size:17px">${esc(p ? p.name : "—")}</b><div class="small mut">${esc(p ? p.coach || "" : "")} · desde ${p ? fmtData(p.createdAt) : "–"}</div>
        <div class="row wrapx" style="margin-top:14px"><button class="btn sm" data-act="edit">Editar exercícios</button><button class="btn sm" data-act="nova-serie">Começar série nova</button></div></div>
      <button class="list-btn" data-act="nav" data-v="arquivo"><div class="grow"><b>Séries anteriores</b><div class="tiny mut">${arq.length} guardada(s), com todo o histórico</div></div><span class="chev">›</span></button>

      <div class="sec">Backup e troca de celular</div>
      <div class="card"><div class="small" style="color:var(--tx2)">Tudo fica salvo neste aparelho. Para levar para outro celular, exporte o arquivo e importe no novo.</div>
        <div class="row wrapx" style="margin-top:14px"><button class="btn pri sm" data-act="export">Exportar tudo</button><label class="btn sm">Importar arquivo<input type="file" accept=".json,application/json" id="imp" hidden></label></div>
        <div class="tiny mut" style="margin-top:12px">Último backup: ${S.settings.lastBackup ? fmtData(S.settings.lastBackup) : "nunca"} · ${S.sessions.length} treinos · ${size} KB</div>
        <div class="tiny mut" style="margin-top:4px">Importar aceita um backup completo (substitui tudo) ou um arquivo só com uma série nova.</div></div>

      <div class="sec">Treino</div>
      <div class="card" style="padding:4px 16px">
        <div class="set-row"><span class="grow">Som no fim do descanso</span><label class="switch"><input type="checkbox" id="opt-sound" ${S.settings.sound ? "checked" : ""}><span></span></label></div>
        <div class="set-row"><span class="grow">Passo da carga</span><select id="opt-step" style="width:auto">${[1, 2, 2.5, 5].map(v => `<option value="${v}" ${S.settings.step == v ? "selected" : ""}>${fmtNum(v)} kg</option>`).join("")}</select></div>
      </div>

      <div class="sec">Zona de perigo</div>
      <button class="btn danger sm" data-act="reset">Apagar todos os dados deste aparelho</button>
      <p class="tiny mut" style="margin-top:24px;text-align:center">Meu Treino ${VERSAO} · seus dados ficam no seu aparelho</p>
    </div>${nav()}`;
  }

  function vArquivo() {
    const arq = S.programs.filter(x => x.id !== S.activeProgramId).sort((a, b) => (b.archivedAt || "").localeCompare(a.archivedAt || ""));
    return `<div class="wrap"><button class="btn sm ghost" data-act="nav" data-v="ajustes">← Ajustes</button><h1 style="margin-top:14px">Séries anteriores</h1>
      ${arq.map(p => `<div class="card"><b>${esc(p.name)}</b><div class="small mut">${esc(p.coach || "")} · ${fmtData(p.createdAt)} → ${p.archivedAt ? fmtData(p.archivedAt) : "?"} · ${S.sessions.filter(s => s.programId === p.id).length} treinos</div>
        <div class="small" style="margin-top:10px;color:var(--tx2)">${p.workouts.map(w => `<div style="margin:4px 0"><b>${esc(w.id)}</b>: ${w.exercises.map(e => esc(e.name)).join(", ")}</div>`).join("")}</div>
        <button class="btn sm" style="margin-top:12px" data-act="reativar" data-id="${p.id}">Voltar a usar esta série</button></div>`).join("") || `<p class="mut small">Nenhuma série anterior ainda. Quando você começar uma série nova, a atual vem para cá com todo o histórico.</p>`}
    </div>${nav()}`;
  }

  // ---- editor ----
  let ED = null;
  function vEditor() {
    if (!ED) ED = JSON.parse(JSON.stringify(prog()));
    const chips = (e, wi, ei) => Object.keys(M).map(k => `<button class="chip ${e.p.includes(k) ? "p" : e.s.includes(k) ? "s" : ""}" data-act="ed-musc" data-w="${wi}" data-e="${ei}" data-m="${k}">${esc(M[k])}</button>`).join("");
    const exEd = (e, wi, ei) => `<details class="ed" ${e._open ? "open" : ""} data-w="${wi}" data-e="${ei}"><summary><span class="mut">${ei + 1}.</span><span class="grow">${esc(e.name || "(sem nome)")}</span><span class="pill">${isCardio(e) ? e.reps + " min" : e.sets + "×" + e.reps}</span></summary>
      <div class="f"><label>Nome</label><input data-ed="name" data-w="${wi}" data-e="${ei}" value="${esc(e.name)}"></div>
      <div class="grid3"><div class="f"><label>Séries</label><input type="number" inputmode="numeric" data-ed="sets" data-w="${wi}" data-e="${ei}" value="${e.sets}"></div>
        <div class="f"><label>${isCardio(e) ? "Minutos" : "Repetições"}</label><input type="number" inputmode="numeric" data-ed="reps" data-w="${wi}" data-e="${ei}" value="${e.reps}"></div>
        <div class="f"><label>Descanso</label><input data-ed="rest" data-w="${wi}" data-e="${ei}" value="${esc(e.rest || "")}" placeholder="45–60 s"></div></div>
      <div class="set-row" style="border:0"><span class="grow small">Aeróbico (por tempo)</span><label class="switch"><input type="checkbox" data-ed="cardio" data-w="${wi}" data-e="${ei}" ${isCardio(e) ? "checked" : ""}><span></span></label></div>
      <div class="f"><label>Vídeo do YouTube (link ou código)</label><input data-ed="video" data-w="${wi}" data-e="${ei}" value="${esc(e.video ? "https://youtu.be/" + e.video : "")}"></div>
      <div class="f"><label>Músculos: toque 1× principal, 2× auxiliar, 3× remove</label><div class="musc-list">${chips(e, wi, ei)}</div></div>
      <div class="f"><label>Pontos de atenção (um por linha)</label><textarea data-ed="tips" data-w="${wi}" data-e="${ei}">${esc(e.tips.join("\n"))}</textarea></div>
      <div class="f"><label>Alternativa se a máquina estiver ocupada</label><input data-ed="altname" data-w="${wi}" data-e="${ei}" value="${esc(e.alt ? e.alt.name : "")}" placeholder="nome"><input style="margin-top:6px" data-ed="altvideo" data-w="${wi}" data-e="${ei}" value="${esc(e.alt && e.alt.video ? "https://youtu.be/" + e.alt.video : "")}" placeholder="vídeo (opcional)"></div>
      <div class="row"><button class="iconbtn" data-act="ed-up" data-w="${wi}" data-e="${ei}">↑</button><button class="iconbtn" data-act="ed-dn" data-w="${wi}" data-e="${ei}">↓</button><span class="grow"></span><button class="btn danger sm" data-act="ed-del" data-w="${wi}" data-e="${ei}">Remover</button></div>
    </details>`;
    return `<div class="wrap">
      <div class="row"><button class="btn sm ghost" data-act="ed-cancel">Cancelar</button><span class="grow"></span><button class="btn pri sm" data-act="ed-save">Salvar</button></div>
      <h1 style="margin-top:14px">Editar série</h1>
      <div class="f"><label>Nome da série</label><input data-ed="pname" value="${esc(ED.name)}"></div>
      <div class="f"><label>Professor(a) / observação</label><input data-ed="pcoach" value="${esc(ED.coach || "")}"></div>
      ${ED.workouts.map((w, wi) => `<div class="card">
        <div class="row"><div class="letra sm">${esc(w.id)}</div><div class="grow"><input data-ed="wname" data-w="${wi}" value="${esc(w.name)}"><input style="margin-top:6px" data-ed="wsub" data-w="${wi}" value="${esc(w.subtitle || "")}" placeholder="descrição curta"></div></div>
        ${w.exercises.map((e, ei) => exEd(e, wi, ei)).join("")}
        <div class="row" style="margin-top:10px"><button class="btn sm" data-act="ed-add" data-w="${wi}">+ Exercício</button><span class="grow"></span>${ED.workouts.length > 1 ? `<button class="btn danger sm" data-act="ed-delw" data-w="${wi}">Remover ${esc(w.id)}</button>` : ""}</div></div>`).join("")}
      <button class="btn block" data-act="ed-addw">+ Treino ${String.fromCharCode(65 + ED.workouts.length)}</button>
      <p class="tiny mut">Mudanças valem para os próximos treinos. Renomear um exercício mantém o histórico de cargas dele.</p>
    </div>`;
  }
  function edField(el) {
    const f = el.dataset.ed, w = ED.workouts[+el.dataset.w], e = w && w.exercises[+el.dataset.e], v = el.type === "checkbox" ? el.checked : el.value;
    if (f === "pname") ED.name = v; else if (f === "pcoach") ED.coach = v;
    else if (f === "wname") w.name = v; else if (f === "wsub") w.subtitle = v;
    else if (e) {
      if (f === "name") e.name = v; else if (f === "sets") e.sets = Math.max(1, +v || 1); else if (f === "reps") e.reps = Math.max(0, +v || 0);
      else if (f === "rest") e.rest = v; else if (f === "video") e.video = ytId(v);
      else if (f === "cardio") { e._open = true; if (v) { e.type = "cardio"; e.unit = "min"; e.sets = 1; } else { delete e.type; delete e.unit; } const y = window.scrollY; $app.innerHTML = vEditor(); window.scrollTo(0, y); }
      else if (f === "tips") e.tips = v.split("\n").map(s => s.trim()).filter(Boolean);
      else if (f === "altname") { e.alt = e.alt || {}; e.alt.name = v; } else if (f === "altvideo") { e.alt = e.alt || {}; e.alt.video = ytId(v); }
    }
  }

  // ---------------- ações ----------------
  function startWorkout(wid) {
    const p = prog(), w = p.workouts.find(x => x.id === wid);
    S.current = {
      id: uid(), programId: p.id, workoutId: w.id, workoutName: w.name, start: now(), rest: null,
      items: w.exercises.map(e => ({ key: e.key, name: e.name, type: e.type, unit: e.unit, sets: e.sets, reps: e.reps, rest: e.rest, load: exState(e.key).load, done: Array(isCardio(e) ? 1 : e.sets).fill(false) }))
    };
    save(); wakeOn(); go({ name: "treino" });
  }
  function restStart(i) {
    const c = S.current; const it = i != null ? c.items[i] : null; const r = parseRest(it && it.rest ? it.rest : "45–60");
    c.rest = { start: now(), min: r.min, max: r.max, b1: false, b2: false }; save();
    const old = document.querySelector(".rest"); if (old) old.outerHTML = vRest(); tick();
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume && actx.resume(); } catch (e) { }
  }
  async function finish() {
    const c = S.current; const R = resumoDados(c);
    if (R.feitas < R.tot) { pararTreino(); return; }
    encerrar();
  }
  function encerrar() {
    const c = S.current; c.end = now(); delete c.rest; S.sessions.push(c); const id = c.id; S.current = null; save(); wakeOff(); dropGuard();
    go({ name: "resumo", id });
  }
  function descartar() { S.current = null; save(); wakeOff(); dropGuard(); go({ name: "home" }); }
  async function pararTreino() {
    const c = S.current; if (!c || document.querySelector(".dlg-bg")) return; const R = resumoDados(c);
    const msg = R.feitas ? `Você fez ${R.feitas} de ${R.tot} séries em ${fmtDur(now() - c.start)}.` : "Nenhuma série marcada ainda.";
    const ops = [];
    if (R.feitas) ops.push({ v: "save", label: "Parar e salvar o que fiz", cls: "pri" });
    ops.push({ v: "discard", label: "Cancelar treino (não salvar)", cls: "danger" });
    ops.push({ v: "cont", label: "Continuar treinando", cls: "ghost" });
    const r = await choice("Parar o treino?", msg, ops);
    if (r === "save") encerrar(); else if (r === "discard") descartar();
  }
  function exportar() {
    const data = JSON.stringify(Object.assign({}, S, { exportedAt: new Date().toISOString(), app: "meu-treino" }), null, 1);
    const d0 = new Date(); const nome = `meu-treino-backup-${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}.json`;
    const blob = new Blob([data], { type: "application/json" });
    const done = () => { S.settings.lastBackup = now(); save(); render(); };
    const file = typeof File === "function" ? new File([blob], nome, { type: "application/json" }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "Backup Meu Treino" }).then(done).catch(err => { if (err && err.name !== "AbortError") baixar(blob, nome, done); });
    } else baixar(blob, nome, done);
  }
  function baixar(blob, nome, cb) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); cb && cb(); toast("Arquivo salvo em Downloads"); }
  async function importar(file) {
    let d; try { d = JSON.parse(await file.text()); } catch (e) { toast("Arquivo inválido"); return; }
    if (d && d.schema && Array.isArray(d.programs)) {
      if (!(await ask(`Substituir tudo neste aparelho pelo backup de ${d.exportedAt ? fmtData(d.exportedAt) : "?"} (${(d.sessions || []).length} treinos)?`, "Substituir", true))) return;
      const b = blank(); S = Object.assign(b, d); S.settings = Object.assign(blank().settings, d.settings || {}); delete S.chats; delete S.exportedAt; delete S.app;
      save(); applyTheme(); toast("Backup importado"); go({ name: S.current ? "treino" : "home" });
    } else if (d && Array.isArray(d.workouts)) {
      if (!(await ask(`Carregar a série “${esc(d.name || "nova")}” como série atual? A atual vai para Séries anteriores, com o histórico.`, "Carregar"))) return;
      const p = normalizarPrograma(d); if (S.programs.some(x => x.id === p.id)) p.id = uid();
      arquivarAtual(); S.programs.push(p); S.activeProgramId = p.id; save(); toast("Série nova carregada"); go({ name: "home" });
    } else toast("Não reconheci esse arquivo");
  }
  function arquivarAtual() { const p = prog(); if (p) { p.status = "archived"; p.archivedAt = new Date().toISOString(); } }

  document.addEventListener("click", async ev => {
    const b = ev.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act;
    if (a === "nav") { if (view.name === "editor") ED = null; if (sheet) { sheet = null; renderSheet(); ignorePop = true; history.back(); } go({ name: b.dataset.v }); }
    else if (a === "home") go({ name: "home" });
    else if (a === "resume") { wakeOn(); go({ name: "treino" }); }
    else if (a === "start") {
      if (S.current) { if (!(await ask(`Já tem o treino ${esc(S.current.workoutId)} em andamento. Descartar e começar o ${esc(b.dataset.w)}?`, "Começar novo", true))) { go({ name: "treino" }); return; } S.current = null; }
      startWorkout(b.dataset.w);
    }
    else if (a === "set") {
      const it = S.current.items[+b.dataset.i], s = +b.dataset.s; it.done[s] = !it.done[s]; save();
      if (it.done[s]) { if (navigator.vibrate) navigator.vibrate(30); const todas = S.current.items.every(x => x.done.every(Boolean)); if (!todas && !isCardio(it)) restStart(+b.dataset.i); }
      const y = window.scrollY; $app.innerHTML = vTreino(); window.scrollTo(0, y); tick();
    }
    else if (a === "rest-start") restStart(null);
    else if (a === "rest-stop") { S.current.rest = null; save(); const r = document.querySelector(".rest"); if (r) r.outerHTML = vRest(); }
    else if (a === "finish") finish();
    else if (a === "parar") pararTreino();
    else if (a === "ex") openSheet({ type: "ex", key: b.dataset.k });
    else if (a === "close") closeSheet();
    else if (a === "play") { const box = b.closest(".video"); box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="vídeo"></iframe>`; }
    else if (a === "load-up" || a === "load-dn") {
      const e = findEx(b.dataset.k); const step = isCardio(e) ? 0.5 : +S.settings.step; const cur = exState(b.dataset.k).load || 0;
      const v = Math.max(0, cur + (a === "load-up" ? step : -step)); setLoad(b.dataset.k, v); const inp = document.getElementById("carga-in"); if (inp) inp.value = v;
    }
    else if (a === "sessao") go({ name: "sessao", id: b.dataset.id });
    else if (a === "del-sessao") { if (await ask("Apagar este registro de treino?", "Apagar", true)) { S.sessions = S.sessions.filter(s => s.id !== b.dataset.id); save(); go({ name: "hist" }); } }
    else if (a === "export") exportar();
    else if (a === "theme") { S.settings.theme = b.dataset.v; save(); applyTheme(); render(); }
    else if (a === "edit") { ED = null; go({ name: "editor" }); }
    else if (a === "nova-serie") {
      if (!(await ask("Começar uma série nova a partir da atual? A atual vai para Séries anteriores (com histórico) e você edita a nova. Se o professor passou um arquivo, use Importar.", "Começar"))) return;
      const p = normalizarPrograma(Object.assign(JSON.parse(JSON.stringify(prog())), { id: uid(), createdAt: new Date().toISOString(), status: "active", archivedAt: null }));
      p.name = p.name + " (nova)"; arquivarAtual(); S.programs.push(p); S.activeProgramId = p.id; save(); ED = null; go({ name: "editor" });
    }
    else if (a === "reativar") { if (await ask("Voltar a usar esta série? A atual vai para Séries anteriores.", "Usar esta")) { arquivarAtual(); const p = S.programs.find(x => x.id === b.dataset.id); p.status = "active"; delete p.archivedAt; S.activeProgramId = p.id; save(); go({ name: "home" }); } }
    else if (a === "reset") { if (await ask("Apagar TODOS os dados deste aparelho? Exporte um backup antes.", "Apagar tudo", true)) { localStorage.removeItem(KEY); S = load(); save(); applyTheme(); go({ name: "home" }); } }
    else if (a === "ed-save") { ED.workouts.forEach(w => w.exercises.forEach(e => { delete e._open; e.key = e.key || slug(e.name); })); const i = S.programs.findIndex(p => p.id === ED.id); S.programs[i] = normalizarPrograma(ED); ED = null; save(); toast("Série salva"); go({ name: "home" }); }
    else if (a === "ed-cancel") { ED = null; go({ name: "ajustes" }); }
    else if (a.startsWith("ed-")) {
      const w = ED.workouts[+b.dataset.w], ei = +b.dataset.e;
      document.querySelectorAll("details.ed").forEach(d => { const e = ED.workouts[+d.dataset.w].exercises[+d.dataset.e]; if (e) e._open = d.open; });
      if (a === "ed-musc") { const e = w.exercises[ei], k = b.dataset.m; if (e.p.includes(k)) { e.p = e.p.filter(x => x !== k); e.s.push(k); } else if (e.s.includes(k)) e.s = e.s.filter(x => x !== k); else e.p.push(k); }
      else if (a === "ed-up" && ei > 0) { const x = w.exercises.splice(ei, 1)[0]; w.exercises.splice(ei - 1, 0, x); }
      else if (a === "ed-dn" && ei < w.exercises.length - 1) { const x = w.exercises.splice(ei, 1)[0]; w.exercises.splice(ei + 1, 0, x); }
      else if (a === "ed-del") { if (!(await ask(`Remover “${esc(w.exercises[ei].name)}” deste treino?`, "Remover", true))) return; w.exercises.splice(ei, 1); }
      else if (a === "ed-add") w.exercises.push({ name: "Novo exercício", sets: 3, reps: 12, rest: "45–60 s", video: "", p: [], s: [], tips: [], _open: true });
      else if (a === "ed-addw") { const id = String.fromCharCode(65 + ED.workouts.length); ED.workouts.push({ id, name: "Treino " + id, subtitle: "", exercises: [] }); }
      else if (a === "ed-delw") { if (!(await ask(`Remover o treino ${esc(w.id)} inteiro?`, "Remover", true))) return; ED.workouts.splice(+b.dataset.w, 1); }
      const y = window.scrollY; $app.innerHTML = vEditor(); window.scrollTo(0, y);
    }
  });
  document.addEventListener("input", ev => {
    const el = ev.target;
    if (el.dataset.ed && ED) { if (el.dataset.ed !== "cardio") edField(el); }
    else if (el.id === "notas") { exState(el.dataset.k).notes = el.value; clearTimeout(el._t); el._t = setTimeout(save, 400); }
  });
  document.addEventListener("change", ev => {
    const el = ev.target;
    if (el.id === "carga-in") setLoad(el.dataset.k, el.value === "" ? null : parseFloat(String(el.value).replace(",", ".")));
    else if (el.id === "imp" && el.files[0]) { importar(el.files[0]); el.value = ""; }
    else if (el.id === "opt-sound") { S.settings.sound = el.checked; save(); }
    else if (el.id === "opt-step") { S.settings.step = +el.value; save(); }
    else if (el.id === "opt-name") { S.settings.name = el.value.trim(); save(); }
    else if (el.dataset.ed === "cardio" && ED) edField(el);
  });

  // ---------------- folha ----------------
  function renderSheet() {
    document.querySelectorAll(".sheet,.sheet-bg").forEach(x => x.remove());
    document.body.style.overflow = sheet ? "hidden" : "";
    if (!sheet) return;
    const bg = document.createElement("div"); bg.className = "sheet-bg"; bg.addEventListener("click", () => closeSheet());
    const sh = document.createElement("div"); sh.className = "sheet"; sh.innerHTML = vExSheet(sheet.key);
    document.body.append(bg, sh);
  }

  // ---------------- relógios ----------------
  function tick() {
    const c = S.current;
    document.querySelectorAll('[data-clock="cur"]').forEach(el => { el.textContent = c ? fmtDur(now() - c.start) : ""; });
    const r = c && c.rest; const box = document.getElementById("rest");
    if (r && r.start && box) {
      const s = (now() - r.start) / 1000;
      box.querySelector('[data-clock="rest"]').textContent = fmtDur(s * 1000);
      box.classList.toggle("min", s >= r.min && s < r.max); box.classList.toggle("max", s >= r.max);
      const fg = box.querySelector(".fgc"); if (fg) { const C = parseFloat(fg.getAttribute("stroke-dasharray")); fg.setAttribute("stroke-dashoffset", (C * (1 - Math.min(1, s / r.max))).toFixed(2)); }
      const lbl = document.getElementById("rest-lbl"); if (lbl) lbl.textContent = s >= r.max ? "Bora para a próxima série!" : s >= r.min ? `Já pode ir (até ${r.max}s)` : `Alvo ${r.min}–${r.max}s`;
      if (s >= r.min && !r.b1) { r.b1 = true; beep(1); save(); }
      if (s >= r.max && !r.b2) { r.b2 = true; beep(2); save(); }
    }
  }
  setInterval(tick, 500);

  // ---------------- início ----------------
  if (view.name === "treino") wakeOn();
  render();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
