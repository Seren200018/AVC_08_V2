const at = ["yellow", "mint", "blue", "pink", "gray"];
function it(r = {}) {
  const e = document.body, o = {
    ...window.TemplateSettings || {},
    ...r.settings || {}
  }, t = {
    ...window.SymbolSettings || {},
    ...r.symbolSettings || {}
  }, n = Array.from(document.querySelectorAll(".sheet"));
  return n.forEach((s, a) => {
    s.dataset.pageNumber = a + 1, s.id || (s.id = `sheet-${a + 1}`);
  }), {
    body: e,
    sheets: n,
    userSettings: o,
    symbolSettings: t,
    lectureTitle: e.dataset.lectureTitle || o.lectureTitle || "Vorlagenkurs",
    lectureChapter: e.dataset.lectureChapter || o.lectureChapter || "Kapitel",
    highlightColors: r.highlightColors || at,
    audioDefaults: o.audio || { mode: "manual" },
    markerMap: /* @__PURE__ */ new Map(),
    videoEntries: [],
    sheetAudio: [],
    audioRegistry: [],
    notesStorageKey: r.notesStorageKey || "sheetNotesStateV1"
  };
}
function W(r, e) {
  try {
    e();
  } catch (o) {
    console.warn(`${r} failed`, o);
  }
}
function ct(r) {
  let e = !1, o = null;
  function t() {
    if (e || window.MathJax && typeof MathJax.typesetPromise == "function")
      return e = !0, Promise.resolve();
    if (o) return o;
    window.MathJax = window.MathJax || {}, window.MathJax.tex = window.MathJax.tex || { tags: "ams" };
    const s = [
      r.body.dataset.mathjaxSrc,
      ...Array.isArray(r.userSettings.mathJaxSources) ? r.userSettings.mathJaxSources : [],
      "node_modules/mathjax/es5/tex-mml-chtml.js",
      "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
    ].filter(Boolean);
    return o = new Promise((a, i) => {
      const u = (c) => {
        if (c >= s.length) {
          i(new Error("MathJax load failed"));
          return;
        }
        const l = document.createElement("script");
        l.id = "mathjax-script", l.async = !0, l.src = s[c], l.onload = () => {
          e = !0, a();
        }, l.onerror = () => u(c + 1), document.head.appendChild(l);
      };
      u(0);
    }), o;
  }
  function n(s) {
    t().then(() => {
      window.MathJax && typeof MathJax.typesetPromise == "function" && MathJax.typesetPromise(s).catch(() => {
      });
    });
  }
  return { ensureMathJax: t, typeset: n };
}
function lt(r) {
  let e = !1, o = null;
  function t() {
    if (e || window.JSZip && typeof window.JSZip == "function")
      return e = !0, Promise.resolve();
    if (o) return o;
    const n = [
      r.body.dataset.jszipSrc,
      ...Array.isArray(r.userSettings.jsZipSources) ? r.userSettings.jsZipSources : [],
      "node_modules/jszip/dist/jszip.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
    ].filter(Boolean);
    return o = new Promise((s, a) => {
      const i = (u) => {
        if (u >= n.length) {
          a(new Error("JSZip load failed"));
          return;
        }
        const c = document.createElement("script");
        c.src = n[u], c.async = !0, c.onload = () => {
          e = !0, s();
        }, c.onerror = () => i(u + 1), document.head.appendChild(c);
      };
      i(0);
    }), o;
  }
  return { ensureJSZip: t };
}
function ut({ typeset: r, requestAudioUpdate: e }) {
  let o, t, n, s = !1;
  const a = () => s ? !0 : (o = document.getElementById("subsheet-panel"), t = document.getElementById("subsheet-content"), n = document.getElementById("subsheet-close"), !o || !t || !n ? !1 : (n.addEventListener("click", () => {
    document.body.classList.remove("panel-open"), t.innerHTML = "", e();
  }), s = !0, !0));
  document.addEventListener("click", (i) => {
    var f, h;
    const u = (h = (f = i.target).closest) == null ? void 0 : h.call(f, ".sub-page-wrapper");
    if (!u || !a()) return;
    i.stopPropagation();
    const c = u.closest(".sheet");
    if (!c) return;
    const l = c.querySelectorAll(".sub-page-sheet");
    t.innerHTML = "", l.forEach((d) => t.appendChild(d.cloneNode(!0))), document.body.classList.add("panel-open"), o.scrollTop = 0, r([t]), e();
  });
}
function dt({ sheets: r }) {
  r.forEach((e) => {
    const o = Number(e.dataset.pageNumber);
    Array.from(e.querySelectorAll(".sub-page-sheet")).forEach((n, s) => {
      n.dataset.subpageId = `${o}-${s + 1}`;
    });
  });
}
function ht(r) {
  const { sheets: e, markerMap: o, lectureChapter: t, lectureTitle: n } = r, s = document.getElementById("toc-list");
  if (!s) return;
  const a = /* @__PURE__ */ new Map();
  e.forEach((c) => {
    const l = Number(c.dataset.pageNumber);
    c.querySelectorAll("[data-toc]").forEach((f) => {
      const h = (f.dataset.toc || "").trim();
      if (!h) return;
      const d = h;
      o.has(d) || o.set(d, []), o.get(d).push(f);
      const p = a.get(d);
      (!p || l < p.page) && a.set(d, { page: l, sheet: c });
    });
  }), s.innerHTML = "";
  const i = Array.from(a.entries()).sort((c, l) => {
    const f = c[1].page - l[1].page;
    return f !== 0 ? f : c[0].localeCompare(l[0]);
  });
  if (i.forEach(([c, l], f) => {
    var S;
    l.number = f + 1;
    const h = document.createElement("li");
    h.className = "toc-item", h.dataset.target = ((S = l.sheet) == null ? void 0 : S.id) || "", h.setAttribute("role", "button"), h.tabIndex = 0;
    const d = document.createElement("span");
    d.className = "toc-number", d.textContent = `${l.number}.`;
    const p = document.createElement("span");
    p.className = "toc-title";
    const g = `${l.number}. ${c}`;
    p.textContent = c;
    const w = document.createElement("span");
    w.className = "toc-page", w.textContent = l.page, h.append(d, p, w), s.appendChild(h);
    const v = o.get(c) || [];
    v.length && (v[0].textContent = g);
  }), !s.children.length) {
    const c = document.createElement("li");
    c.textContent = "(keine Einträge markiert)", s.appendChild(c);
  }
  s.addEventListener("click", (c) => {
    const l = c.target.closest(".toc-item[data-target]");
    if (!l) return;
    const f = l.dataset.target;
    if (!f) return;
    const h = document.getElementById(f);
    h && (h.scrollIntoView({ behavior: "smooth", block: "start" }), document.body.classList.remove("panel-open"));
  });
  const u = (c) => {
    let l = null;
    return i.forEach(([f, h]) => {
      h.page <= c && (l = { title: f, number: h.number });
    }), l;
  };
  e.forEach((c) => {
    if (c.classList.contains("Titlepage")) return;
    const l = Number(c.dataset.pageNumber), f = u(l);
    if (!f) return;
    const h = pt(c);
    let d = c.querySelector(".page-header");
    d || (d = document.createElement("div"), d.className = "page-header", c.appendChild(d)), d.innerHTML = `<span>${t}</span><span>${f.number}. ${f.title}</span>`;
    let p = c.querySelector(".page-footer");
    p || (p = document.createElement("div"), p.className = "page-footer", c.appendChild(p)), p.innerHTML = `<span class="page-footer__title">${n}</span>`, c.appendChild(ft(h, l)), c.querySelectorAll(".sub-page-sheet").forEach((g, w) => {
      let v = g.querySelector(".page-header");
      v || (v = document.createElement("div"), v.className = "page-header", g.appendChild(v)), v.innerHTML = `<span>${t}</span><span>${f.number}. ${f.title} – ${w + 1}</span>`;
      let S = g.querySelector(".page-footer");
      S || (S = document.createElement("div"), S.className = "page-footer", g.appendChild(S)), S.innerHTML = `<span class="page-footer__title">${n}</span>`;
    });
  });
}
function $e(r) {
  return (r || "").toString().trim().toLowerCase().replace(/['"()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function pt(r) {
  var n, s;
  if (r.dataset.linkSlug) return r.dataset.linkSlug;
  const e = r.dataset.link || "", o = ((s = (n = r.querySelector("[data-toc]")) == null ? void 0 : n.dataset) == null ? void 0 : s.toc) || "";
  let t = $e(e) || $e(o) || $e(r.id) || `sheet-${r.dataset.pageNumber || ""}`;
  if (t || (t = `sheet-${Date.now()}`), r.dataset.linkSlug = t, !document.getElementById(t)) {
    const a = document.createElement("a");
    a.id = t, a.className = "sheet-link-anchor", a.setAttribute("aria-hidden", "true"), r.prepend(a);
  }
  return t;
}
function ft(r, e) {
  const o = document.createElement("a");
  return o.className = "page-number-link", o.href = `#${r}`, o.textContent = e ? `${e}` : r, o.title = `Link zu Seite ${e || r} kopieren`, o.addEventListener("click", (t) => {
    var s;
    t.preventDefault();
    const n = new URL(window.location.href);
    n.hash = r, (s = navigator.clipboard) == null || s.writeText(n.toString()).catch(() => {
    });
  }), o;
}
function mt(r, e) {
  const { sheets: o, symbolSettings: t } = r, n = [], s = (c) => {
    var d;
    const l = c.id;
    if (l && t.byId && t.byId[l]) return t.byId[l];
    const f = c.querySelector("[data-toc]"), h = (d = f == null ? void 0 : f.dataset.toc) == null ? void 0 : d.trim();
    return h && t.byTitle && t.byTitle[h] ? t.byTitle[h] : t.defaultSymbols || "";
  }, a = (c) => c.split(";").map((l) => {
    const [f, ...h] = l.split(":"), d = (f || "").trim(), p = h.join(":").trim();
    return d ? { symbol: d, desc: p } : null;
  }).filter(Boolean), i = (c) => {
    const l = t.globalDefinitions || {}, f = c.map(({ symbol: h }) => {
      const d = l[h];
      return d ? { symbol: h, desc: d } : null;
    }).filter(Boolean);
    return f.length ? f : c;
  }, u = (c) => {
    const l = [], f = c.innerText || "", h = (g) => {
      let w;
      for (; (w = g.exec(f)) !== null; )
        l.push(w[1]);
    };
    h(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g), h(/\\\(([\\s\\S]*?)\\\)/g), h(/\\\[([\\s\\S]*?)\\\]/g);
    const d = /* @__PURE__ */ new Set([
      "begin",
      "end",
      "frac",
      "sqrt",
      "left",
      "right",
      "cdot",
      "ddot",
      "dot",
      "mathrm",
      "mathit",
      "text",
      "sin",
      "cos",
      "tan",
      "exp",
      "log"
    ]), p = [];
    return l.forEach((g) => {
      (g.match(/\\?[A-Za-z][A-Za-z0-9]*/g) || []).forEach((w) => {
        const v = w.replace(/^\\/, "");
        !v || d.has(v) || p.includes(v) || p.push(v);
      });
    }), p.map((g) => ({ symbol: g, desc: "" }));
  };
  o.forEach((c) => {
    if (c.classList.contains("Titlepage")) return;
    const l = c.dataset.symbols || "", f = s(c), h = l.trim() ? a(l) : f.trim() ? a(f) : i(u(c)), d = i(h);
    if (!d.length) return;
    c.classList.add("has-symbols");
    let p = c.querySelector(".symbol-column");
    p || (p = document.createElement("div"), p.className = "symbol-column", c.appendChild(p)), p.innerHTML = "";
    const g = document.createElement("div");
    g.className = "symbol-column-title", g.textContent = "Symbole", p.appendChild(g), d.forEach(({ symbol: w, desc: v }) => {
      const S = document.createElement("div");
      S.className = "symbol-row";
      const L = document.createElement("span");
      L.className = "symbol", L.innerHTML = `\\(${w}\\)`;
      const _ = document.createElement("span");
      _.className = "desc", _.textContent = v || "", S.append(L, _), p.appendChild(S);
    }), n.push(p);
  }), n.length && e && e(n);
}
function gt({ sheets: r }) {
  const e = document.getElementById("fig-list"), o = document.getElementById("table-list");
  if (!e && !o) return;
  const t = { figure: [], table: [] };
  r.forEach((a) => {
    const i = Number(a.dataset.pageNumber);
    a.querySelectorAll("[data-figure]").forEach((u, c) => {
      const l = (u.dataset.figure || u.getAttribute("data-figure") || "").trim();
      l && t.figure.push({ title: l, page: i, sheet: a, idx: c, node: u });
    }), a.querySelectorAll("[data-table]").forEach((u, c) => {
      const l = (u.dataset.table || u.getAttribute("data-table") || "").trim();
      l && t.table.push({ title: l, page: i, sheet: a, idx: c, node: u });
    });
  });
  const n = (a, i, u) => {
    if (a) {
      if (a.innerHTML = "", !i.length) {
        const c = document.createElement("li");
        c.textContent = "(keine Einträge markiert)", a.appendChild(c);
        return;
      }
      i.sort((c, l) => {
        const f = c.page - l.page;
        return f !== 0 ? f : c.title.localeCompare(l.title);
      }), i.forEach((c, l) => {
        var g;
        c.number = l + 1;
        const f = document.createElement("li");
        f.className = "toc-item", f.dataset.target = ((g = c.sheet) == null ? void 0 : g.id) || "", f.setAttribute("role", "button"), f.tabIndex = 0;
        const h = document.createElement("span");
        h.className = "toc-number", h.textContent = `${c.number}.`;
        const d = document.createElement("span");
        d.className = "toc-title", d.textContent = c.title;
        const p = document.createElement("span");
        p.className = "toc-page", p.textContent = c.page, f.append(h, d, p), a.appendChild(f);
      }), u === "figure" && i.forEach((c) => {
        var d, p;
        const l = (d = c.node) == null ? void 0 : d.querySelector("figcaption");
        if (!l) return;
        const f = ((p = l.querySelector("small")) == null ? void 0 : p.outerHTML) || "", h = `<strong>Abb. ${c.number}</strong>: ${c.title}`;
        l.innerHTML = f ? `${h} ${f}` : h;
      }), u === "table" && i.forEach((c) => {
        var h;
        const l = (h = c.node) == null ? void 0 : h.closest("div.image-caption");
        if (!l) return;
        const f = `<strong>Tabelle ${c.number}</strong>: ${c.title}`;
        l.innerHTML = f;
      });
    }
  };
  n(e, t.figure, "figure"), n(o, t.table, "table");
  const s = (a) => {
    const i = a.target.closest(".toc-item[data-target]");
    if (!i) return;
    const u = i.dataset.target;
    if (!u) return;
    const c = document.getElementById(u);
    c && (c.scrollIntoView({ behavior: "smooth", block: "start" }), document.body.classList.remove("panel-open"));
  };
  e && e.addEventListener("click", s), o && o.addEventListener("click", s);
}
function bt(r, { ensureJSZip: e }) {
  const { sheets: o, highlightColors: t, notesStorageKey: n } = r;
  let s = h(n), a = null, i = null, u = null, c = null, l = null, f = !1;
  s.docId = s.docId || ne(), s.sheetMeta = Array.isArray(s.sheetMeta) ? s.sheetMeta : [];
  function h(y) {
    try {
      const m = localStorage.getItem(y);
      if (!m) return { notes: {}, highlights: {} };
      const x = JSON.parse(m);
      return {
        notes: x.notes || {},
        highlights: x.highlights || {},
        docId: x.docId,
        sheetMeta: x.sheetMeta || []
      };
    } catch (m) {
      return console.warn("Notes load failed", m), { notes: {}, highlights: {} };
    }
  }
  function d() {
    try {
      s.docId || (s.docId = ne()), Array.isArray(s.sheetMeta) || (s.sheetMeta = []), localStorage.setItem(n, JSON.stringify(s));
    } catch (y) {
      console.warn("Notes save failed", y);
    }
  }
  function p() {
    s.notes = s.notes || {}, s.highlights = s.highlights || {}, s.sheetMeta = ae(), d(), o.forEach((y, m) => {
      if (y.classList.contains("Titlepage")) return;
      const x = y.id || `sheet-${m + 1}`, C = s.notes[x] || "";
      let I = y.querySelector(".sheet-notes");
      I || (I = document.createElement("div"), I.className = "sheet-notes", I.innerHTML = `
          <div class="sheet-notes__title"></div>
          <textarea class="sheet-notes__area" aria-label="Notizen"></textarea>
          <div class="sheet-notes__highlights"></div>
        `, y.appendChild(I));
      const $ = I.querySelector(".sheet-notes__title");
      $ && ($.textContent = `Notizen zu Seite ${y.dataset.pageNumber || m + 1}`);
      const D = I.querySelector(".sheet-notes__area");
      D && (D.value = C, D.addEventListener("input", () => {
        s.notes[x] = D.value, d();
      })), v(y, x);
    }), de();
  }
  function g(y, m) {
    s.highlights[m] = [], y.querySelectorAll(".highlight-note").forEach((x) => _(x)), d();
  }
  function w(y, m, x, C, I) {
    const $ = (x.toString() || "").trim();
    if (!$) return;
    const D = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: $,
      comment: C || "",
      color: t.includes(I) ? I : "yellow"
    };
    if (!S(y, D, x)) return;
    const z = s.highlights[m] || [];
    z.push(D), s.highlights[m] = z, d(), E(), N();
  }
  function v(y, m) {
    (s.highlights && s.highlights[m] || []).forEach((C) => {
      S(y, C);
    });
  }
  function S(y, m, x = null) {
    if (!m || !m.text || y.querySelector(`[data-hl-id="${m.id}"]`)) return null;
    let C = x;
    if (!C) {
      const D = O(y, m.text);
      if (!D) return null;
      C = D.range;
    }
    const I = C.extractContents(), $ = document.createElement("span");
    return $.className = "highlight-note", $.dataset.hlId = m.id, $.dataset.hlColor = t.includes(m.color) ? m.color : "yellow", $.title = m.comment || "Kommentar", $.appendChild(I), C.insertNode($), $.addEventListener("click", (D) => {
      D.stopPropagation(), y.classList.add("notes-open"), R(C, y, y.id || "", m);
    }), $;
  }
  function L(y) {
    var C, I, $, D;
    const m = ((C = y.commonAncestorContainer) == null ? void 0 : C.nodeType) === 1 ? y.commonAncestorContainer : (I = y.commonAncestorContainer) == null ? void 0 : I.parentElement, x = ($ = m == null ? void 0 : m.closest) == null ? void 0 : $.call(m, ".highlight-note");
    return ((D = x == null ? void 0 : x.dataset) == null ? void 0 : D.hlId) || "";
  }
  function _(y) {
    const m = y.parentNode;
    if (!m) return;
    const x = document.createDocumentFragment();
    for (; y.firstChild; )
      x.appendChild(y.firstChild);
    m.replaceChild(x, y), m.normalize();
  }
  function M(y) {
    Object.keys(s.highlights || {}).forEach((m) => {
      s.highlights[m] = (s.highlights[m] || []).filter((x) => x.id !== y);
    }), document.querySelectorAll(`.highlight-note[data-hl-id="${y}"]`).forEach((m) => _(m)), d();
  }
  function b() {
    document.addEventListener("selectionchange", T), document.addEventListener("mouseup", () => {
      T(), A();
    }), document.addEventListener("keyup", T), document.addEventListener("contextmenu", (y) => {
      const m = y.target.closest(".sheet");
      if (!m) return;
      const x = P(m);
      if (!x) return;
      y.preventDefault();
      const C = L(x.range);
      u = { sheet: x.sheet, sheetId: x.sheetId, range: x.range, highlightId: C }, k(y.clientX, y.clientY);
    }), document.addEventListener("click", (y) => {
      if (f) {
        f = !1;
        return;
      }
      a && (a.contains(y.target) || E());
    }), document.addEventListener("keydown", (y) => {
      y.key === "Escape" && (E(), N());
    });
  }
  function k(y, m) {
    E({ keepPending: !0 }), a = document.createElement("div"), a.className = "highlight-menu";
    const x = document.createElement("button");
    x.type = "button", x.textContent = "Highlight + Notiz", x.addEventListener("click", () => {
      const D = u;
      E(), D && R(D.range, D.sheet, D.sheetId);
    }), a.appendChild(x);
    const C = document.createElement("button");
    if (C.type = "button", C.textContent = "Text kopieren", C.addEventListener("click", () => {
      var z, V;
      const D = u;
      if (!D) return;
      const Q = (((z = D.range) == null ? void 0 : z.toString()) || "").trim();
      Q && ((V = navigator.clipboard) == null || V.writeText(Q).catch(() => {
      })), E();
    }), a.appendChild(C), u != null && u.highlightId) {
      const D = document.createElement("button");
      D.type = "button", D.textContent = "🗑️", D.title = "Highlight löschen", D.addEventListener("click", () => {
        M(u.highlightId), E();
      }), a.appendChild(D);
    }
    document.body.appendChild(a);
    const I = m + window.scrollY + 6, $ = y + window.scrollX + 6;
    a.style.top = `${I}px`, a.style.left = `${$}px`, f = !0;
  }
  function E(y = {}) {
    const { keepPending: m = !1 } = y;
    a && (a.remove(), a = null), m || (u = null);
  }
  function A() {
    var z, V;
    if (a || i) return;
    const y = window.getSelection();
    if (!y || y.isCollapsed) return;
    const m = y.getRangeAt(0).cloneRange(), x = m.commonAncestorContainer.nodeType === 1 ? m.commonAncestorContainer : m.commonAncestorContainer.parentElement;
    if ((z = x == null ? void 0 : x.closest) != null && z.call(x, ".sheet-notes")) return;
    const C = (V = x == null ? void 0 : x.closest) == null ? void 0 : V.call(x, ".sheet");
    if (!C) return;
    const I = L(m);
    u = { sheet: C, sheetId: C.id || "", range: m, highlightId: I };
    const $ = m.getBoundingClientRect(), D = $.right, Q = $.bottom;
    k(D, Q);
  }
  function R(y, m, x, C = null) {
    N(), x || (x = m.id || ""), i = document.createElement("div"), i.className = "highlight-create", i.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
        <div style="font-size:11px; font-weight:700;">Kommentar hinzufügen</div>
        <button type="button" class="hlc-close" aria-label="Schließen">✕</button>
      </div>
      <div style="font-size:11px; margin:2mm 0; color:#555;">${(y.toString() || "").slice(0, 120)}</div>
      <div class="hlc-color-row">
        ${t.map(
      (X) => `<button type="button" class="hlc-color-btn" data-color="${X}" title="${X}" aria-label="Farbe ${X}"></button>`
    ).join("")}
      </div>
      <textarea class="hlc-text" aria-label="Kommentar" placeholder="Kommentar (optional)"></textarea>
      <div class="highlight-editor__actions">
        <button type="button" class="hl-save">Speichern</button>
        ${C ? '<button type="button" class="hl-delete" title="Highlight löschen">🗑️</button>' : ""}
        <button type="button" class="hl-cancel">Abbrechen</button>
      </div>
    `, document.body.appendChild(i);
    const I = y.getBoundingClientRect(), $ = i.getBoundingClientRect();
    let D = I.bottom + window.scrollY + 8, Q = I.left + window.scrollX;
    Q = Math.min(Q, window.scrollX + window.innerWidth - $.width - 8), D = Math.max(8 + window.scrollY, D), i.style.top = `${D}px`, i.style.left = `${Q}px`;
    const z = i.querySelector(".hlc-text"), V = Array.from(i.querySelectorAll(".hlc-color-btn"));
    let U = C && t.includes(C.color) ? C.color : "yellow";
    const J = () => {
      V.forEach((X) => {
        const pe = X.dataset.color;
        X.classList.toggle("is-selected", pe === U);
      });
    };
    J(), V.forEach((X) => {
      X.addEventListener("click", () => {
        U = X.dataset.color, J();
      });
    }), C && (z.value = C.comment || "");
    const te = i.querySelector(".hl-save"), se = i.querySelector(".hl-delete"), he = i.querySelector(".hl-cancel"), Ne = i.querySelector(".hlc-close"), we = () => N();
    te == null || te.addEventListener("click", () => {
      const X = z.value.trim(), pe = U;
      if (C) {
        C.comment = X, C.color = t.includes(pe) ? pe : "yellow";
        const Pe = m.querySelector(`.highlight-note[data-hl-id="${C.id}"]`);
        Pe && (Pe.title = X || "Kommentar", Pe.dataset.hlColor = C.color), d();
      } else
        w(m, x, y, X, pe);
      we();
    }), se == null || se.addEventListener("click", () => {
      C && (M(C.id), we());
    }), he == null || he.addEventListener("click", we), Ne == null || Ne.addEventListener("click", we);
  }
  function N() {
    i && (i.remove(), i = null);
  }
  function T() {
    var I, $;
    const y = window.getSelection();
    if (!y || y.isCollapsed) return;
    const m = y.getRangeAt(0), x = ($ = (I = m.commonAncestorContainer.nodeType === 1 ? m.commonAncestorContainer : m.commonAncestorContainer.parentElement) == null ? void 0 : I.closest) == null ? void 0 : $.call(I, ".sheet");
    if (!x) return;
    const C = m.getBoundingClientRect();
    c = {
      range: m.cloneRange(),
      sheet: x,
      sheetId: x.id || ""
    }, l = C;
  }
  function P(y) {
    const m = window.getSelection();
    if (m && !m.isCollapsed) {
      const x = m.getRangeAt(0).cloneRange();
      if (y.contains(x.commonAncestorContainer))
        return { range: x, sheet: y, sheetId: y.id || "" };
    }
    return c && c.sheet === y ? {
      range: c.range.cloneRange(),
      sheet: y,
      sheetId: c.sheetId || y.id || "",
      rect: l
    } : null;
  }
  function O(y, m) {
    if (!m) return null;
    const x = document.createTreeWalker(y, NodeFilter.SHOW_TEXT, {
      acceptNode: (I) => !I.parentElement || I.parentElement.closest(".sheet-notes, .highlight-note") ? NodeFilter.FILTER_REJECT : !I.data || !I.data.trim() ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT
    });
    let C;
    for (; C = x.nextNode(); ) {
      const I = C.data.indexOf(m);
      if (I !== -1) {
        const $ = document.createRange();
        return $.setStart(C, I), $.setEnd(C, I + m.length), { range: $ };
      }
    }
    return null;
  }
  function B() {
    const y = document.getElementById("notes-export");
    y && y.addEventListener("click", () => {
      H().catch((m) => console.error("Notes export failed", m));
    });
  }
  async function H() {
    s.docId = s.docId || ne(), s.sheetMeta = ae();
    const y = JSON.stringify(s, null, 2), m = `<!DOCTYPE html>
` + document.documentElement.outerHTML, x = (C, I) => {
      const $ = document.createElement("a");
      $.href = URL.createObjectURL(I), $.download = C, document.body.appendChild($), $.click(), $.remove(), URL.revokeObjectURL($.href);
    };
    try {
      if (await e(), !window.JSZip) throw new Error("JSZip unavailable");
      const C = new JSZip();
      C.file("notes.json", y), C.file("document.html", m);
      const I = await C.generateAsync({ type: "blob" });
      x("notes_bundle.zip", I);
    } catch (C) {
      console.warn("Zip export failed, falling back to JSON", C), x("notes.json", new Blob([y], { type: "application/json" }));
    }
  }
  function F() {
    const y = document.getElementById("notes-import");
    if (!y) return;
    const m = document.createElement("input");
    m.type = "file", m.accept = ".json,.zip,application/json,application/zip", m.style.display = "none", m.addEventListener("change", () => {
      var C;
      const x = (C = m.files) == null ? void 0 : C[0];
      x && (j(x).catch((I) => console.warn("Import failed", I)), m.value = "");
    }), document.body.appendChild(m), y.addEventListener("click", async () => {
      if (!ee()) {
        m.click();
        return;
      }
      const x = await ye();
      x !== "cancel" && (x === "export-import" && await H().catch((C) => console.error("Notes export failed", C)), m.click());
    });
  }
  function Z(y = []) {
    const m = ae(), x = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
    m.forEach((z) => {
      z.slug && x.set(z.slug, z), z.id && C.set(z.id, z);
    });
    const I = (z, V) => {
      if (z != null && z.slug && x.has(z.slug)) return x.get(z.slug);
      if (z != null && z.title) {
        const U = m.find((J) => J.title === z.title);
        if (U) return U;
      }
      return V && C.has(V) ? C.get(V) : null;
    }, $ = /* @__PURE__ */ new Map();
    y.forEach((z) => $.set(z.id, z));
    const D = {}, Q = {};
    Object.entries(s.notes || {}).forEach(([z, V]) => {
      const U = $.get(z), J = I(U, z), te = (J == null ? void 0 : J.id) || z, he = J && U && U.hash && U.hash !== J.hash ? `[Warnung] Seiteninhalt hat sich seit dem Export geändert. Bitte prüfen.

` : "";
      D[te] = he + (V || "");
    }), Object.entries(s.highlights || {}).forEach(([z, V]) => {
      const U = $.get(z), J = I(U, z), te = (J == null ? void 0 : J.id) || z;
      Q[te] = Array.isArray(V) ? V.slice() : [];
    }), s.notes = D, s.highlights = Q, s.sheetMeta = m, d(), o.forEach((z, V) => {
      var se;
      if (z.classList.contains("Titlepage")) return;
      const U = z.id || `sheet-${V + 1}`, J = z.querySelector(".sheet-notes"), te = J == null ? void 0 : J.querySelector(".sheet-notes__area");
      te && (te.value = ((se = s.notes) == null ? void 0 : se[U]) || ""), g(z, U), v(z, U);
    });
  }
  return {
    initSheetNotes: p,
    initNoteExport: B,
    initNoteImport: F,
    initHighlightContextMenu: b
  };
  function ee() {
    const y = Object.values(s.notes || {}), m = Object.values(s.highlights || {}), x = y.some((I) => (I || "").trim().length > 0), C = m.some((I) => Array.isArray(I) && I.length > 0);
    return x || C;
  }
  async function j(y) {
    if ((y.name || "").toLowerCase().endsWith(".zip")) {
      await G(y);
      return;
    }
    const x = await y.text();
    ce(x);
  }
  async function G(y) {
    if (await e(), !window.JSZip) throw new Error("JSZip unavailable for import");
    const m = await y.arrayBuffer(), x = await window.JSZip.loadAsync(m);
    let C = x.file(/notes\.json$/i)[0] || x.file(/\.json$/i)[0];
    if (!C) throw new Error("notes.json not found in zip");
    const I = await C.async("string");
    ce(I);
  }
  function ce(y) {
    const m = JSON.parse(y || "{}");
    s = {
      docId: m.docId || ne(),
      sheetMeta: Array.isArray(m.sheetMeta) ? m.sheetMeta : [],
      notes: m.notes || {},
      highlights: m.highlights || {}
    }, d(), Z(m.sheetMeta || []);
  }
  function ye() {
    return new Promise((y) => {
      const m = document.createElement("div");
      m.className = "notes-import-modal";
      const x = document.createElement("div");
      x.className = "notes-import-dialog", x.innerHTML = `
        <h3 class="notes-import-title">Vorhandene Notizen gefunden</h3>
        <p class="notes-import-text">Beim Import werden aktuelle Notizen und Highlights ersetzt. Möchtest du vorher exportieren?</p>
        <div class="notes-import-actions">
          <button type="button" data-action="export-import" class="primary">Exportieren &amp; importieren</button>
          <button type="button" data-action="import">Nur importieren</button>
          <button type="button" data-action="cancel" class="ghost">Abbrechen</button>
        </div>
      `, m.appendChild(x), document.body.appendChild(m);
      const C = ($) => {
        m.remove(), document.removeEventListener("keydown", I), y($);
      }, I = ($) => {
        $.key === "Escape" && C("cancel");
      };
      document.addEventListener("keydown", I), m.addEventListener("click", ($) => {
        $.target === m && C("cancel");
      }), x.querySelectorAll("button[data-action]").forEach(($) => {
        $.addEventListener("click", () => C($.dataset.action));
      });
    });
  }
  function ae() {
    return o.filter((y) => !y.classList.contains("Titlepage")).map((y) => {
      var x, C;
      const m = {
        id: y.id || "",
        slug: y.dataset.linkSlug || ue(y.dataset.link || y.id || ""),
        title: ((C = (x = y.querySelector("[data-toc]")) == null ? void 0 : x.dataset) == null ? void 0 : C.toc) || y.id || ""
      };
      return m.hash = Ie(le(y)), m;
    });
  }
  function le(y) {
    const m = document.createTreeWalker(y, NodeFilter.SHOW_TEXT, {
      acceptNode: (I) => !I.parentElement || I.parentElement.closest(".sheet-notes") ? NodeFilter.FILTER_REJECT : !I.data || !I.data.trim() ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT
    });
    let x = "", C;
    for (; C = m.nextNode(); )
      x += C.data + " ";
    return x.replace(/\s+/g, " ").trim();
  }
  function Ie(y) {
    let m = 0;
    for (let x = 0; x < y.length; x += 1)
      m = m * 31 + y.charCodeAt(x) | 0;
    return `h${(m >>> 0).toString(16)}`;
  }
  function ue(y) {
    return (y || "").toString().trim().toLowerCase().replace(/['"()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  function ne() {
    return typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
  }
  function de() {
    const y = document.getElementById("notes-toggle-all");
    if (!y) return;
    let m = !1;
    const x = () => {
      y.textContent = m ? "Alle Notizen schließen" : "Alle Notizen öffnen";
    };
    x(), y.addEventListener("click", () => {
      m = !m, o.forEach((C, I) => {
        C.classList.contains("Titlepage") || C.classList.toggle("notes-open", m);
      }), x();
    });
  }
}
function yt(r) {
  const { sheetAudio: e, audioRegistry: o, body: t, sheets: n, audioDefaults: s } = r;
  let a = (t.dataset.audioMode || s.mode || "manual").toLowerCase(), i = v(parseFloat(localStorage.getItem("sheetAudioVolume")) || 1);
  const u = /* @__PURE__ */ (() => {
    let M = null;
    return () => {
      M || (M = requestAnimationFrame(() => {
        M = null, w();
      }));
    };
  })();
  function c() {
    l(), h(), e.length = 0, n.forEach((b) => {
      var A;
      const k = (b.dataset.audioSrc || "").trim();
      if (!k) return;
      const E = (b.dataset.audioTitle || ((A = b.querySelector("[data-toc]")) == null ? void 0 : A.textContent) || "Audio").trim();
      e.push({ sheet: b, src: k, title: E });
    });
    const M = Array.from(document.querySelectorAll('input[name="audio-mode"]'));
    if (M.length) {
      const b = (localStorage.getItem("sheetAudioMode") || "").toLowerCase();
      b === "manual" || b === "autoplay" ? a = b : (a = "manual", localStorage.setItem("sheetAudioMode", a)), M.forEach((k) => {
        k.checked = k.value.toLowerCase() === a, k.addEventListener("change", (E) => {
          a = (E.target.value || "manual").toLowerCase(), localStorage.setItem("sheetAudioMode", a), d();
        });
      });
    }
    d(), L();
  }
  function l() {
    if (t.dataset.audioExclusiveBound === "true") return;
    t.dataset.audioExclusiveBound = "true";
    const M = (b) => {
      const k = b.target;
      !k || k.tagName !== "AUDIO" || (f(k), requestAnimationFrame(() => f(k)));
    };
    document.addEventListener("play", M, !0), document.addEventListener("playing", M, !0);
  }
  function f(M) {
    o.forEach(({ audio: b }) => {
      b && b !== M && b.pause();
    }), document.querySelectorAll("audio").forEach((b) => {
      if (b !== M)
        try {
          b.pause();
        } catch {
        }
    });
  }
  function h() {
    t.dataset.audioFooterToggleBound !== "true" && (t.dataset.audioFooterToggleBound = "true", document.addEventListener(
      "click",
      (M) => {
        var A, R;
        const b = (R = (A = M.target) == null ? void 0 : A.closest) == null ? void 0 : R.call(A, ".page-footer__title");
        if (!b) return;
        const k = b.closest(".page-footer");
        if (!k) return;
        const E = k.querySelector("audio.sheet-audio__hidden");
        E && (M.preventDefault(), M.stopPropagation(), E.paused ? (f(E), E.play().catch(() => {
        })) : E.pause());
      },
      !0
    ));
  }
  function d() {
    if (o.forEach(({ audio: b }) => b.pause()), o.length = 0, document.querySelectorAll(".sheet-audio").forEach((b) => b.remove()), document.querySelectorAll(".sheet-audio__progress").forEach((b) => b.remove()), document.querySelectorAll(".sheet-audio__scrubber").forEach((b) => b.remove()), document.querySelectorAll(".page-footer.has-audio").forEach((b) => {
      var k;
      b.classList.remove("has-audio"), b.style.setProperty("--audio-progress", "0%"), (k = b.querySelector(".page-footer__title")) == null || k.classList.remove("is-playing");
    }), a === "off") return;
    const M = (b, k) => {
      b.classList.add("has-audio");
      const E = document.createElement("div");
      E.className = "sheet-audio sheet-audio--footer";
      const A = document.createElement("audio");
      A.preload = "metadata", A.src = k.src, A.setAttribute("title", k.title), A.className = "sheet-audio__hidden", _(A);
      const R = document.createElement("div");
      R.className = "sheet-audio__progress", b.prepend(R);
      const N = document.createElement("input");
      N.type = "range", N.className = "sheet-audio__scrubber", N.min = "0", N.max = "100", N.step = "0.1", N.value = "0", b.prepend(N);
      let T = !1;
      const P = b.querySelector(".page-footer__title"), O = () => {
        if (!A.duration || Number.isNaN(A.duration)) return;
        const j = Math.min(100, Math.max(0, A.currentTime / A.duration * 100));
        b.style.setProperty("--audio-progress", `${j}%`), T || (N.value = `${j}`);
      }, B = () => {
        P && (A.paused ? P.classList.remove("is-playing") : P.classList.add("is-playing"));
      };
      A.addEventListener("timeupdate", O), A.addEventListener("loadedmetadata", O), A.addEventListener("loadedmetadata", () => _(A)), A.addEventListener("ended", () => {
        b.style.setProperty("--audio-progress", "0%"), B();
      }), A.addEventListener("play", () => {
        f(A), B();
      }), A.addEventListener("pause", B), A.addEventListener("play", () => _(A));
      const H = (j) => {
        const G = R.getBoundingClientRect();
        return G.width ? (j - G.left) / G.width : 0;
      }, F = (j) => {
        if (!A.duration || Number.isNaN(A.duration)) return;
        const G = Math.min(1, Math.max(0, j));
        A.currentTime = G * A.duration, b.style.setProperty("--audio-progress", `${G * 100}%`), N.value = `${G * 100}`;
      };
      N.addEventListener("pointerdown", (j) => {
        !A.duration || Number.isNaN(A.duration) || (T = !0, j.pointerId !== void 0 && N.setPointerCapture(j.pointerId), F(H(j.clientX)));
      }), N.addEventListener("pointermove", (j) => {
        T && F(H(j.clientX));
      });
      const Z = (j) => {
        T && (T = !1, j.pointerId !== void 0 && N.hasPointerCapture(j.pointerId) && N.releasePointerCapture(j.pointerId));
      };
      N.addEventListener("pointerup", Z), N.addEventListener("pointercancel", Z), N.addEventListener("input", (j) => {
        if (!A.duration || Number.isNaN(A.duration)) return;
        const G = Math.min(100, Math.max(0, parseFloat(j.target.value) || 0)) / 100;
        F(G);
      }), E.append(A), b.appendChild(E);
      const ee = b.closest(".sub-page-sheet") || b.closest(".sheet");
      o.push({ audio: A, container: ee }), B();
    };
    e.forEach((b) => {
      const k = [], E = b.sheet.querySelector(":scope > .page-footer") || b.sheet.querySelector(".page-footer");
      E && k.push(E), b.sheet.querySelectorAll(":scope .sub-page-sheet .page-footer").forEach((A) => k.push(A)), k.forEach((A) => M(A, b));
    }), L(), a === "autoplay" ? w() : u();
  }
  function p(M) {
    const b = o.filter(({ container: E }) => E == null ? void 0 : E.closest("#subsheet-content")), k = o.filter(({ container: E }) => !(E != null && E.closest("#subsheet-content")));
    return M && b.length ? b : !M && k.length ? k : b.length ? b : k;
  }
  function g() {
    const M = document.body.classList.contains("panel-open");
    let b = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (M) {
      const N = document.getElementById("subsheet-content"), T = N == null ? void 0 : N.getBoundingClientRect();
      T && (b = {
        x: T.left + T.width / 2,
        y: T.top + T.height / 2
      });
    }
    const k = p(M);
    if (!k.length) return null;
    let E = null, A = 1 / 0, R = !1;
    return k.forEach((N) => {
      var F;
      const T = (F = N.container) == null ? void 0 : F.getBoundingClientRect();
      if (!T) return;
      const P = b.x >= T.left && b.x <= T.right && b.y >= T.top && b.y <= T.bottom, O = T.left + T.width / 2, B = T.top + T.height / 2, H = Math.hypot(O - b.x, B - b.y);
      if (P && !R) {
        E = N, A = H, R = !0;
        return;
      }
      if (P && H < A) {
        E = N, A = H;
        return;
      }
      !R && H < A && (E = N, A = H);
    }), (E == null ? void 0 : E.audio) || null;
  }
  function w() {
    if (a !== "autoplay") return;
    const M = g();
    M && f(M), a === "autoplay" && M && M.play().catch(() => {
    });
  }
  function v(M) {
    return Number.isFinite(M) ? Math.min(1, Math.max(0, M)) : 1;
  }
  function S() {
    const M = document.getElementById("audio-volume");
    if (!M) return;
    M.value = String(i);
    const b = () => {
      const k = Number.isFinite(M.valueAsNumber) ? M.valueAsNumber : parseFloat(M.value), E = v(k);
      i = E, localStorage.setItem("sheetAudioVolume", String(E)), L();
    };
    M.addEventListener("input", b), M.addEventListener("change", b);
  }
  return {
    initAudioControls: c,
    renderSheetAudio: d,
    requestAudioUpdate: u,
    updateAutoplayFocus: w,
    bindVolumeControl: S
  };
  function L() {
    o.forEach(({ audio: M }) => _(M));
  }
  function _(M) {
    if (M)
      try {
        const b = v(i);
        M.muted = b === 0, M.volume = b;
      } catch {
      }
  }
}
function wt(r) {
  const { videoEntries: e, sheets: o } = r;
  let t;
  function n() {
    return window.YT && window.YT.Player ? Promise.resolve() : t || (t = new Promise((h) => {
      const d = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        d == null || d(), h();
      };
      const p = document.createElement("script");
      p.src = "https://www.youtube.com/iframe_api", p.async = !0, document.head.appendChild(p);
    }), t);
  }
  function s() {
    const h = Array.from(document.querySelectorAll(".video-entry[data-video-id]"));
    h.length && h.forEach((d, p) => {
      var A, R;
      const g = d.closest(".sheet"), w = Number((g == null ? void 0 : g.dataset.pageNumber) || p + 1), v = e.length + 1, S = (d.dataset.videoId || "").trim();
      if (!S) return;
      const L = (d.dataset.videoTitle || ((A = d.querySelector("figcaption")) == null ? void 0 : A.textContent) || `Video ${p + 1}`).trim(), _ = (d.dataset.videoCaption || ((R = d.querySelector("figcaption")) == null ? void 0 : R.textContent) || "").trim(), M = `https://www.youtube-nocookie.com/embed/${S}`, b = `https://youtu.be/${S}`;
      let k = d.querySelector(".video-frame");
      k || (k = document.createElement("div"), k.className = "video-frame", d.prepend(k)), k.innerHTML = "", k.appendChild(l({ url: M, title: L, shareUrl: b, iframeId: `yt-embed-${S}-${v}` })), k.appendChild(c(b, L));
      let E = d.querySelector("figcaption");
      E || (E = document.createElement("figcaption"), d.appendChild(E)), E.textContent = `Video ${v}: ${_ || L}`, e.push({ title: L, caption: _, videoId: S, url: M, shareUrl: b, sheet: g, page: w, idx: p, number: v });
    });
  }
  function a() {
    const h = document.getElementById("video-list");
    if (h) {
      if (h.innerHTML = "", !e.length) {
        const d = document.createElement("li");
        d.textContent = "(keine Videos markiert)", h.appendChild(d);
        return;
      }
      e.forEach((d) => {
        var S;
        const p = document.createElement("li");
        p.className = "toc-item", p.dataset.target = ((S = d.sheet) == null ? void 0 : S.id) || "", p.setAttribute("role", "button"), p.tabIndex = 0;
        const g = document.createElement("span");
        g.className = "toc-number", g.textContent = `${d.number}.`;
        const w = document.createElement("span");
        w.className = "toc-title", w.textContent = `Video ${d.number}: ${d.title}`;
        const v = document.createElement("span");
        v.className = "toc-page", v.textContent = d.page, p.append(g, w, v), h.appendChild(p);
      }), h.addEventListener("click", (d) => {
        const p = d.target.closest(".toc-item[data-target]");
        if (!p) return;
        const g = p.dataset.target;
        if (!g) return;
        const w = document.getElementById(g);
        w && (w.scrollIntoView({ behavior: "smooth", block: "start" }), document.body.classList.remove("panel-open"));
      });
    }
  }
  function i(h, d, p) {
    const g = document.createElement("iframe"), w = h.includes("?") ? "&" : "?";
    return g.src = `${h}${w}enablejsapi=1&rel=0&playsinline=1`, g.title = d || "YouTube Video", g.loading = "lazy", g.allowFullscreen = !0, g.referrerPolicy = "strict-origin-when-cross-origin", p && (g.id = p), g;
  }
  function u(h) {
    const d = document.createElement("div");
    return d.className = "video-embed", d.appendChild(h), d;
  }
  function c(h, d) {
    const p = document.createElement("img");
    p.alt = d || "Video QR", p.className = "video-qr";
    const g = encodeURIComponent(h);
    p.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${g}`;
    const w = document.createElement("div");
    w.className = "video-qr-wrapper", w.appendChild(p);
    const v = document.createElement("div");
    v.className = "video-qr-caption";
    const S = document.createElement("a");
    return S.href = h, S.target = "_blank", S.rel = "noreferrer noopener", S.textContent = h, v.appendChild(S), w.appendChild(v), w;
  }
  return {
    initVideos: s,
    buildVideoList: a,
    buildVideoIframe: i,
    buildVideoQr: c
  };
  function l({ url: h, title: d, shareUrl: p, iframeId: g }) {
    const w = document.createElement("div");
    w.className = "video-embed video-embed--placeholder";
    const v = document.createElement("div");
    v.className = "video-placeholder";
    const S = document.createElement("div");
    S.className = "video-placeholder__info", S.textContent = d || "Video";
    const L = document.createElement("button");
    return L.type = "button", L.className = "video-placeholder__btn", L.textContent = "Youtube Video Anzeigen", L.addEventListener("click", () => {
      const _ = i(h, d, g);
      w.replaceWith(u(_)), f(_);
    }), v.append(S, L), w.appendChild(v), w;
  }
  function f(h) {
    h && n().then(() => {
      var d;
      (d = window.YT) != null && d.Player && new window.YT.Player(h, {
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0,
          playsinline: 1,
          modestbranding: 1
        },
        events: {
          onStateChange: (p) => {
            if (p.data === window.YT.PlayerState.ENDED)
              try {
                p.target.stopVideo();
              } catch {
              }
          }
        }
      });
    }).catch(() => {
    });
  }
}
function St() {
  const r = Array.from(document.querySelectorAll(".python-script-block"));
  if (!r.length) return;
  const e = (t) => {
    if (!t) return;
    const n = t.textContent || t.innerText || "", s = (u) => u.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), a = [
      { type: "comment", regex: /#[^\n]*/g },
      { type: "string", regex: /(\"\"\"[\s\S]*?\"\"\"|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g },
      { type: "number", regex: /\b\d+(?:\.\d+)?\b/g },
      {
        type: "keyword",
        regex: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/g
      },
      {
        type: "builtin",
        regex: /\b(print|len|range|enumerate|dict|list|set|tuple|float|int|str|Path|open|sum|min|max|zip|map|filter|all|any|sorted)\b/g
      }
    ];
    let i = s(n);
    a.forEach(({ type: u, regex: c }) => {
      i = i.replace(c, (l) => `<span class="code-token ${u}">${s(l)}</span>`);
    }), t.innerHTML = i;
  }, o = async (t) => {
    try {
      return await navigator.clipboard.writeText(t), !0;
    } catch {
      try {
        const s = document.createElement("textarea");
        s.value = t, s.style.position = "fixed", s.style.top = "-500px", document.body.appendChild(s), s.focus(), s.select();
        const a = document.execCommand("copy");
        return s.remove(), a;
      } catch (s) {
        return console.warn("Copy failed", s), !1;
      }
    }
  };
  r.forEach((t) => {
    const n = t.querySelector(".code-full"), s = t.querySelector(".code-preview");
    if (!n) return;
    const a = (n.textContent || "").trim();
    if (!a) return;
    e(n.querySelector("code") || n), s && e(s.querySelector("code") || s);
    const i = document.createElement("div");
    i.className = "code-actions";
    const u = document.createElement("button");
    u.type = "button", u.textContent = "Ganzes Skript kopieren", u.addEventListener("click", async () => {
      const d = await o(a) ? "Kopiert!" : "Kopieren fehlgeschlagen", p = u.textContent;
      u.textContent = d, setTimeout(() => {
        u.textContent = p;
      }, 1800);
    });
    let c = !1;
    const l = document.createElement("button");
    l.type = "button", l.className = "secondary";
    const f = () => {
      n.hidden = !c, n.classList.toggle("is-expanded", c), t.classList.toggle("is-expanded", c), l.textContent = c ? "Vollständiges Skript ausblenden" : "Vollständiges Skript anzeigen";
      const h = t.closest(".sheet");
      h && h.classList.toggle("is-code-expanded", c);
    };
    f(), l.addEventListener("click", () => {
      c = !c, f();
    }), i.append(u, l), t.appendChild(i);
  });
}
function vt(r) {
  const { body: e } = r, o = Array.from(document.querySelectorAll('input[name="theme-mode"]'));
  let n = (localStorage.getItem("sheetTheme") || "").toLowerCase() === "dark" ? "dark" : "light";
  const s = (u, c = !0) => {
    const l = u === "dark" ? "dark" : "light";
    n = l, window.sheetThemeMode = l, e.classList.toggle("theme-dark", l === "dark"), e.classList.toggle("theme-light", l === "light"), document.documentElement.setAttribute("data-theme", l), o.forEach((f) => {
      f.checked = (f.value || "").toLowerCase() === l;
    }), c && localStorage.setItem("sheetTheme", l);
  };
  s(n, !1), o.forEach((u) => {
    u.addEventListener("change", (c) => {
      const l = (c.target.value || "light").toLowerCase();
      s(l);
    });
  });
  const a = () => {
    e.dataset.prevTheme = n, s("light", !1);
  }, i = () => {
    const u = e.dataset.prevTheme || n || "light";
    s(u, !1);
  };
  window.addEventListener("beforeprint", a), window.addEventListener("afterprint", i);
}
function xt(r, { ensureJSZip: e }) {
  const { sheets: o, body: t } = r, n = document.getElementById("print-confirm"), s = document.getElementById("print-save"), a = document.getElementById("print-include-subsheets-yes"), i = document.getElementById("print-include-subsheets-no"), u = document.getElementById("print-include-fullcode"), c = document.getElementById("print-include-fullcode-main"), l = document.getElementById("print-modal"), f = document.getElementById("print-include-subsheets");
  if (!n || !s) return;
  const h = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let d = [];
  const p = () => a && !i ? a.checked || a.hasAttribute("checked") : a && i ? a.checked || !a.checked && !i.checked && a.hasAttribute("checked") : f ? f.checked : !0, g = () => !!(u && u.checked || c && c.checked), w = () => {
    d.forEach((k) => k.remove()), d = [];
  }, v = () => {
    w(), o.forEach((k) => {
      const E = Array.from(k.querySelectorAll(".sub-page-sheet"));
      if (!E.length) return;
      const A = document.createElement("div");
      A.className = "print-subpages", k.id && (A.dataset.printSourceSheetId = k.id), E.forEach((R) => A.appendChild(R.cloneNode(!0))), k.insertAdjacentElement("afterend", A), d.push(A);
    });
  }, S = () => {
    const k = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), A = 45;
    document.querySelectorAll(".code-full").forEach((R) => {
      const N = (R.textContent || "").trim();
      if (!N) return;
      const T = R.closest(".sheet");
      if (!T) return;
      const P = R.closest(".sub-page-sheet"), O = T.id || T.dataset.pageNumber || `sheet-${E.size + 1}`;
      let B = (E.get(O) || 0) + 1;
      const H = (Z, ee) => {
        var y, m;
        const j = document.createElement("section");
        j.className = "sheet libertinus padding-20mm code-print-sheet";
        const G = P && P.querySelector(".page-header") || T.querySelector(":scope > .page-header");
        if (G) {
          const x = G.cloneNode(!0);
          j.appendChild(x);
        }
        const ce = document.createElement("article");
        ce.innerHTML = "<strong>Code (vollständig)</strong>", j.appendChild(ce);
        const ye = document.createElement("pre"), ae = document.createElement("code");
        ae.textContent = Z, ye.appendChild(ae), j.appendChild(ye);
        const le = document.createElement("div");
        le.className = "page-footer";
        const Ie = ((y = T.querySelector(".page-footer__title")) == null ? void 0 : y.textContent) || ((m = T.querySelector(":scope > .page-header")) == null ? void 0 : m.textContent) || "Code", ue = document.createElement("span");
        ue.className = "page-footer__title", ue.textContent = Ie;
        const ne = document.createElement("span");
        ne.className = "code-page-number", ne.textContent = `c${ee}`, le.append(ue, ne), j.appendChild(le);
        let de = k.get(T);
        de || (de = d.slice().reverse().find((x) => {
          var C;
          return T.id && ((C = x.dataset) == null ? void 0 : C.printSourceSheetId) === T.id;
        }) || T), de.insertAdjacentElement("afterend", j), k.set(T, j), d.push(j);
      }, F = N.split(/\r?\n/);
      for (let Z = 0; Z < F.length; Z += A) {
        const ee = F.slice(Z, Z + A).join(`
`);
        H(ee, B), B += 1;
      }
      E.set(O, B - 1);
    });
  };
  n.addEventListener("click", () => {
    p() ? v() : w(), g() && S(), l == null || l.setAttribute("hidden", "true"), window.print();
  });
  const L = async (k) => {
    const E = async (T) => (await fetch(T)).text(), A = async (T, P) => {
      const O = /@import\\s+url\\(([^)]+)\\)\\s*;?/g;
      let B, H = T;
      for (; (B = O.exec(T)) !== null; ) {
        const F = B[1].replace(/['"]/g, "").trim();
        if (F)
          try {
            const Z = F.startsWith("http") ? F : new URL(F, P).toString(), ee = await E(Z);
            H = H.replace(B[0], ee);
          } catch (Z) {
            console.warn("Inline @import failed for", F, Z);
          }
      }
      return H;
    }, R = Array.from(k.querySelectorAll('link[rel="stylesheet"]'));
    for (const T of R) {
      const P = T.getAttribute("href") || "";
      try {
        const O = P.startsWith("http") ? P : new URL(P, document.baseURI).toString(), B = await E(O), H = await A(B, O), F = k.createElement("style");
        F.textContent = H, T.replaceWith(F);
      } catch (O) {
        console.warn("Inline CSS failed for", P, O);
      }
    }
    const N = Array.from(k.querySelectorAll("script[src]"));
    for (const T of N) {
      const P = T.getAttribute("src") || "";
      if (!P.toLowerCase().includes("mathjax"))
        try {
          const O = P.startsWith("http") ? P : new URL(P, document.baseURI).toString(), B = await E(O), H = k.createElement("script");
          H.textContent = B, T.replaceWith(H);
        } catch (O) {
          console.warn("Inline JS failed for", P, O);
        }
    }
  }, _ = async (k, E) => {
    const A = Array.from(E.querySelectorAll("script[src*='mathjax']"));
    if (!A.length) return;
    A.forEach((N) => N.setAttribute("src", "mathjax.js"));
    const R = [
      t.dataset.mathjaxSrc || "node_modules/mathjax/es5/tex-mml-chtml.js",
      "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
    ];
    for (const N of R)
      try {
        const T = N.startsWith("http") ? N : new URL(N, document.baseURI).toString(), P = await fetch(T);
        if (!P.ok) continue;
        const O = await P.text();
        k.file("mathjax.js", O);
        return;
      } catch {
        continue;
      }
  }, M = async () => {
    var T;
    p() ? v() : w(), g() && S();
    const E = document.documentElement.cloneNode(!0);
    (T = E.querySelector("body")) == null || T.classList.add("offline-export");
    try {
      await L(E);
    } catch (P) {
      console.warn("Inline assets failed", P);
    }
    const A = "<!DOCTYPE html>\\n" + E.outerHTML, R = (P, O) => {
      const B = document.createElement("a");
      B.href = URL.createObjectURL(O), B.download = P, document.body.appendChild(B), B.click(), B.remove(), URL.revokeObjectURL(B.href);
    }, N = () => R("document.html", new Blob([A], { type: "text/html" }));
    try {
      if (await Promise.race([
        e(),
        new Promise((B, H) => setTimeout(() => H(new Error("JSZip timeout")), 3e3))
      ]), !window.JSZip) throw new Error("JSZip unavailable");
      const P = new JSZip();
      P.file("document.html", A), await _(P, E);
      const O = await P.generateAsync({ type: "blob" });
      R("document.zip", O);
    } catch (P) {
      console.warn("Zip export failed, falling back to HTML", P), N();
    }
    document.body.classList.remove("offline-export"), w(), b();
  };
  o.forEach((k) => {
    k.querySelectorAll(".page-footer").forEach((E) => {
      E.setAttribute("data-print-date", h);
    }), k.querySelectorAll(".sub-page-sheet .page-footer").forEach((E) => {
      E.setAttribute("data-print-date", h);
    });
  }), s.addEventListener("click", () => {
    M().catch((k) => console.error("Offline export failed", k));
  });
  const b = () => l == null ? void 0 : l.setAttribute("hidden", "true");
  window.addEventListener("afterprint", w);
}
function kt(r) {
  if (!r) return "–";
  const e = new Date(r);
  return Number.isNaN(e.getTime()) ? r : e.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function Et(r) {
  const { body: e, userSettings: o } = r, t = (e.dataset.repoUrl || o.repoUrl || "").trim() || "https://github.com/Seren200018/Vorlesung-Skript-Template", n = document.querySelector("[data-build-target='repo']");
  n && (n.textContent = t, n.href !== void 0 && (n.href = t));
  const s = document.querySelector("[data-build-target='date']");
  s && (s.textContent = kt(At(e, o)));
  const a = document.querySelector("[data-build-target='author']");
  a && (a.textContent = (e.dataset.author || o.author || "Autor / Dozent").trim());
  const i = document.querySelector("[data-build-target='version']");
  i && (i.textContent = (e.dataset.packageVersion || o.version || "unbekannt").trim());
  const u = document.querySelector("[data-build-target='copyright']");
  if (u) {
    const c = (e.dataset.license || o.license || "CC BY-NC 4.0").trim();
    u.textContent = c, Ct(u, c);
  }
}
function Ct(r, e) {
  var n;
  if (!r) return;
  (n = r.querySelector(".cc-badges")) == null || n.remove();
  const o = Mt(e);
  if (!o.length) return;
  const t = document.createElement("span");
  t.className = "cc-badges", o.forEach((s) => {
    const a = document.createElement("span");
    a.className = "cc-badge", a.title = `Creative Commons ${s}`, a.innerHTML = Lt(s), t.appendChild(a);
  }), r.appendChild(t);
}
function Mt(r) {
  const e = (r || "").toUpperCase(), o = [];
  return e.includes("CC") && (o.push("CC"), ["BY", "SA", "ND", "NC"].forEach((n) => {
    e.includes(n) && o.push(n);
  }), (e.includes("0") || e.includes("ZERO")) && o.push("0")), o;
}
function Lt(r) {
  const e = (r || "").toUpperCase(), o = '<circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.1"/>';
  return e === "CC" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<text x="10" y="13" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">CC</text></svg>` : e === "BY" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<circle cx="10" cy="8" r="2.4" fill="currentColor"/><rect x="7" y="11" width="6" height="4.6" rx="1" fill="currentColor"/></svg>` : e === "NC" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<text x="10" y="9.5" text-anchor="middle" font-size="6.5" font-weight="700" fill="currentColor">$</text><line x1="6" y1="6" x2="14" y2="14" stroke="currentColor" stroke-width="1.4"/></svg>` : e === "SA" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<path d="M12.2 6.4 15 8l-2.8 1.6V8.9c-2.5 0-4.4 1.2-4.4 4.2 0-3 1.9-5.1 4.4-5.1V6.4Z" fill="currentColor"/></svg>` : e === "ND" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<rect x="5" y="8" width="10" height="1.6" rx="0.5" fill="currentColor"/><rect x="5" y="11" width="10" height="1.6" rx="0.5" fill="currentColor"/></svg>` : e === "0" ? `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<text x="10" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">0</text></svg>` : `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${o}<text x="10" y="13" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">${e}</text></svg>`;
}
function At(r, e) {
  const o = [
    r.dataset.gitLastMod,
    r.dataset.repoModified,
    e.gitLastMod,
    document.lastModified
  ].filter(Boolean).map((i) => i.toString().trim()).filter(Boolean).map((i) => new Date(i)).filter((i) => !Number.isNaN(i.getTime())), n = Date.now() + 1e3 * 60 * 60 * 24, s = o.filter((i) => i.getTime() <= n);
  return s.length ? s.reduce((i, u) => i.getTime() > u.getTime() ? i : u).toISOString() : "";
}
function We() {
  const r = document.getElementById("literature-list"), e = Array.from(document.querySelectorAll(".doi-citation"));
  if (!r) return;
  const o = /* @__PURE__ */ new Map(), t = (n, s, a) => {
    const i = n || "Autor", u = s || "o.J.", c = a ? `, ${a}` : "";
    return `(${i} ${u}${c})`;
  };
  if (e.forEach((n, s) => {
    const a = (n.dataset.author || "").trim(), i = (n.dataset.year || "").trim(), u = (n.dataset.pages || "").trim(), c = (n.dataset.title || "").trim(), l = (n.dataset.journal || "").trim(), f = (n.dataset.doi || "").trim(), h = (n.dataset.url || "").trim(), d = f ? `https://doi.org/${f}` : h, p = document.createElement(d ? "a" : "span");
    p.textContent = t(a, i, u), d && (p.href = d, p.target = "_blank", p.rel = "noreferrer noopener"), n.innerHTML = "", n.appendChild(p);
    const g = f || `${a}-${i}-${c}` || `entry-${s}`;
    o.has(g) || o.set(g, {
      author: a || "o. Autor",
      year: i || "o.J.",
      pages: u,
      title: c,
      journal: l,
      doi: f,
      link: d
    });
  }), r.innerHTML = "", !o.size) {
    const n = document.createElement("li");
    n.textContent = "(keine Einträge markiert)", r.appendChild(n);
    return;
  }
  o.forEach((n) => {
    const s = document.createElement("li");
    s.className = "literature-item";
    const a = [];
    (n.author || n.year) && a.push(`${n.author} (${n.year})`), n.title && a.push(n.title), n.journal && a.push(n.journal), n.pages && a.push(n.pages);
    const i = a.filter(Boolean).join(". ");
    if (n.link) {
      const u = document.createElement("span");
      u.textContent = i || "Quelle";
      const c = document.createElement("a");
      c.href = n.link, c.textContent = n.doi ? `DOI: ${n.doi}` : n.link, c.target = "_blank", c.rel = "noreferrer noopener", s.append(u), s.append(" – "), s.append(c);
    } else
      s.textContent = i || "Quelle";
    r.appendChild(s);
  });
}
function Tt() {
  const r = document.documentElement;
  if (!document.getElementById("zoom-controls")) return;
  const o = document.getElementById("subsheet-panel"), t = document.getElementById("subsheet-zoom"), n = document.getElementById("subsheet-content"), s = document.getElementById("zoom-in"), a = document.getElementById("zoom-out"), i = document.getElementById("zoom-reset");
  if (!s || !a || !i) return;
  const u = "sheetZoomScale", c = 0.5, l = 2, f = 0.1, h = (b) => Math.min(l, Math.max(c, b)), d = (b) => Math.round(b * 10) / 10;
  let p = 1;
  const g = parseFloat(localStorage.getItem(u));
  Number.isFinite(g) && (p = h(g));
  let w = (o == null ? void 0 : o.getBoundingClientRect().width) || 0;
  const v = () => {
    i.textContent = `${Math.round(p * 100)}%`;
  }, S = () => {
    if (!t || !n) return;
    t.style.width = `${p * 100}%`, n.style.width = `${100 / p}%`;
    const b = n.scrollHeight;
    b && (t.style.height = `${b * p}px`);
  }, L = () => {
    r.style.setProperty("--sheet-scale", String(p)), w > 0 && r.style.setProperty("--panel-width", `${Math.round(w * p)}px`), S(), localStorage.setItem(u, String(p)), v();
  };
  let _ = null;
  window.addEventListener("resize", () => {
    o && (_ || (_ = requestAnimationFrame(() => {
      _ = null;
      const b = o.getBoundingClientRect().width;
      w = p ? b / p : b, L();
    })));
  });
  let M = null;
  n && t && new MutationObserver(() => {
    M || (M = requestAnimationFrame(() => {
      M = null, S();
    }));
  }).observe(n, { childList: !0, subtree: !0 }), s.addEventListener("click", () => {
    p = h(d(p + f)), L();
  }), a.addEventListener("click", () => {
    p = h(d(p - f)), L();
  }), i.addEventListener("click", () => {
    p = 1, L();
  }), L();
}
function ge(r) {
  return ((r == null ? void 0 : r.textContent) || "").replace(/\s+/g, " ").trim();
}
function It(r) {
  const e = r.querySelector("[data-title-author]") || r.querySelector(".Titlepage.Author") || r.querySelector(".titlepage-author") || r.querySelector("#titlepage-author"), o = ge(e);
  if (o) return o;
  const t = r.querySelector(".abstract") || r, s = Array.from(t.querySelectorAll("p, h1, h2, h3, div, span")).filter((a) => !(a.closest(".Titlepage.Series, .Titlepage.Title, .Titlepage.Subtitle") || a.matches(".Titlepage.Series, .Titlepage.Title, .Titlepage.Subtitle")));
  for (let a = s.length - 1; a >= 0; a -= 1) {
    const i = ge(s[a]);
    if (i) return i;
  }
  return "";
}
function Nt(r) {
  const { body: e } = r, o = document.querySelector(".sheet.Titlepage") || document.querySelector(".Titlepage");
  if (!o) return;
  const t = ge(
    o.querySelector("[data-title-series]") || o.querySelector(".Titlepage.Series")
  ), n = ge(
    o.querySelector("[data-title-main]") || o.querySelector(".Titlepage.Title")
  ), s = ge(
    o.querySelector("[data-title-subtitle]") || o.querySelector(".Titlepage.Subtitle")
  ), a = It(o);
  n && (e.dataset.lectureTitle = n), t && (e.dataset.lectureSeries = t), s && (e.dataset.lectureSubtitle = s), a && (e.dataset.author = a), r.lectureTitle = e.dataset.lectureTitle || r.lectureTitle, r.lectureChapter = e.dataset.lectureChapter || r.lectureChapter;
}
function Ut(r = {}) {
  const e = it(r), o = ct(e), t = lt(e), n = bt(e, { ensureJSZip: t.ensureJSZip }), s = yt(e), a = wt(e);
  return window.addEventListener("scroll", s.requestAudioUpdate, { passive: !0 }), window.addEventListener("resize", s.requestAudioUpdate), W("numberSubpages", () => dt(e)), W("syncMetadataFromTitlePage", () => Nt(e)), W(
    "initSubsheetPanel",
    () => ut({ typeset: o.typeset, requestAudioUpdate: s.requestAudioUpdate })
  ), W("buildTocAndPageChrome", () => ht(e)), W("buildSymbolColumns", () => mt(e, o.typeset)), W("buildAssetLists", () => gt(e)), W("populateBuildInfo", () => Et(e)), W("initAudioControls", () => {
    s.initAudioControls(), s.bindVolumeControl();
  }), W("initVideos", () => a.initVideos()), W("buildVideoList", () => a.buildVideoList()), W("buildLiteratureIndex", () => We()), W("initPythonDemos", St), W("initThemeSwitch", () => vt(e)), W("initZoomControls", () => Tt()), W("initPrintDialog", () => xt(e, { ensureJSZip: t.ensureJSZip })), W("initSheetNotes", () => n.initSheetNotes()), W("initNoteExport", () => n.initNoteExport()), W("initNoteImport", () => n.initNoteImport()), W("initHighlightContextMenu", () => n.initHighlightContextMenu()), window.addEventListener("load", () => {
    W("initVideos (load)", () => a.initVideos()), W("buildVideoList (load)", () => a.buildVideoList()), W("buildLiteratureIndex (load)", () => We()), W("renderSheetAudio (load)", () => s.renderSheetAudio());
  }), {
    context: e,
    math: o,
    zip: t,
    audio: s,
    videos: a,
    notes: n
  };
}
function qe(r, e, o) {
  if (r && r.length) {
    const [t, n] = e, s = Math.PI / 180 * o, a = Math.cos(s), i = Math.sin(s);
    for (const u of r) {
      const [c, l] = u;
      u[0] = (c - t) * a - (l - n) * i + t, u[1] = (c - t) * i + (l - n) * a + n;
    }
  }
}
function Pt(r, e) {
  return r[0] === e[0] && r[1] === e[1];
}
function $t(r, e, o, t = 1) {
  const n = o, s = Math.max(e, 0.1), a = r[0] && r[0][0] && typeof r[0][0] == "number" ? [r] : r, i = [0, 0];
  if (n) for (const c of a) qe(c, i, n);
  const u = function(c, l, f) {
    const h = [];
    for (const S of c) {
      const L = [...S];
      Pt(L[0], L[L.length - 1]) || L.push([L[0][0], L[0][1]]), L.length > 2 && h.push(L);
    }
    const d = [];
    l = Math.max(l, 0.1);
    const p = [];
    for (const S of h) for (let L = 0; L < S.length - 1; L++) {
      const _ = S[L], M = S[L + 1];
      if (_[1] !== M[1]) {
        const b = Math.min(_[1], M[1]);
        p.push({ ymin: b, ymax: Math.max(_[1], M[1]), x: b === _[1] ? _[0] : M[0], islope: (M[0] - _[0]) / (M[1] - _[1]) });
      }
    }
    if (p.sort((S, L) => S.ymin < L.ymin ? -1 : S.ymin > L.ymin ? 1 : S.x < L.x ? -1 : S.x > L.x ? 1 : S.ymax === L.ymax ? 0 : (S.ymax - L.ymax) / Math.abs(S.ymax - L.ymax)), !p.length) return d;
    let g = [], w = p[0].ymin, v = 0;
    for (; g.length || p.length; ) {
      if (p.length) {
        let S = -1;
        for (let L = 0; L < p.length && !(p[L].ymin > w); L++) S = L;
        p.splice(0, S + 1).forEach((L) => {
          g.push({ s: w, edge: L });
        });
      }
      if (g = g.filter((S) => !(S.edge.ymax <= w)), g.sort((S, L) => S.edge.x === L.edge.x ? 0 : (S.edge.x - L.edge.x) / Math.abs(S.edge.x - L.edge.x)), (f !== 1 || v % l == 0) && g.length > 1) for (let S = 0; S < g.length; S += 2) {
        const L = S + 1;
        if (L >= g.length) break;
        const _ = g[S].edge, M = g[L].edge;
        d.push([[Math.round(_.x), w], [Math.round(M.x), w]]);
      }
      w += f, g.forEach((S) => {
        S.edge.x = S.edge.x + f * S.edge.islope;
      }), v++;
    }
    return d;
  }(a, s, t);
  if (n) {
    for (const c of a) qe(c, i, -n);
    (function(c, l, f) {
      const h = [];
      c.forEach((d) => h.push(...d)), qe(h, l, f);
    })(u, i, -n);
  }
  return u;
}
function be(r, e) {
  var o;
  const t = e.hachureAngle + 90;
  let n = e.hachureGap;
  n < 0 && (n = 4 * e.strokeWidth), n = Math.round(Math.max(n, 0.1));
  let s = 1;
  return e.roughness >= 1 && (((o = e.randomizer) === null || o === void 0 ? void 0 : o.next()) || Math.random()) > 0.7 && (s = n), $t(r, n, t, s || 1);
}
class He {
  constructor(e) {
    this.helper = e;
  }
  fillPolygons(e, o) {
    return this._fillPolygons(e, o);
  }
  _fillPolygons(e, o) {
    const t = be(e, o);
    return { type: "fillSketch", ops: this.renderLines(t, o) };
  }
  renderLines(e, o) {
    const t = [];
    for (const n of e) t.push(...this.helper.doubleLineOps(n[0][0], n[0][1], n[1][0], n[1][1], o));
    return t;
  }
}
function Te(r) {
  const e = r[0], o = r[1];
  return Math.sqrt(Math.pow(e[0] - o[0], 2) + Math.pow(e[1] - o[1], 2));
}
class qt extends He {
  fillPolygons(e, o) {
    let t = o.hachureGap;
    t < 0 && (t = 4 * o.strokeWidth), t = Math.max(t, 0.1);
    const n = be(e, Object.assign({}, o, { hachureGap: t })), s = Math.PI / 180 * o.hachureAngle, a = [], i = 0.5 * t * Math.cos(s), u = 0.5 * t * Math.sin(s);
    for (const [c, l] of n) Te([c, l]) && a.push([[c[0] - i, c[1] + u], [...l]], [[c[0] + i, c[1] - u], [...l]]);
    return { type: "fillSketch", ops: this.renderLines(a, o) };
  }
}
class _t extends He {
  fillPolygons(e, o) {
    const t = this._fillPolygons(e, o), n = Object.assign({}, o, { hachureAngle: o.hachureAngle + 90 }), s = this._fillPolygons(e, n);
    return t.ops = t.ops.concat(s.ops), t;
  }
}
class Ot {
  constructor(e) {
    this.helper = e;
  }
  fillPolygons(e, o) {
    const t = be(e, o = Object.assign({}, o, { hachureAngle: 0 }));
    return this.dotsOnLines(t, o);
  }
  dotsOnLines(e, o) {
    const t = [];
    let n = o.hachureGap;
    n < 0 && (n = 4 * o.strokeWidth), n = Math.max(n, 0.1);
    let s = o.fillWeight;
    s < 0 && (s = o.strokeWidth / 2);
    const a = n / 4;
    for (const i of e) {
      const u = Te(i), c = u / n, l = Math.ceil(c) - 1, f = u - l * n, h = (i[0][0] + i[1][0]) / 2 - n / 4, d = Math.min(i[0][1], i[1][1]);
      for (let p = 0; p < l; p++) {
        const g = d + f + p * n, w = h - a + 2 * Math.random() * a, v = g - a + 2 * Math.random() * a, S = this.helper.ellipse(w, v, s, s, o);
        t.push(...S.ops);
      }
    }
    return { type: "fillSketch", ops: t };
  }
}
class zt {
  constructor(e) {
    this.helper = e;
  }
  fillPolygons(e, o) {
    const t = be(e, o);
    return { type: "fillSketch", ops: this.dashedLine(t, o) };
  }
  dashedLine(e, o) {
    const t = o.dashOffset < 0 ? o.hachureGap < 0 ? 4 * o.strokeWidth : o.hachureGap : o.dashOffset, n = o.dashGap < 0 ? o.hachureGap < 0 ? 4 * o.strokeWidth : o.hachureGap : o.dashGap, s = [];
    return e.forEach((a) => {
      const i = Te(a), u = Math.floor(i / (t + n)), c = (i + n - u * (t + n)) / 2;
      let l = a[0], f = a[1];
      l[0] > f[0] && (l = a[1], f = a[0]);
      const h = Math.atan((f[1] - l[1]) / (f[0] - l[0]));
      for (let d = 0; d < u; d++) {
        const p = d * (t + n), g = p + t, w = [l[0] + p * Math.cos(h) + c * Math.cos(h), l[1] + p * Math.sin(h) + c * Math.sin(h)], v = [l[0] + g * Math.cos(h) + c * Math.cos(h), l[1] + g * Math.sin(h) + c * Math.sin(h)];
        s.push(...this.helper.doubleLineOps(w[0], w[1], v[0], v[1], o));
      }
    }), s;
  }
}
class Rt {
  constructor(e) {
    this.helper = e;
  }
  fillPolygons(e, o) {
    const t = o.hachureGap < 0 ? 4 * o.strokeWidth : o.hachureGap, n = o.zigzagOffset < 0 ? t : o.zigzagOffset, s = be(e, o = Object.assign({}, o, { hachureGap: t + n }));
    return { type: "fillSketch", ops: this.zigzagLines(s, n, o) };
  }
  zigzagLines(e, o, t) {
    const n = [];
    return e.forEach((s) => {
      const a = Te(s), i = Math.round(a / (2 * o));
      let u = s[0], c = s[1];
      u[0] > c[0] && (u = s[1], c = s[0]);
      const l = Math.atan((c[1] - u[1]) / (c[0] - u[0]));
      for (let f = 0; f < i; f++) {
        const h = 2 * f * o, d = 2 * (f + 1) * o, p = Math.sqrt(2 * Math.pow(o, 2)), g = [u[0] + h * Math.cos(l), u[1] + h * Math.sin(l)], w = [u[0] + d * Math.cos(l), u[1] + d * Math.sin(l)], v = [g[0] + p * Math.cos(l + Math.PI / 4), g[1] + p * Math.sin(l + Math.PI / 4)];
        n.push(...this.helper.doubleLineOps(g[0], g[1], v[0], v[1], t), ...this.helper.doubleLineOps(v[0], v[1], w[0], w[1], t));
      }
    }), n;
  }
}
const Y = {};
class Bt {
  constructor(e) {
    this.seed = e;
  }
  next() {
    return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
  }
}
const Dt = 0, _e = 1, Ve = 2, Se = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
function Oe(r, e) {
  return r.type === e;
}
function Fe(r) {
  const e = [], o = function(a) {
    const i = new Array();
    for (; a !== ""; ) if (a.match(/^([ \t\r\n,]+)/)) a = a.substr(RegExp.$1.length);
    else if (a.match(/^([aAcChHlLmMqQsStTvVzZ])/)) i[i.length] = { type: Dt, text: RegExp.$1 }, a = a.substr(RegExp.$1.length);
    else {
      if (!a.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
      i[i.length] = { type: _e, text: `${parseFloat(RegExp.$1)}` }, a = a.substr(RegExp.$1.length);
    }
    return i[i.length] = { type: Ve, text: "" }, i;
  }(r);
  let t = "BOD", n = 0, s = o[n];
  for (; !Oe(s, Ve); ) {
    let a = 0;
    const i = [];
    if (t === "BOD") {
      if (s.text !== "M" && s.text !== "m") return Fe("M0,0" + r);
      n++, a = Se[s.text], t = s.text;
    } else Oe(s, _e) ? a = Se[t] : (n++, a = Se[s.text], t = s.text);
    if (!(n + a < o.length)) throw new Error("Path data ended short");
    for (let u = n; u < n + a; u++) {
      const c = o[u];
      if (!Oe(c, _e)) throw new Error("Param not a number: " + t + "," + c.text);
      i[i.length] = +c.text;
    }
    if (typeof Se[t] != "number") throw new Error("Bad segment: " + t);
    {
      const u = { key: t, data: i };
      e.push(u), n += a, s = o[n], t === "M" && (t = "L"), t === "m" && (t = "l");
    }
  }
  return e;
}
function Qe(r) {
  let e = 0, o = 0, t = 0, n = 0;
  const s = [];
  for (const { key: a, data: i } of r) switch (a) {
    case "M":
      s.push({ key: "M", data: [...i] }), [e, o] = i, [t, n] = i;
      break;
    case "m":
      e += i[0], o += i[1], s.push({ key: "M", data: [e, o] }), t = e, n = o;
      break;
    case "L":
      s.push({ key: "L", data: [...i] }), [e, o] = i;
      break;
    case "l":
      e += i[0], o += i[1], s.push({ key: "L", data: [e, o] });
      break;
    case "C":
      s.push({ key: "C", data: [...i] }), e = i[4], o = i[5];
      break;
    case "c": {
      const u = i.map((c, l) => l % 2 ? c + o : c + e);
      s.push({ key: "C", data: u }), e = u[4], o = u[5];
      break;
    }
    case "Q":
      s.push({ key: "Q", data: [...i] }), e = i[2], o = i[3];
      break;
    case "q": {
      const u = i.map((c, l) => l % 2 ? c + o : c + e);
      s.push({ key: "Q", data: u }), e = u[2], o = u[3];
      break;
    }
    case "A":
      s.push({ key: "A", data: [...i] }), e = i[5], o = i[6];
      break;
    case "a":
      e += i[5], o += i[6], s.push({ key: "A", data: [i[0], i[1], i[2], i[3], i[4], e, o] });
      break;
    case "H":
      s.push({ key: "H", data: [...i] }), e = i[0];
      break;
    case "h":
      e += i[0], s.push({ key: "H", data: [e] });
      break;
    case "V":
      s.push({ key: "V", data: [...i] }), o = i[0];
      break;
    case "v":
      o += i[0], s.push({ key: "V", data: [o] });
      break;
    case "S":
      s.push({ key: "S", data: [...i] }), e = i[2], o = i[3];
      break;
    case "s": {
      const u = i.map((c, l) => l % 2 ? c + o : c + e);
      s.push({ key: "S", data: u }), e = u[2], o = u[3];
      break;
    }
    case "T":
      s.push({ key: "T", data: [...i] }), e = i[0], o = i[1];
      break;
    case "t":
      e += i[0], o += i[1], s.push({ key: "T", data: [e, o] });
      break;
    case "Z":
    case "z":
      s.push({ key: "Z", data: [] }), e = t, o = n;
  }
  return s;
}
function et(r) {
  const e = [];
  let o = "", t = 0, n = 0, s = 0, a = 0, i = 0, u = 0;
  for (const { key: c, data: l } of r) {
    switch (c) {
      case "M":
        e.push({ key: "M", data: [...l] }), [t, n] = l, [s, a] = l;
        break;
      case "C":
        e.push({ key: "C", data: [...l] }), t = l[4], n = l[5], i = l[2], u = l[3];
        break;
      case "L":
        e.push({ key: "L", data: [...l] }), [t, n] = l;
        break;
      case "H":
        t = l[0], e.push({ key: "L", data: [t, n] });
        break;
      case "V":
        n = l[0], e.push({ key: "L", data: [t, n] });
        break;
      case "S": {
        let f = 0, h = 0;
        o === "C" || o === "S" ? (f = t + (t - i), h = n + (n - u)) : (f = t, h = n), e.push({ key: "C", data: [f, h, ...l] }), i = l[0], u = l[1], t = l[2], n = l[3];
        break;
      }
      case "T": {
        const [f, h] = l;
        let d = 0, p = 0;
        o === "Q" || o === "T" ? (d = t + (t - i), p = n + (n - u)) : (d = t, p = n);
        const g = t + 2 * (d - t) / 3, w = n + 2 * (p - n) / 3, v = f + 2 * (d - f) / 3, S = h + 2 * (p - h) / 3;
        e.push({ key: "C", data: [g, w, v, S, f, h] }), i = d, u = p, t = f, n = h;
        break;
      }
      case "Q": {
        const [f, h, d, p] = l, g = t + 2 * (f - t) / 3, w = n + 2 * (h - n) / 3, v = d + 2 * (f - d) / 3, S = p + 2 * (h - p) / 3;
        e.push({ key: "C", data: [g, w, v, S, d, p] }), i = f, u = h, t = d, n = p;
        break;
      }
      case "A": {
        const f = Math.abs(l[0]), h = Math.abs(l[1]), d = l[2], p = l[3], g = l[4], w = l[5], v = l[6];
        f === 0 || h === 0 ? (e.push({ key: "C", data: [t, n, w, v, w, v] }), t = w, n = v) : (t !== w || n !== v) && (tt(t, n, w, v, f, h, d, p, g).forEach(function(S) {
          e.push({ key: "C", data: S });
        }), t = w, n = v);
        break;
      }
      case "Z":
        e.push({ key: "Z", data: [] }), t = s, n = a;
    }
    o = c;
  }
  return e;
}
function fe(r, e, o) {
  return [r * Math.cos(o) - e * Math.sin(o), r * Math.sin(o) + e * Math.cos(o)];
}
function tt(r, e, o, t, n, s, a, i, u, c) {
  const l = (f = a, Math.PI * f / 180);
  var f;
  let h = [], d = 0, p = 0, g = 0, w = 0;
  if (c) [d, p, g, w] = c;
  else {
    [r, e] = fe(r, e, -l), [o, t] = fe(o, t, -l);
    const P = (r - o) / 2, O = (e - t) / 2;
    let B = P * P / (n * n) + O * O / (s * s);
    B > 1 && (B = Math.sqrt(B), n *= B, s *= B);
    const H = n * n, F = s * s, Z = H * F - H * O * O - F * P * P, ee = H * O * O + F * P * P, j = (i === u ? -1 : 1) * Math.sqrt(Math.abs(Z / ee));
    g = j * n * O / s + (r + o) / 2, w = j * -s * P / n + (e + t) / 2, d = Math.asin(parseFloat(((e - w) / s).toFixed(9))), p = Math.asin(parseFloat(((t - w) / s).toFixed(9))), r < g && (d = Math.PI - d), o < g && (p = Math.PI - p), d < 0 && (d = 2 * Math.PI + d), p < 0 && (p = 2 * Math.PI + p), u && d > p && (d -= 2 * Math.PI), !u && p > d && (p -= 2 * Math.PI);
  }
  let v = p - d;
  if (Math.abs(v) > 120 * Math.PI / 180) {
    const P = p, O = o, B = t;
    p = u && p > d ? d + 120 * Math.PI / 180 * 1 : d + 120 * Math.PI / 180 * -1, h = tt(o = g + n * Math.cos(p), t = w + s * Math.sin(p), O, B, n, s, a, 0, u, [p, P, g, w]);
  }
  v = p - d;
  const S = Math.cos(d), L = Math.sin(d), _ = Math.cos(p), M = Math.sin(p), b = Math.tan(v / 4), k = 4 / 3 * n * b, E = 4 / 3 * s * b, A = [r, e], R = [r + k * L, e - E * S], N = [o + k * M, t - E * _], T = [o, t];
  if (R[0] = 2 * A[0] - R[0], R[1] = 2 * A[1] - R[1], c) return [R, N, T].concat(h);
  {
    h = [R, N, T].concat(h);
    const P = [];
    for (let O = 0; O < h.length; O += 3) {
      const B = fe(h[O][0], h[O][1], l), H = fe(h[O + 1][0], h[O + 1][1], l), F = fe(h[O + 2][0], h[O + 2][1], l);
      P.push([B[0], B[1], H[0], H[1], F[0], F[1]]);
    }
    return P;
  }
}
const jt = { randOffset: function(r, e) {
  return q(r, e);
}, randOffsetWithRange: function(r, e, o) {
  return Ce(r, e, o);
}, ellipse: function(r, e, o, t, n) {
  const s = ot(o, t, n);
  return Be(r, e, n, s).opset;
}, doubleLineOps: function(r, e, o, t, n) {
  return oe(r, e, o, t, n, !0);
} };
function nt(r, e, o, t, n) {
  return { type: "path", ops: oe(r, e, o, t, n) };
}
function ke(r, e, o) {
  const t = (r || []).length;
  if (t > 2) {
    const n = [];
    for (let s = 0; s < t - 1; s++) n.push(...oe(r[s][0], r[s][1], r[s + 1][0], r[s + 1][1], o));
    return e && n.push(...oe(r[t - 1][0], r[t - 1][1], r[0][0], r[0][1], o)), { type: "path", ops: n };
  }
  return t === 2 ? nt(r[0][0], r[0][1], r[1][0], r[1][1], o) : { type: "path", ops: [] };
}
function Ht(r, e, o, t, n) {
  return function(s, a) {
    return ke(s, !0, a);
  }([[r, e], [r + o, e], [r + o, e + t], [r, e + t]], n);
}
function Je(r, e) {
  if (r.length) {
    const o = typeof r[0][0] == "number" ? [r] : r, t = ve(o[0], 1 * (1 + 0.2 * e.roughness), e), n = e.disableMultiStroke ? [] : ve(o[0], 1.5 * (1 + 0.22 * e.roughness), Ge(e));
    for (let s = 1; s < o.length; s++) {
      const a = o[s];
      if (a.length) {
        const i = ve(a, 1 * (1 + 0.2 * e.roughness), e), u = e.disableMultiStroke ? [] : ve(a, 1.5 * (1 + 0.22 * e.roughness), Ge(e));
        for (const c of i) c.op !== "move" && t.push(c);
        for (const c of u) c.op !== "move" && n.push(c);
      }
    }
    return { type: "path", ops: t.concat(n) };
  }
  return { type: "path", ops: [] };
}
function ot(r, e, o) {
  const t = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(r / 2, 2) + Math.pow(e / 2, 2)) / 2)), n = Math.ceil(Math.max(o.curveStepCount, o.curveStepCount / Math.sqrt(200) * t)), s = 2 * Math.PI / n;
  let a = Math.abs(r / 2), i = Math.abs(e / 2);
  const u = 1 - o.curveFitting;
  return a += q(a * u, o), i += q(i * u, o), { increment: s, rx: a, ry: i };
}
function Be(r, e, o, t) {
  const [n, s] = Ye(t.increment, r, e, t.rx, t.ry, 1, t.increment * Ce(0.1, Ce(0.4, 1, o), o), o);
  let a = Me(n, null, o);
  if (!o.disableMultiStroke && o.roughness !== 0) {
    const [i] = Ye(t.increment, r, e, t.rx, t.ry, 1.5, 0, o), u = Me(i, null, o);
    a = a.concat(u);
  }
  return { estimatedPoints: s, opset: { type: "path", ops: a } };
}
function Ze(r, e, o, t, n, s, a, i, u) {
  const c = r, l = e;
  let f = Math.abs(o / 2), h = Math.abs(t / 2);
  f += q(0.01 * f, u), h += q(0.01 * h, u);
  let d = n, p = s;
  for (; d < 0; ) d += 2 * Math.PI, p += 2 * Math.PI;
  p - d > 2 * Math.PI && (d = 0, p = 2 * Math.PI);
  const g = 2 * Math.PI / u.curveStepCount, w = Math.min(g / 2, (p - d) / 2), v = Xe(w, c, l, f, h, d, p, 1, u);
  if (!u.disableMultiStroke) {
    const S = Xe(w, c, l, f, h, d, p, 1.5, u);
    v.push(...S);
  }
  return a && (i ? v.push(...oe(c, l, c + f * Math.cos(d), l + h * Math.sin(d), u), ...oe(c, l, c + f * Math.cos(p), l + h * Math.sin(p), u)) : v.push({ op: "lineTo", data: [c, l] }, { op: "lineTo", data: [c + f * Math.cos(d), l + h * Math.sin(d)] })), { type: "path", ops: v };
}
function Ue(r, e) {
  const o = et(Qe(Fe(r))), t = [];
  let n = [0, 0], s = [0, 0];
  for (const { key: a, data: i } of o) switch (a) {
    case "M":
      s = [i[0], i[1]], n = [i[0], i[1]];
      break;
    case "L":
      t.push(...oe(s[0], s[1], i[0], i[1], e)), s = [i[0], i[1]];
      break;
    case "C": {
      const [u, c, l, f, h, d] = i;
      t.push(...Ft(u, c, l, f, h, d, s, e)), s = [h, d];
      break;
    }
    case "Z":
      t.push(...oe(s[0], s[1], n[0], n[1], e)), s = [n[0], n[1]];
  }
  return { type: "path", ops: t };
}
function ze(r, e) {
  const o = [];
  for (const t of r) if (t.length) {
    const n = e.maxRandomnessOffset || 0, s = t.length;
    if (s > 2) {
      o.push({ op: "move", data: [t[0][0] + q(n, e), t[0][1] + q(n, e)] });
      for (let a = 1; a < s; a++) o.push({ op: "lineTo", data: [t[a][0] + q(n, e), t[a][1] + q(n, e)] });
    }
  }
  return { type: "fillPath", ops: o };
}
function ie(r, e) {
  return function(o, t) {
    let n = o.fillStyle || "hachure";
    if (!Y[n]) switch (n) {
      case "zigzag":
        Y[n] || (Y[n] = new qt(t));
        break;
      case "cross-hatch":
        Y[n] || (Y[n] = new _t(t));
        break;
      case "dots":
        Y[n] || (Y[n] = new Ot(t));
        break;
      case "dashed":
        Y[n] || (Y[n] = new zt(t));
        break;
      case "zigzag-line":
        Y[n] || (Y[n] = new Rt(t));
        break;
      default:
        n = "hachure", Y[n] || (Y[n] = new He(t));
    }
    return Y[n];
  }(e, jt).fillPolygons(r, e);
}
function Ge(r) {
  const e = Object.assign({}, r);
  return e.randomizer = void 0, r.seed && (e.seed = r.seed + 1), e;
}
function st(r) {
  return r.randomizer || (r.randomizer = new Bt(r.seed || 0)), r.randomizer.next();
}
function Ce(r, e, o, t = 1) {
  return o.roughness * t * (st(o) * (e - r) + r);
}
function q(r, e, o = 1) {
  return Ce(-r, r, e, o);
}
function oe(r, e, o, t, n, s = !1) {
  const a = s ? n.disableMultiStrokeFill : n.disableMultiStroke, i = De(r, e, o, t, n, !0, !1);
  if (a) return i;
  const u = De(r, e, o, t, n, !0, !0);
  return i.concat(u);
}
function De(r, e, o, t, n, s, a) {
  const i = Math.pow(r - o, 2) + Math.pow(e - t, 2), u = Math.sqrt(i);
  let c = 1;
  c = u < 200 ? 1 : u > 500 ? 0.4 : -16668e-7 * u + 1.233334;
  let l = n.maxRandomnessOffset || 0;
  l * l * 100 > i && (l = u / 10);
  const f = l / 2, h = 0.2 + 0.2 * st(n);
  let d = n.bowing * n.maxRandomnessOffset * (t - e) / 200, p = n.bowing * n.maxRandomnessOffset * (r - o) / 200;
  d = q(d, n, c), p = q(p, n, c);
  const g = [], w = () => q(f, n, c), v = () => q(l, n, c), S = n.preserveVertices;
  return a ? g.push({ op: "move", data: [r + (S ? 0 : w()), e + (S ? 0 : w())] }) : g.push({ op: "move", data: [r + (S ? 0 : q(l, n, c)), e + (S ? 0 : q(l, n, c))] }), a ? g.push({ op: "bcurveTo", data: [d + r + (o - r) * h + w(), p + e + (t - e) * h + w(), d + r + 2 * (o - r) * h + w(), p + e + 2 * (t - e) * h + w(), o + (S ? 0 : w()), t + (S ? 0 : w())] }) : g.push({ op: "bcurveTo", data: [d + r + (o - r) * h + v(), p + e + (t - e) * h + v(), d + r + 2 * (o - r) * h + v(), p + e + 2 * (t - e) * h + v(), o + (S ? 0 : v()), t + (S ? 0 : v())] }), g;
}
function ve(r, e, o) {
  if (!r.length) return [];
  const t = [];
  t.push([r[0][0] + q(e, o), r[0][1] + q(e, o)]), t.push([r[0][0] + q(e, o), r[0][1] + q(e, o)]);
  for (let n = 1; n < r.length; n++) t.push([r[n][0] + q(e, o), r[n][1] + q(e, o)]), n === r.length - 1 && t.push([r[n][0] + q(e, o), r[n][1] + q(e, o)]);
  return Me(t, null, o);
}
function Me(r, e, o) {
  const t = r.length, n = [];
  if (t > 3) {
    const s = [], a = 1 - o.curveTightness;
    n.push({ op: "move", data: [r[1][0], r[1][1]] });
    for (let i = 1; i + 2 < t; i++) {
      const u = r[i];
      s[0] = [u[0], u[1]], s[1] = [u[0] + (a * r[i + 1][0] - a * r[i - 1][0]) / 6, u[1] + (a * r[i + 1][1] - a * r[i - 1][1]) / 6], s[2] = [r[i + 1][0] + (a * r[i][0] - a * r[i + 2][0]) / 6, r[i + 1][1] + (a * r[i][1] - a * r[i + 2][1]) / 6], s[3] = [r[i + 1][0], r[i + 1][1]], n.push({ op: "bcurveTo", data: [s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]] });
    }
  } else t === 3 ? (n.push({ op: "move", data: [r[1][0], r[1][1]] }), n.push({ op: "bcurveTo", data: [r[1][0], r[1][1], r[2][0], r[2][1], r[2][0], r[2][1]] })) : t === 2 && n.push(...De(r[0][0], r[0][1], r[1][0], r[1][1], o, !0, !0));
  return n;
}
function Ye(r, e, o, t, n, s, a, i) {
  const u = [], c = [];
  if (i.roughness === 0) {
    r /= 4, c.push([e + t * Math.cos(-r), o + n * Math.sin(-r)]);
    for (let l = 0; l <= 2 * Math.PI; l += r) {
      const f = [e + t * Math.cos(l), o + n * Math.sin(l)];
      u.push(f), c.push(f);
    }
    c.push([e + t * Math.cos(0), o + n * Math.sin(0)]), c.push([e + t * Math.cos(r), o + n * Math.sin(r)]);
  } else {
    const l = q(0.5, i) - Math.PI / 2;
    c.push([q(s, i) + e + 0.9 * t * Math.cos(l - r), q(s, i) + o + 0.9 * n * Math.sin(l - r)]);
    const f = 2 * Math.PI + l - 0.01;
    for (let h = l; h < f; h += r) {
      const d = [q(s, i) + e + t * Math.cos(h), q(s, i) + o + n * Math.sin(h)];
      u.push(d), c.push(d);
    }
    c.push([q(s, i) + e + t * Math.cos(l + 2 * Math.PI + 0.5 * a), q(s, i) + o + n * Math.sin(l + 2 * Math.PI + 0.5 * a)]), c.push([q(s, i) + e + 0.98 * t * Math.cos(l + a), q(s, i) + o + 0.98 * n * Math.sin(l + a)]), c.push([q(s, i) + e + 0.9 * t * Math.cos(l + 0.5 * a), q(s, i) + o + 0.9 * n * Math.sin(l + 0.5 * a)]);
  }
  return [c, u];
}
function Xe(r, e, o, t, n, s, a, i, u) {
  const c = s + q(0.1, u), l = [];
  l.push([q(i, u) + e + 0.9 * t * Math.cos(c - r), q(i, u) + o + 0.9 * n * Math.sin(c - r)]);
  for (let f = c; f <= a; f += r) l.push([q(i, u) + e + t * Math.cos(f), q(i, u) + o + n * Math.sin(f)]);
  return l.push([e + t * Math.cos(a), o + n * Math.sin(a)]), l.push([e + t * Math.cos(a), o + n * Math.sin(a)]), Me(l, null, u);
}
function Ft(r, e, o, t, n, s, a, i) {
  const u = [], c = [i.maxRandomnessOffset || 1, (i.maxRandomnessOffset || 1) + 0.3];
  let l = [0, 0];
  const f = i.disableMultiStroke ? 1 : 2, h = i.preserveVertices;
  for (let d = 0; d < f; d++) d === 0 ? u.push({ op: "move", data: [a[0], a[1]] }) : u.push({ op: "move", data: [a[0] + (h ? 0 : q(c[0], i)), a[1] + (h ? 0 : q(c[0], i))] }), l = h ? [n, s] : [n + q(c[d], i), s + q(c[d], i)], u.push({ op: "bcurveTo", data: [r + q(c[d], i), e + q(c[d], i), o + q(c[d], i), t + q(c[d], i), l[0], l[1]] });
  return u;
}
function me(r) {
  return [...r];
}
function Ke(r, e = 0) {
  const o = r.length;
  if (o < 3) throw new Error("A curve must have at least three points.");
  const t = [];
  if (o === 3) t.push(me(r[0]), me(r[1]), me(r[2]), me(r[2]));
  else {
    const n = [];
    n.push(r[0], r[0]);
    for (let i = 1; i < r.length; i++) n.push(r[i]), i === r.length - 1 && n.push(r[i]);
    const s = [], a = 1 - e;
    t.push(me(n[0]));
    for (let i = 1; i + 2 < n.length; i++) {
      const u = n[i];
      s[0] = [u[0], u[1]], s[1] = [u[0] + (a * n[i + 1][0] - a * n[i - 1][0]) / 6, u[1] + (a * n[i + 1][1] - a * n[i - 1][1]) / 6], s[2] = [n[i + 1][0] + (a * n[i][0] - a * n[i + 2][0]) / 6, n[i + 1][1] + (a * n[i][1] - a * n[i + 2][1]) / 6], s[3] = [n[i + 1][0], n[i + 1][1]], t.push(s[1], s[2], s[3]);
    }
  }
  return t;
}
function Ee(r, e) {
  return Math.pow(r[0] - e[0], 2) + Math.pow(r[1] - e[1], 2);
}
function Wt(r, e, o) {
  const t = Ee(e, o);
  if (t === 0) return Ee(r, e);
  let n = ((r[0] - e[0]) * (o[0] - e[0]) + (r[1] - e[1]) * (o[1] - e[1])) / t;
  return n = Math.max(0, Math.min(1, n)), Ee(r, re(e, o, n));
}
function re(r, e, o) {
  return [r[0] + (e[0] - r[0]) * o, r[1] + (e[1] - r[1]) * o];
}
function je(r, e, o, t) {
  const n = t || [];
  if (function(i, u) {
    const c = i[u + 0], l = i[u + 1], f = i[u + 2], h = i[u + 3];
    let d = 3 * l[0] - 2 * c[0] - h[0];
    d *= d;
    let p = 3 * l[1] - 2 * c[1] - h[1];
    p *= p;
    let g = 3 * f[0] - 2 * h[0] - c[0];
    g *= g;
    let w = 3 * f[1] - 2 * h[1] - c[1];
    return w *= w, d < g && (d = g), p < w && (p = w), d + p;
  }(r, e) < o) {
    const i = r[e + 0];
    n.length ? (s = n[n.length - 1], a = i, Math.sqrt(Ee(s, a)) > 1 && n.push(i)) : n.push(i), n.push(r[e + 3]);
  } else {
    const u = r[e + 0], c = r[e + 1], l = r[e + 2], f = r[e + 3], h = re(u, c, 0.5), d = re(c, l, 0.5), p = re(l, f, 0.5), g = re(h, d, 0.5), w = re(d, p, 0.5), v = re(g, w, 0.5);
    je([u, h, g, v], 0, o, n), je([v, w, p, f], 0, o, n);
  }
  var s, a;
  return n;
}
function Vt(r, e) {
  return Le(r, 0, r.length, e);
}
function Le(r, e, o, t, n) {
  const s = n || [], a = r[e], i = r[o - 1];
  let u = 0, c = 1;
  for (let l = e + 1; l < o - 1; ++l) {
    const f = Wt(r[l], a, i);
    f > u && (u = f, c = l);
  }
  return Math.sqrt(u) > t ? (Le(r, e, c + 1, t, s), Le(r, c, o, t, s)) : (s.length || s.push(a), s.push(i)), s;
}
function Re(r, e = 0.15, o) {
  const t = [], n = (r.length - 1) / 3;
  for (let s = 0; s < n; s++)
    je(r, 3 * s, e, t);
  return o && o > 0 ? Le(t, 0, t.length, o) : t;
}
const K = "none";
class Ae {
  constructor(e) {
    this.defaultOptions = { maxRandomnessOffset: 2, roughness: 1, bowing: 1, stroke: "#000", strokeWidth: 1, curveTightness: 0, curveFitting: 0.95, curveStepCount: 9, fillStyle: "hachure", fillWeight: -1, hachureAngle: -41, hachureGap: -1, dashOffset: -1, dashGap: -1, zigzagOffset: -1, seed: 0, disableMultiStroke: !1, disableMultiStrokeFill: !1, preserveVertices: !1, fillShapeRoughnessGain: 0.8 }, this.config = e || {}, this.config.options && (this.defaultOptions = this._o(this.config.options));
  }
  static newSeed() {
    return Math.floor(Math.random() * 2 ** 31);
  }
  _o(e) {
    return e ? Object.assign({}, this.defaultOptions, e) : this.defaultOptions;
  }
  _d(e, o, t) {
    return { shape: e, sets: o || [], options: t || this.defaultOptions };
  }
  line(e, o, t, n, s) {
    const a = this._o(s);
    return this._d("line", [nt(e, o, t, n, a)], a);
  }
  rectangle(e, o, t, n, s) {
    const a = this._o(s), i = [], u = Ht(e, o, t, n, a);
    if (a.fill) {
      const c = [[e, o], [e + t, o], [e + t, o + n], [e, o + n]];
      a.fillStyle === "solid" ? i.push(ze([c], a)) : i.push(ie([c], a));
    }
    return a.stroke !== K && i.push(u), this._d("rectangle", i, a);
  }
  ellipse(e, o, t, n, s) {
    const a = this._o(s), i = [], u = ot(t, n, a), c = Be(e, o, a, u);
    if (a.fill) if (a.fillStyle === "solid") {
      const l = Be(e, o, a, u).opset;
      l.type = "fillPath", i.push(l);
    } else i.push(ie([c.estimatedPoints], a));
    return a.stroke !== K && i.push(c.opset), this._d("ellipse", i, a);
  }
  circle(e, o, t, n) {
    const s = this.ellipse(e, o, t, t, n);
    return s.shape = "circle", s;
  }
  linearPath(e, o) {
    const t = this._o(o);
    return this._d("linearPath", [ke(e, !1, t)], t);
  }
  arc(e, o, t, n, s, a, i = !1, u) {
    const c = this._o(u), l = [], f = Ze(e, o, t, n, s, a, i, !0, c);
    if (i && c.fill) if (c.fillStyle === "solid") {
      const h = Object.assign({}, c);
      h.disableMultiStroke = !0;
      const d = Ze(e, o, t, n, s, a, !0, !1, h);
      d.type = "fillPath", l.push(d);
    } else l.push(function(h, d, p, g, w, v, S) {
      const L = h, _ = d;
      let M = Math.abs(p / 2), b = Math.abs(g / 2);
      M += q(0.01 * M, S), b += q(0.01 * b, S);
      let k = w, E = v;
      for (; k < 0; ) k += 2 * Math.PI, E += 2 * Math.PI;
      E - k > 2 * Math.PI && (k = 0, E = 2 * Math.PI);
      const A = (E - k) / S.curveStepCount, R = [];
      for (let N = k; N <= E; N += A) R.push([L + M * Math.cos(N), _ + b * Math.sin(N)]);
      return R.push([L + M * Math.cos(E), _ + b * Math.sin(E)]), R.push([L, _]), ie([R], S);
    }(e, o, t, n, s, a, c));
    return c.stroke !== K && l.push(f), this._d("arc", l, c);
  }
  curve(e, o) {
    const t = this._o(o), n = [], s = Je(e, t);
    if (t.fill && t.fill !== K) if (t.fillStyle === "solid") {
      const a = Je(e, Object.assign(Object.assign({}, t), { disableMultiStroke: !0, roughness: t.roughness ? t.roughness + t.fillShapeRoughnessGain : 0 }));
      n.push({ type: "fillPath", ops: this._mergedShape(a.ops) });
    } else {
      const a = [], i = e;
      if (i.length) {
        const u = typeof i[0][0] == "number" ? [i] : i;
        for (const c of u) c.length < 3 ? a.push(...c) : c.length === 3 ? a.push(...Re(Ke([c[0], c[0], c[1], c[2]]), 10, (1 + t.roughness) / 2)) : a.push(...Re(Ke(c), 10, (1 + t.roughness) / 2));
      }
      a.length && n.push(ie([a], t));
    }
    return t.stroke !== K && n.push(s), this._d("curve", n, t);
  }
  polygon(e, o) {
    const t = this._o(o), n = [], s = ke(e, !0, t);
    return t.fill && (t.fillStyle === "solid" ? n.push(ze([e], t)) : n.push(ie([e], t))), t.stroke !== K && n.push(s), this._d("polygon", n, t);
  }
  path(e, o) {
    const t = this._o(o), n = [];
    if (!e) return this._d("path", n, t);
    e = (e || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
    const s = t.fill && t.fill !== "transparent" && t.fill !== K, a = t.stroke !== K, i = !!(t.simplification && t.simplification < 1), u = function(l, f, h) {
      const d = et(Qe(Fe(l))), p = [];
      let g = [], w = [0, 0], v = [];
      const S = () => {
        v.length >= 4 && g.push(...Re(v, f)), v = [];
      }, L = () => {
        S(), g.length && (p.push(g), g = []);
      };
      for (const { key: M, data: b } of d) switch (M) {
        case "M":
          L(), w = [b[0], b[1]], g.push(w);
          break;
        case "L":
          S(), g.push([b[0], b[1]]);
          break;
        case "C":
          if (!v.length) {
            const k = g.length ? g[g.length - 1] : w;
            v.push([k[0], k[1]]);
          }
          v.push([b[0], b[1]]), v.push([b[2], b[3]]), v.push([b[4], b[5]]);
          break;
        case "Z":
          S(), g.push([w[0], w[1]]);
      }
      if (L(), !h) return p;
      const _ = [];
      for (const M of p) {
        const b = Vt(M, h);
        b.length && _.push(b);
      }
      return _;
    }(e, 1, i ? 4 - 4 * (t.simplification || 1) : (1 + t.roughness) / 2), c = Ue(e, t);
    if (s) if (t.fillStyle === "solid") if (u.length === 1) {
      const l = Ue(e, Object.assign(Object.assign({}, t), { disableMultiStroke: !0, roughness: t.roughness ? t.roughness + t.fillShapeRoughnessGain : 0 }));
      n.push({ type: "fillPath", ops: this._mergedShape(l.ops) });
    } else n.push(ze(u, t));
    else n.push(ie(u, t));
    return a && (i ? u.forEach((l) => {
      n.push(ke(l, !1, t));
    }) : n.push(c)), this._d("path", n, t);
  }
  opsToPath(e, o) {
    let t = "";
    for (const n of e.ops) {
      const s = typeof o == "number" && o >= 0 ? n.data.map((a) => +a.toFixed(o)) : n.data;
      switch (n.op) {
        case "move":
          t += `M${s[0]} ${s[1]} `;
          break;
        case "bcurveTo":
          t += `C${s[0]} ${s[1]}, ${s[2]} ${s[3]}, ${s[4]} ${s[5]} `;
          break;
        case "lineTo":
          t += `L${s[0]} ${s[1]} `;
      }
    }
    return t.trim();
  }
  toPaths(e) {
    const o = e.sets || [], t = e.options || this.defaultOptions, n = [];
    for (const s of o) {
      let a = null;
      switch (s.type) {
        case "path":
          a = { d: this.opsToPath(s), stroke: t.stroke, strokeWidth: t.strokeWidth, fill: K };
          break;
        case "fillPath":
          a = { d: this.opsToPath(s), stroke: K, strokeWidth: 0, fill: t.fill || K };
          break;
        case "fillSketch":
          a = this.fillSketch(s, t);
      }
      a && n.push(a);
    }
    return n;
  }
  fillSketch(e, o) {
    let t = o.fillWeight;
    return t < 0 && (t = o.strokeWidth / 2), { d: this.opsToPath(e), stroke: o.fill || K, strokeWidth: t, fill: K };
  }
  _mergedShape(e) {
    return e.filter((o, t) => t === 0 || o.op !== "move");
  }
}
class Jt {
  constructor(e, o) {
    this.canvas = e, this.ctx = this.canvas.getContext("2d"), this.gen = new Ae(o);
  }
  draw(e) {
    const o = e.sets || [], t = e.options || this.getDefaultOptions(), n = this.ctx, s = e.options.fixedDecimalPlaceDigits;
    for (const a of o) switch (a.type) {
      case "path":
        n.save(), n.strokeStyle = t.stroke === "none" ? "transparent" : t.stroke, n.lineWidth = t.strokeWidth, t.strokeLineDash && n.setLineDash(t.strokeLineDash), t.strokeLineDashOffset && (n.lineDashOffset = t.strokeLineDashOffset), this._drawToContext(n, a, s), n.restore();
        break;
      case "fillPath": {
        n.save(), n.fillStyle = t.fill || "";
        const i = e.shape === "curve" || e.shape === "polygon" || e.shape === "path" ? "evenodd" : "nonzero";
        this._drawToContext(n, a, s, i), n.restore();
        break;
      }
      case "fillSketch":
        this.fillSketch(n, a, t);
    }
  }
  fillSketch(e, o, t) {
    let n = t.fillWeight;
    n < 0 && (n = t.strokeWidth / 2), e.save(), t.fillLineDash && e.setLineDash(t.fillLineDash), t.fillLineDashOffset && (e.lineDashOffset = t.fillLineDashOffset), e.strokeStyle = t.fill || "", e.lineWidth = n, this._drawToContext(e, o, t.fixedDecimalPlaceDigits), e.restore();
  }
  _drawToContext(e, o, t, n = "nonzero") {
    e.beginPath();
    for (const s of o.ops) {
      const a = typeof t == "number" && t >= 0 ? s.data.map((i) => +i.toFixed(t)) : s.data;
      switch (s.op) {
        case "move":
          e.moveTo(a[0], a[1]);
          break;
        case "bcurveTo":
          e.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
          break;
        case "lineTo":
          e.lineTo(a[0], a[1]);
      }
    }
    o.type === "fillPath" ? e.fill(n) : e.stroke();
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  line(e, o, t, n, s) {
    const a = this.gen.line(e, o, t, n, s);
    return this.draw(a), a;
  }
  rectangle(e, o, t, n, s) {
    const a = this.gen.rectangle(e, o, t, n, s);
    return this.draw(a), a;
  }
  ellipse(e, o, t, n, s) {
    const a = this.gen.ellipse(e, o, t, n, s);
    return this.draw(a), a;
  }
  circle(e, o, t, n) {
    const s = this.gen.circle(e, o, t, n);
    return this.draw(s), s;
  }
  linearPath(e, o) {
    const t = this.gen.linearPath(e, o);
    return this.draw(t), t;
  }
  polygon(e, o) {
    const t = this.gen.polygon(e, o);
    return this.draw(t), t;
  }
  arc(e, o, t, n, s, a, i = !1, u) {
    const c = this.gen.arc(e, o, t, n, s, a, i, u);
    return this.draw(c), c;
  }
  curve(e, o) {
    const t = this.gen.curve(e, o);
    return this.draw(t), t;
  }
  path(e, o) {
    const t = this.gen.path(e, o);
    return this.draw(t), t;
  }
}
const xe = "http://www.w3.org/2000/svg";
class Zt {
  constructor(e, o) {
    this.svg = e, this.gen = new Ae(o);
  }
  draw(e) {
    const o = e.sets || [], t = e.options || this.getDefaultOptions(), n = this.svg.ownerDocument || window.document, s = n.createElementNS(xe, "g"), a = e.options.fixedDecimalPlaceDigits;
    for (const i of o) {
      let u = null;
      switch (i.type) {
        case "path":
          u = n.createElementNS(xe, "path"), u.setAttribute("d", this.opsToPath(i, a)), u.setAttribute("stroke", t.stroke), u.setAttribute("stroke-width", t.strokeWidth + ""), u.setAttribute("fill", "none"), t.strokeLineDash && u.setAttribute("stroke-dasharray", t.strokeLineDash.join(" ").trim()), t.strokeLineDashOffset && u.setAttribute("stroke-dashoffset", `${t.strokeLineDashOffset}`);
          break;
        case "fillPath":
          u = n.createElementNS(xe, "path"), u.setAttribute("d", this.opsToPath(i, a)), u.setAttribute("stroke", "none"), u.setAttribute("stroke-width", "0"), u.setAttribute("fill", t.fill || ""), e.shape !== "curve" && e.shape !== "polygon" || u.setAttribute("fill-rule", "evenodd");
          break;
        case "fillSketch":
          u = this.fillSketch(n, i, t);
      }
      u && s.appendChild(u);
    }
    return s;
  }
  fillSketch(e, o, t) {
    let n = t.fillWeight;
    n < 0 && (n = t.strokeWidth / 2);
    const s = e.createElementNS(xe, "path");
    return s.setAttribute("d", this.opsToPath(o, t.fixedDecimalPlaceDigits)), s.setAttribute("stroke", t.fill || ""), s.setAttribute("stroke-width", n + ""), s.setAttribute("fill", "none"), t.fillLineDash && s.setAttribute("stroke-dasharray", t.fillLineDash.join(" ").trim()), t.fillLineDashOffset && s.setAttribute("stroke-dashoffset", `${t.fillLineDashOffset}`), s;
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  opsToPath(e, o) {
    return this.gen.opsToPath(e, o);
  }
  line(e, o, t, n, s) {
    const a = this.gen.line(e, o, t, n, s);
    return this.draw(a);
  }
  rectangle(e, o, t, n, s) {
    const a = this.gen.rectangle(e, o, t, n, s);
    return this.draw(a);
  }
  ellipse(e, o, t, n, s) {
    const a = this.gen.ellipse(e, o, t, n, s);
    return this.draw(a);
  }
  circle(e, o, t, n) {
    const s = this.gen.circle(e, o, t, n);
    return this.draw(s);
  }
  linearPath(e, o) {
    const t = this.gen.linearPath(e, o);
    return this.draw(t);
  }
  polygon(e, o) {
    const t = this.gen.polygon(e, o);
    return this.draw(t);
  }
  arc(e, o, t, n, s, a, i = !1, u) {
    const c = this.gen.arc(e, o, t, n, s, a, i, u);
    return this.draw(c);
  }
  curve(e, o) {
    const t = this.gen.curve(e, o);
    return this.draw(t);
  }
  path(e, o) {
    const t = this.gen.path(e, o);
    return this.draw(t);
  }
}
var rt = { canvas: (r, e) => new Jt(r, e), svg: (r, e) => new Zt(r, e), generator: (r) => new Ae(r), newSeed: () => Ae.newSeed() };
function Gt(r, e = {}) {
  if (!r) return;
  const o = e.width || 800, t = e.height || 600;
  r.innerHTML = "";
  const n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  n.setAttribute("width", o), n.setAttribute("height", t), n.setAttribute("viewBox", `0 0 ${o} ${t}`), n.setAttribute("xmlns", "http://www.w3.org/2000/svg"), r.appendChild(n);
  const s = rt.svg(n), a = {
    frame: "#222",
    accent: "#fe8100",
    text: "#111"
  };
  n.appendChild(
    s.rectangle(10, 10, o - 20, t - 20, {
      stroke: a.frame,
      strokeWidth: 2,
      roughness: 2.2,
      bowing: 1.5
    })
  ), n.appendChild(
    s.rectangle(30, 30, o - 60, 90, {
      stroke: a.accent,
      strokeWidth: 2.5,
      fill: "#fff7ec",
      fillStyle: "hachure",
      roughness: 1.7,
      bowing: 1.2
    })
  ), n.appendChild(
    s.rectangle(30, 140, 180, t - 180, {
      stroke: a.frame,
      strokeWidth: 2,
      fill: "#f5f5f5",
      fillStyle: "cross-hatch",
      roughness: 1.5
    })
  ), n.appendChild(
    s.rectangle(230, 140, o - 270, t - 180, {
      stroke: a.frame,
      strokeWidth: 2,
      roughness: 1.6
    })
  );
  for (let c = 0; c < 6; c++) {
    const l = 180 + c * 45;
    n.appendChild(
      s.line(50, l, 190, l, {
        stroke: a.frame,
        strokeWidth: 1.5,
        roughness: 1.8
      })
    );
  }
  for (let c = 0; c < 8; c++) {
    const l = 200 + c * 40;
    n.appendChild(
      s.line(250, l, o - 80, l, {
        stroke: a.frame,
        strokeWidth: 1.4,
        roughness: 1.9
      })
    );
  }
  const i = document.createElementNS("http://www.w3.org/2000/svg", "text");
  i.setAttribute("x", 50), i.setAttribute("y", 85), i.setAttribute("fill", a.text), i.setAttribute("font-size", "36"), i.setAttribute("font-family", "Arial, Helvetica, sans-serif"), i.textContent = e.title || "Sketched Template", n.appendChild(i);
  const u = document.createElementNS("http://www.w3.org/2000/svg", "text");
  return u.setAttribute("x", 50), u.setAttribute("y", 115), u.setAttribute("fill", a.text), u.setAttribute("font-size", "18"), u.setAttribute("font-family", "Arial, Helvetica, sans-serif"), u.textContent = e.subtitle || "Rough.js example", n.appendChild(u), n;
}
function Yt(r, e = {}) {
  if (!r) return;
  const o = e.width || 800, t = e.height || 300;
  r.innerHTML = "";
  const n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  n.setAttribute("width", o), n.setAttribute("height", t), n.setAttribute("viewBox", `0 0 ${o} ${t}`), n.setAttribute("xmlns", "http://www.w3.org/2000/svg"), r.appendChild(n);
  const s = rt.svg(n), a = t - 40, i = 60, u = o - 220, c = 140, l = 90;
  n.appendChild(
    s.line(20, a, o - 20, a, { stroke: "#222", strokeWidth: 2, roughness: 1.6 })
  ), n.appendChild(
    s.rectangle(20, 40, 40, a - 40, {
      stroke: "#222",
      fill: "#f5f5f5",
      fillStyle: "zigzag",
      strokeWidth: 2,
      roughness: 1.6
    })
  ), n.appendChild(
    s.rectangle(u, a - l, c, l, {
      stroke: "#0d47a1",
      fill: "#e3f2fd",
      fillStyle: "hachure",
      strokeWidth: 2.4,
      roughness: 1.4,
      bowing: 1.2
    })
  );
  const f = i + 40, h = u - 10, d = a - l / 2, p = 8, g = (h - f) / p;
  let w = `M ${f} ${d}`;
  for (let k = 0; k < p; k++) {
    const E = f + (k + 0.5) * g, A = d + (k % 2 === 0 ? -18 : 18);
    w += ` L ${E} ${A}`, w += ` L ${f + (k + 1) * g} ${d}`;
  }
  const v = document.createElementNS("http://www.w3.org/2000/svg", "path");
  v.setAttribute("d", w), v.setAttribute("stroke", "#e65100"), v.setAttribute("fill", "none"), v.setAttribute("stroke-width", "3"), v.setAttribute("stroke-linecap", "round"), v.setAttribute("stroke-linejoin", "round"), n.appendChild(v);
  const S = d + 50, L = f + 20, _ = u - 20;
  n.appendChild(
    s.line(L, S, L + 40, S, { stroke: "#444", strokeWidth: 2 })
  ), n.appendChild(
    s.rectangle(L + 40, S - 12, 50, 24, {
      stroke: "#444",
      fill: "#f0f0f0",
      fillStyle: "solid",
      strokeWidth: 2,
      roughness: 1.2
    })
  ), n.appendChild(
    s.line(L + 90, S, _ - 40, S, { stroke: "#444", strokeWidth: 2 })
  ), n.appendChild(
    s.rectangle(_ - 40, S - 16, 26, 32, {
      stroke: "#444",
      fill: "none",
      strokeWidth: 2,
      roughness: 1.2
    })
  ), n.appendChild(
    s.line(_ - 14, S - 16, _ - 14, S + 16, {
      stroke: "#444",
      strokeWidth: 2
    })
  );
  const M = (k, E, A, R = "#111", N = 16) => {
    const T = document.createElementNS("http://www.w3.org/2000/svg", "text");
    T.setAttribute("x", E), T.setAttribute("y", A), T.setAttribute("fill", R), T.setAttribute("font-size", N), T.setAttribute("font-family", "Arial, Helvetica, sans-serif"), T.textContent = k, n.appendChild(T);
  };
  M(e.massLabel || "m", u + c / 2 - 6, a - l / 2 + 6, "#0d47a1", 18), M(e.springLabel || "k", (f + h) / 2, d - 24, "#e65100", 16), M(e.damperLabel || "c", (L + _) / 2, S + 28, "#444", 16), M(e.forceLabel || "F(t)", u + c + 20, a - l / 2, "#b71c1c", 16), n.appendChild(
    s.line(u + c, d, u + c + 40, d, {
      stroke: "#b71c1c",
      strokeWidth: 3,
      roughness: 1.4
    })
  );
  const b = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return b.setAttribute(
    "d",
    `M ${u + c + 40} ${d} L ${u + c + 30} ${d - 8} L ${u + c + 30} ${d + 8} Z`
  ), b.setAttribute("fill", "#b71c1c"), n.appendChild(b), n;
}
function Xt(r) {
  const e = JXG.JSXGraph.initBoard(r, {
    boundingbox: [-1, 6, 10, -1],
    axis: !0,
    showCopyright: !1,
    showNavigation: !1
  }), o = (c, l) => 2 + Math.sin(c + l);
  let t = 0;
  const n = (c = 0) => (getComputedStyle(document.documentElement).getPropertyValue(`--jxg-color-${c + 1}`) || "").trim() || "#e65100", s = e.create(
    "curve",
    [
      () => {
        const c = [];
        for (let l = 0; l <= 100; l++) c.push(l * 0.1);
        return c;
      },
      () => {
        const c = [];
        for (let l = 0; l <= 100; l++) {
          const f = l * 0.1;
          c.push(o(f, t));
        }
        return c;
      }
    ],
    { strokeColor: n(0), strokeWidth: 3 }
  ), a = () => {
    s.setAttribute({ strokeColor: n(0) }), e.update();
  };
  new MutationObserver(() => a()).observe(document.documentElement, { attributes: !0, attributeFilter: ["data-theme"] });
  const u = () => {
    t += 0.05, s.updateDataArray(), e.update(), requestAnimationFrame(u);
  };
  u();
}
export {
  Ut as default,
  Xt as initJsxGraphDemo,
  Ut as initTemplate,
  Yt as renderMassSpringDamper,
  Gt as renderRoughTemplate
};
