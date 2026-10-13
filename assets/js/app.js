/* =========================================================
   CareerPath — App logic
   Semua data disimpan di localStorage browser (tanpa server).
   Setiap halaman memiliki <body data-page="..."> yang menentukan
   fungsi mana yang dijalankan.
   ========================================================= */

(function () {
  "use strict";

  const D = window.CP_DATA;
  const KEY = "careerpath:v1";

  /* ---------------- Storage ---------------- */
  const defaults = () => ({
    profile: { name: "", university: "", field: "", gradYear: "", skills: "", interests: "" },
    answers: [],            // index jawaban per pertanyaan
    assessmentDone: false,
    saved: [],              // id karier
    roadmap: [],            // index tahap selesai
    cvReviewed: false,
  });

  const Store = {
    get() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
      } catch (e) {
        return defaults();
      }
    },
    set(state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage tidak tersedia */ }
    },
    update(fn) { const s = this.get(); fn(s); this.set(s); return s; },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} },
  };

  /* ---------------- Helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function firstName(state) {
    const n = (state.profile.name || "").trim();
    return n ? n.split(/\s+/)[0] : "there";
  }

  function initials(state) {
    const n = (state.profile.name || "").trim();
    if (!n) return "CP";
    return n.split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  }

  /* Skor keselarasan minat: persentase jawaban per career family */
  function scores(state) {
    const result = {};
    D.careers.forEach((c) => (result[c.family] = null));
    if (!state.assessmentDone) return result;
    const counts = {};
    state.answers.forEach((ans, qi) => {
      const opt = D.questions[qi] && D.questions[qi].options[ans];
      if (opt) counts[opt.family] = (counts[opt.family] || 0) + 1;
    });
    const total = D.questions.length;
    Object.keys(result).forEach((f) => (result[f] = Math.round(((counts[f] || 0) / total) * 100)));
    return result;
  }

  const scoreLabel = (v) => (v === null ? "—%" : v + "%");

  function sortedCareers(state) {
    const sc = scores(state);
    return [...D.careers].sort((a, b) => (sc[b.family] ?? -1) - (sc[a.family] ?? -1));
  }

  function profileCompleteness(state) {
    const fields = Object.values(state.profile);
    const filled = fields.filter((v) => String(v).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }

  function learningProgress(state) {
    return Math.round((state.roadmap.length / D.roadmap.steps.length) * 100);
  }

  function toggleSave(id) {
    let nowSaved = false;
    Store.update((s) => {
      if (s.saved.includes(id)) s.saved = s.saved.filter((x) => x !== id);
      else { s.saved.push(id); nowSaved = true; }
    });
    toast(nowSaved ? "Career saved in this browser." : "Career removed from saved list.");
    return nowSaved;
  }

  /* ---------------- App shell (sidebar + topbar) ---------------- */
  const NAV = [
    { page: "dashboard", href: "dashboard.html", label: "Dashboard", ico: "▦" },
    { page: "profile", href: "profile.html", label: "My profile", ico: "○" },
    { page: "assessment", href: "assessment.html", label: "Career assessment", ico: "◎" },
    { page: "matches", href: "career-matches.html", label: "Career matches", ico: "◇" },
    { page: "cv", href: "cv-analyzer.html", label: "CV analyzer", ico: "▤" },
    { page: "roadmap", href: "learning-roadmap.html", label: "Learning roadmap", ico: "↗" },
    { page: "saved", href: "saved-careers.html", label: "Saved careers", ico: "♡" },
  ];

  function renderShell(page, title) {
    const state = Store.get();
    const activePage = page === "career" ? "matches" : page;
    const app = $("#app");
    const content = app.innerHTML;
    app.className = "app";
    app.innerHTML = `
      <aside class="sidebar">
        <a href="index.html" class="logo" aria-label="CareerPath home">
          <span class="logo-mark">↗</span><span>Career <span class="accent">Path</span></span>
        </a>
        <nav class="side-nav" aria-label="Workspace">
          ${NAV.map(
            (n) => `<a href="${n.href}" class="${n.page === activePage ? "active" : ""}"
              ${n.page === activePage ? 'aria-current="page"' : ""}><span class="ico">${n.ico}</span>${n.label}</a>`
          ).join("")}
        </nav>
        <div class="side-note">
          <strong>Small steps. Big possibilities.</strong>
          <p>Your next chapter starts with you.</p>
        </div>
        <a href="index.html" class="side-back">← Back to website</a>
      </aside>
      <div class="app-main">
        <header class="topbar">
          <span class="topbar-title">${esc(title)}</span>
          <div class="topbar-user">
            <span class="ws">Personal workspace</span>
            <span class="avatar">${esc(initials(state))}</span>
            <span>${esc(state.profile.name || "Guest")}</span>
          </div>
        </header>
        <main class="main" id="main">${content}</main>
      </div>`;
  }

  /* ---------------- Career card ---------------- */
  function careerCard(c, state) {
    const sc = scores(state);
    const saved = state.saved.includes(c.id);
    return `
      <article class="career-card" data-name="${esc((c.name + " " + c.skills.join(" ")).toLowerCase())}">
        <div class="career-card-head">
          <span class="career-icon">${c.icon}</span>
          <div>
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.tagline)}</p>
          </div>
          <span class="badge">${scoreLabel(sc[c.family])} interest alignment</span>
        </div>
        <p class="career-skills">Core skills: ${c.skills.map(esc).join(" · ")}</p>
        <div class="career-card-foot">
          <a class="link" href="career-detail.html?id=${c.id}">View career details →</a>
          <button class="btn btn-outline btn-save ${saved ? "saved" : ""}" data-save="${c.id}">
            ${saved ? "♥ Saved" : "♡ Save career"}
          </button>
        </div>
      </article>`;
  }

  function bindSaveButtons(root, onChange) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-save]");
      if (!btn) return;
      const saved = toggleSave(btn.dataset.save);
      btn.classList.toggle("saved", saved);
      btn.textContent = saved ? "♥ Saved" : "♡ Save career";
      if (onChange) onChange();
    });
  }

  /* =========================================================
     PAGES
     ========================================================= */
  const Pages = {};

  /* ---------- Home ---------- */
  Pages.home = function () {
    const header = $(".site-header");
    const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const state = Store.get();
    const hasWorkspace = !!state.profile.name;
    document.querySelectorAll("[data-start]").forEach((a) => {
      a.href = hasWorkspace ? "dashboard.html" : "start.html";
    });

    const list = $("#snapshotList");
    if (list) {
      const sc = scores(state);
      list.innerHTML = D.careers
        .map(
          (c) => `<div class="mini-career">
            <span class="career-icon">${c.icon}</span>
            <div><strong>${esc(c.name)}</strong><small>${esc(c.tagline)}</small></div>
            <span class="badge">${scoreLabel(sc[c.family])}</span>
          </div>`
        )
        .join("");
    }
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  };

  /* ---------- Personal workspace ---------- */
  Pages.start = function () {
    const state = Store.get();
    const form = $("#startForm");
    form.name.value = state.profile.name;
    form.field.value = state.profile.field;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      if (!name) {
        form.name.focus();
        toast("Please tell us what to call you.");
        return;
      }
      Store.update((s) => {
        s.profile.name = name;
        s.profile.field = form.field.value.trim();
      });
      window.location.href = "dashboard.html";
    });
  };

  /* ---------- Dashboard ---------- */
  Pages.dashboard = function () {
    const state = Store.get();
    const sc = scores(state);
    const completeness = profileCompleteness(state);

    $("#greeting").textContent = `Hi ${firstName(state)}, let’s find your direction. 👋`;

    const banner = $("#banner");
    if (state.assessmentDone) {
      const top = sortedCareers(state)[0];
      banner.innerHTML = `
        <div><h2>Your strongest interest: ${esc(top.name)}</h2>
        <p>Explore the career and turn it into a learning plan.</p></div>
        <a class="btn btn-primary" href="career-matches.html">See career matches →</a>`;
    }

    $("#statProfile").textContent = completeness + "%";
    $("#statProfileNote").textContent =
      completeness === 100 ? "Your profile is complete" : "Add your details to complete your profile";
    $("#statMatches").textContent = D.careers.length;
    $("#statLearning").textContent = learningProgress(state) + "%";

    $("#careerList").innerHTML = sortedCareers(state)
      .map(
        (c) => `<a class="row-career" href="career-detail.html?id=${c.id}">
          <span class="career-icon">${c.icon}</span>
          <div><strong>${esc(c.name)}</strong><small>${esc(c.tagline)}</small></div>
          <span class="badge">${scoreLabel(sc[c.family])}</span>
        </a>`
      )
      .join("");

    const steps = [
      { label: "Complete your profile", href: "profile.html", done: completeness === 100 },
      { label: "Take the assessment", href: "assessment.html", done: state.assessmentDone },
      { label: "Review your CV", href: "cv-analyzer.html", done: state.cvReviewed },
      { label: "Build your skills", href: "learning-roadmap.html", done: state.roadmap.length === D.roadmap.steps.length },
    ];
    $("#nextSteps").innerHTML = steps
      .map(
        (s, i) => `<a class="next-step ${s.done ? "done" : ""}" href="${s.href}">
          <span class="num-tag">${s.done ? "✓" : String(i + 1).padStart(2, "0")}</span>
          ${s.label}<span class="arrow">→</span></a>`
      )
      .join("");
  };

  /* ---------- Profile ---------- */
  Pages.profile = function () {
    const form = $("#profileForm");
    const state = Store.get();
    Object.keys(state.profile).forEach((k) => {
      if (form[k]) form[k].value = state.profile[k];
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      Store.update((s) => {
        Object.keys(s.profile).forEach((k) => {
          if (form[k]) s.profile[k] = form[k].value.trim();
        });
      });
      document.querySelectorAll(".topbar-user span:last-child").forEach((el) => (el.textContent = form.name.value.trim() || "Guest"));
      document.querySelectorAll(".avatar").forEach((el) => (el.textContent = initials(Store.get())));
      toast("Profile saved on this device.");
    });

    $("#downloadBtn").addEventListener("click", () => {
      const data = JSON.stringify({ exportedAt: new Date().toISOString(), ...Store.get() }, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "careerpath-progress.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });

    $("#importInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          delete data.exportedAt;
          Store.set(Object.assign(defaults(), data));
          toast("Progress imported.");
          setTimeout(() => window.location.reload(), 700);
        } catch (err) {
          toast("That file could not be read.");
        }
      };
      reader.readAsText(file);
    });

    $("#deleteBtn").addEventListener("click", () => {
      if (!confirm("Delete all CareerPath data saved in this browser? This cannot be undone.")) return;
      Store.clear();
      window.location.href = "start.html";
    });
  };

  /* ---------- Assessment ---------- */
  Pages.assessment = function () {
    const state = Store.get();
    let answers = state.assessmentDone ? state.answers.slice() : [];
    let index = 0;
    const box = $("#quiz");
    const total = D.questions.length;

    function render() {
      const q = D.questions[index];
      box.innerHTML = `
        <div class="quiz-top"><strong>Interest exploration</strong><span>Question ${index + 1} of ${total}</span></div>
        <div class="progress"><span style="width:${((index + 1) / total) * 100}%"></span></div>
        <h2 id="qText">${esc(q.text)}</h2>
        <div class="options" role="radiogroup" aria-labelledby="qText">
          ${q.options
            .map(
              (o, i) => `<button type="button" class="option ${answers[index] === i ? "selected" : ""}"
                role="radio" aria-checked="${answers[index] === i}" data-opt="${i}">${esc(o.label)}</button>`
            )
            .join("")}
        </div>
        <div class="quiz-nav">
          <button class="btn-text" id="prevBtn" ${index === 0 ? "disabled" : ""}>← Previous</button>
          <button class="btn btn-primary" id="nextBtn" ${answers[index] === undefined ? "disabled" : ""}>
            ${index === total - 1 ? "See my results →" : "Next question →"}
          </button>
        </div>`;
    }

    function renderResult() {
      const s = Store.get();
      const sc = scores(s);
      const ranked = sortedCareers(s);
      box.innerHTML = `
        <div class="quiz-top"><strong>Your results</strong><span>Completed</span></div>
        <div class="progress"><span style="width:100%"></span></div>
        <h2>Your answers lean most towards ${esc(ranked[0].name)}.</h2>
        <div class="options">
          ${ranked
            .map(
              (c) => `<div class="row-career" style="margin:0">
                <span class="career-icon">${c.icon}</span>
                <div><strong>${esc(c.name)}</strong><small>${esc(c.tagline)}</small></div>
                <span class="badge">${scoreLabel(sc[c.family])}</span></div>`
            )
            .join("")}
        </div>
        <p class="footnote">Scores show the share of your answers aligned with each career family. Several paths may suit you.</p>
        <div class="result-actions">
          <a class="btn btn-primary" href="career-matches.html">Explore career matches →</a>
          <button class="btn btn-outline" id="retakeBtn">Retake assessment</button>
        </div>`;
    }

    box.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-opt]");
      if (opt) {
        answers[index] = Number(opt.dataset.opt);
        render();
        return;
      }
      if (e.target.closest("#prevBtn") && index > 0) { index--; render(); }
      if (e.target.closest("#nextBtn") && answers[index] !== undefined) {
        if (index < total - 1) { index++; render(); }
        else {
          Store.update((s) => { s.answers = answers.slice(); s.assessmentDone = true; });
          renderResult();
        }
      }
      if (e.target.closest("#retakeBtn")) {
        answers = [];
        index = 0;
        Store.update((s) => { s.answers = []; s.assessmentDone = false; });
        render();
      }
    });

    if (state.assessmentDone) renderResult();
    else render();
  };

  /* ---------- Career matches ---------- */
  Pages.matches = function () {
    const state = Store.get();
    const list = $("#careerCards");
    list.innerHTML = sortedCareers(state).map((c) => careerCard(c, state)).join("");
    bindSaveButtons(list);

    const empty = $("#noResults");
    $("#searchInput").addEventListener("input", (e) => {
      const term = e.target.value.trim().toLowerCase();
      let visible = 0;
      list.querySelectorAll(".career-card").forEach((card) => {
        const show = card.dataset.name.includes(term);
        card.hidden = !show;
        if (show) visible++;
      });
      empty.hidden = visible > 0;
    });

    if (!state.assessmentDone) $("#assessHint").hidden = false;
  };

  /* ---------- Career detail ---------- */
  Pages.career = function () {
    const id = new URLSearchParams(window.location.search).get("id");
    const c = D.careers.find((x) => x.id === id) || D.careers[0];
    document.title = c.name + " · CareerPath";
    $("#careerName").textContent = c.name;
    $("#careerTagline").textContent = c.tagline;
    $("#careerActivities").textContent = c.activities;
    $("#careerFirstStep").textContent = c.firstStep;
    $("#careerSkills").innerHTML = c.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("");

    const btn = $("#saveDetail");
    const paint = () => {
      const saved = Store.get().saved.includes(c.id);
      btn.textContent = saved ? "♥ Saved" : "♡ Save this career";
      btn.classList.toggle("saved", saved);
    };
    paint();
    btn.addEventListener("click", () => { toggleSave(c.id); paint(); });
  };

  /* ---------- CV analyzer ---------- */
  Pages.cv = function () {
    const select = $("#targetCareer");
    select.innerHTML = D.careers.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
    const top = sortedCareers(Store.get())[0];
    if (Store.get().assessmentDone) select.value = top.id;

    const out = $("#cvReview");

    $("#cvForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = $("#cvText").value.trim();
      if (text.length < 30) {
        toast("Paste a bit more CV text to review.");
        return;
      }
      const career = D.careers.find((c) => c.id === select.value);
      const lower = text.toLowerCase();
      const has = (kw) => new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b", "i").test(lower);

      const found = career.keywords.filter(has);
      const missing = career.keywords.filter((k) => !found.includes(k));
      const numbers = text.match(/\d+([.,]\d+)?\s?%?/g) || [];
      const percentages = numbers.filter((n) => n.includes("%"));

      let impactText;
      if (!numbers.length) {
        impactText = "No numbers found. Add measurable results, such as time saved, volume handled, or improvements achieved.";
      } else if (!percentages.length) {
        impactText = "Numbers found. Consider adding the outcome they led to, for example a percentage of improvement.";
      } else {
        impactText = "Numbers found. Check that they explain meaningful outcomes and include context.";
      }

      const sections = D.cvSections.map((s) => ({ name: s, ok: has(s) }));
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      out.innerHTML = `
        <p class="eyebrow">Your text review</p>
        <h2>${esc(career.name)} · ${found.length} of ${career.keywords.length} keywords found</h2>
        <div class="review-grid">
          <div class="review-box">
            <h3>Skills mentioned</h3>
            ${found.length ? `<div class="chips">${found.map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>`
              : `<p>No target keywords found yet.</p>`}
          </div>
          <div class="review-box">
            <h3>Worth considering</h3>
            ${missing.length ? `<div class="chips">${missing.map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>
              <p>Include these only when they reflect real skills.</p>`
              : `<p>All target keywords are present. Make sure each one is backed by an example.</p>`}
          </div>
          <div class="review-box">
            <h3>Evidence of impact</h3>
            <p style="margin-top:0">${impactText}</p>
          </div>
        </div>
        <div class="review-section">
          <h3>Common section headings</h3>
          <div class="status-list">
            ${sections.map((s) => `<span class="status ${s.ok ? "ok" : "miss"}">${s.ok ? "✓" : "＋"} ${s.name[0].toUpperCase() + s.name.slice(1)}</span>`).join("")}
          </div>
        </div>
        <div class="review-section">
          <h3>Length</h3>
          <p class="disclaimer" style="margin-top:8px">${wordCount} words. ${
            wordCount < 150 ? "A complete one-page CV is usually around 300–600 words." : "This is a reasonable length for a text review."
          }</p>
        </div>`;
      out.hidden = false;
      Store.update((s) => { s.cvReviewed = true; });
      out.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /* ---------- Learning roadmap ---------- */
  Pages.roadmap = function () {
    const list = $("#roadmapList");
    $("#rmTitle").textContent = D.roadmap.title;
    $("#rmSubtitle").textContent = D.roadmap.subtitle;

    function render() {
      const done = Store.get().roadmap;
      const total = D.roadmap.steps.length;
      $("#rmCount").textContent = `${done.length} / ${total} complete`;
      $("#rmBar").style.width = (done.length / total) * 100 + "%";
      list.innerHTML = D.roadmap.steps
        .map((s, i) => {
          const isDone = done.includes(i);
          return `<article class="step-item ${isDone ? "is-done" : ""}">
            <div>
              <span class="num-tag">${String(i + 1).padStart(2, "0")}</span>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.text)}</p>
            </div>
            <button class="btn ${isDone ? "btn-outline" : "btn-primary"}" data-step="${i}">
              ${isDone ? "✓ Complete · Undo" : "Mark complete"}
            </button>
          </article>`;
        })
        .join("");
    }

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-step]");
      if (!btn) return;
      const i = Number(btn.dataset.step);
      Store.update((s) => {
        s.roadmap = s.roadmap.includes(i) ? s.roadmap.filter((x) => x !== i) : [...s.roadmap, i];
      });
      render();
      if (Store.get().roadmap.length === D.roadmap.steps.length) toast("Roadmap complete. Great work!");
    });

    render();
  };

  /* ---------- Saved careers ---------- */
  Pages.saved = function () {
    const list = $("#savedList");
    function render() {
      const state = Store.get();
      const items = D.careers.filter((c) => state.saved.includes(c.id));
      if (!items.length) {
        list.innerHTML = `<div class="card empty">
          <h2>No saved careers yet</h2>
          <p>Save careers from your matches to review them again later.</p>
          <a class="btn btn-primary" href="career-matches.html">Explore career matches →</a>
        </div>`;
        return;
      }
      list.innerHTML = items.map((c) => careerCard(c, state)).join("");
    }
    render();
    bindSaveButtons(list, render);
  };

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    const title = document.body.dataset.title;
    if (document.body.dataset.shell === "app") {
      renderShell(page, title);
    }
    if (Pages[page]) Pages[page]();
  });
})();
