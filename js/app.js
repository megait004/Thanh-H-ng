/* ========= CẤU HÌNH — sửa tên người gửi ở đây nếu muốn ========= */
const CONFIG = {
  herName: "Thanh Hương",
  nickname: "Hương",
  sender: "Mình",
};

const TRACKS = [
  { yt: "erWFtjE257U", title: "Blueming", artist: "IU" },
  { yt: "FGGo8LFmbjs", title: "Someone You Loved", artist: "Lewis Capaldi" },
  { yt: "qIM56IoaL34", title: "The Way I Still Love You", artist: "Reynard Silva" },
  { yt: "y576-ONm5II", title: "Yêu 5", artist: "Rhymastic" },
];

const Q_LABELS = {
  q1: "Buổi tối đi chơi",
  q2: "Giống chú gấu nào",
  q3: "Tin nhắn làm cười",
  q4: "Nhịp tìm hiểu",
  q5: "Tình cảm bắt đầu từ",
  q6: "Khi bị gọi là nhân vật chính",
  q7: "Điều muốn mình biết",
  q8: "Câu hỏi hỏi ngược",
  q9: "Nickname",
  q10: "Điểm hạnh phúc hôm nay",
};

const answers = {};
let pageFlip = null;
let trackIndex = 0;
let wantPlay = false;

function stripVN(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isHerName(value) {
  const n = stripVN(value);
  return n === "thanh huong" || n === "huong" || n === "thanhhuong" || n.includes("thanh huong");
}

/* ===== petals + sparkles ===== */
function spawnPetals() {
  const box = document.getElementById("petals");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 8 + Math.random() * 10 + "s";
    s.style.animationDelay = Math.random() * 8 + "s";
    s.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    box.appendChild(s);
  }
}

function sparkles() {
  const c = document.getElementById("sparkles");
  const ctx = c.getContext("2d");
  const dots = [];
  function resize() {
    c.width = innerWidth;
    c.height = innerHeight;
  }
  resize();
  addEventListener("resize", resize);
  for (let i = 0; i < 70; i++) {
    dots.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random(),
      v: 0.004 + Math.random() * 0.01,
    });
  }
  (function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const d of dots) {
      d.a += d.v;
      ctx.globalAlpha = (Math.sin(d.a) + 1) * 0.35;
      ctx.fillStyle = "#f8e6c8";
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ===== music: YouTube playlist ===== */
function setupMusic() {
  const box = document.getElementById("player");
  const mini = document.getElementById("ytMini");
  const nameEl = document.getElementById("trackName");
  const artistEl = document.getElementById("trackArtist");
  const vinyl = document.getElementById("vinylBtn");
  const playBtn = document.getElementById("playBtn");
  const ytOpen = document.getElementById("ytOpen");
  const tap = document.getElementById("ytTap");
  const needsTap =
    matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;
  let paused = true;

  function watchUrl(i) {
    return "https://www.youtube.com/watch?v=" + TRACKS[i].yt;
  }
  function label() {
    const t = TRACKS[trackIndex];
    nameEl.textContent = t.title;
    artistEl.textContent = t.artist;
    ytOpen.href = watchUrl(trackIndex);
    ytOpen.textContent = "Phát “" + t.title + "” trên YouTube ↗";
  }
  function setUI(on) {
    paused = !on;
    vinyl.classList.toggle("spin", on);
    playBtn.textContent = on ? "❚❚" : "▶";
  }
  function embedSrc(index, autoplay) {
    const ids = TRACKS.map((t) => t.yt);
    const ordered = ids.slice(index).concat(ids.slice(0, index));
    const q = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: "0",
      rel: "0",
      playsinline: "1",
      loop: "1",
      playlist: ordered.join(","),
      enablejsapi: "1",
      origin: location.origin,
    });
    return "https://www.youtube.com/embed/" + TRACKS[index].yt + "?" + q.toString();
  }
  function mount(index, autoplay) {
    trackIndex = (index + TRACKS.length) % TRACKS.length;
    label();
    mini.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.id = "ytFrame";
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.setAttribute("allowfullscreen", "");
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen; web-share";
    iframe.src = embedSrc(trackIndex, autoplay);
    mini.appendChild(iframe);
    setUI(autoplay);
  }
  function ytCmd(fn) {
    const iframe = document.getElementById("ytFrame");
    if (!iframe || !iframe.contentWindow) return false;
    iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: fn, args: [] }), "*");
    return true;
  }
  function play(fromTap) {
    wantPlay = true;
    box.hidden = false;
    if (needsTap && !fromTap) {
      tap.hidden = false;
      box.classList.add("await-tap");
      mount(trackIndex, true);
      return;
    }
    tap.hidden = true;
    box.classList.remove("await-tap");
    mount(trackIndex, true);
  }
  function pause() {
    wantPlay = false;
    ytCmd("pauseVideo");
    setUI(false);
  }

  label();
  tap.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    play(true);
  });
  vinyl.addEventListener("click", () => (paused ? play(true) : pause()));
  playBtn.addEventListener("click", () => (paused ? play(true) : pause()));
  document.getElementById("prevTrack").addEventListener("click", () => {
    wantPlay = true;
    tap.hidden = true;
    box.classList.remove("await-tap");
    mount(trackIndex - 1, true);
  });
  document.getElementById("nextTrack").addEventListener("click", () => {
    wantPlay = true;
    tap.hidden = true;
    box.classList.remove("await-tap");
    mount(trackIndex + 1, true);
  });
  document.getElementById("shuffleBtn").addEventListener("click", () => {
    wantPlay = true;
    tap.hidden = true;
    box.classList.remove("await-tap");
    let n = trackIndex;
    while (TRACKS.length > 1 && n === trackIndex) n = Math.floor(Math.random() * TRACKS.length);
    mount(n, true);
  });

  return { play, pause };
}
const music = setupMusic();

/* ===== intro gate ===== */
const intro = document.getElementById("intro");
const app = document.getElementById("app");
const envelope = document.getElementById("envelope");
const envelopeStage = document.getElementById("envelopeStage");
const nameGate = document.getElementById("nameGate");
const gateHint = document.getElementById("gateHint");

nameGate.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("herName").value;
  if (!isHerName(val)) {
    gateHint.textContent = "Hmm… thử tên đầy đủ của cậu xem. Có dấu cũng được.";
    nameGate.classList.add("shake");
    setTimeout(() => nameGate.classList.remove("shake"), 400);
    return;
  }
  gateHint.textContent = "";
  nameGate.hidden = true;
  document.getElementById("introTitle").textContent = "Một phong bì cho cậu";
  document.getElementById("whisper").textContent = "Đúng rồi, bà ơi.";
  document.querySelector(".intro-sub").textContent = "Bên trong là một cuốn sách nhỏ.";
  envelopeStage.hidden = false;
  music.play();
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#ytTap, #player")) return;
  if (!e.target.closest("#envelope, #envelopeStage")) return;
  if (envelopeStage.hidden || envelope.classList.contains("open")) return;
  envelope.classList.add("open");
  const tap = document.getElementById("ytTap");
  if (tap && !tap.hidden) music.play(true);
  setTimeout(openBook, 1200);
});

let bookOpened = false;
function openBook() {
  if (bookOpened) return;
  bookOpened = true;
  intro.hidden = true;
  app.hidden = false;
  document.getElementById("player").hidden = false;
  setTimeout(initBook, 80);
}

/* ===== book ===== */
function initBook() {
  const el = document.getElementById("book");
  pageFlip = new St.PageFlip(el, {
    width: 420,
    height: 600,
    size: "stretch",
    minWidth: 280,
    maxWidth: 520,
    minHeight: 380,
    maxHeight: 720,
    showCover: true,
    drawShadow: true,
    maxShadowOpacity: 0.5,
    flippingTime: 900,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    mobileScrollSupport: true,
    swipeDistance: 25,
    clickEventForward: true,
    useMouseEvents: true,
    showPageCorners: true,
    disableFlipByClick: true,
  });
  pageFlip.loadFromHTML(document.querySelectorAll("#book .page"));
  pageFlip.on("flip", (e) => updateChrome(e.data));
  pageFlip.on("init", (e) => updateChrome(e.data.page));

  document.getElementById("prevBtn").addEventListener("click", () => pageFlip.flipPrev());
  document.getElementById("nextBtn").addEventListener("click", () => pageFlip.flipNext());
  addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") pageFlip.flipNext();
    if (ev.key === "ArrowLeft") pageFlip.flipPrev();
  });

  // don't start a flip when typing in the book
  el.addEventListener("mousedown", stopIfForm, true);
  el.addEventListener("touchstart", stopIfForm, true);
}

function stopIfForm(ev) {
  const t = ev.target;
  if (t.closest("button, input, textarea, label, a, pre")) ev.stopPropagation();
}

function updateChrome(page) {
  const total = pageFlip.getPageCount();
  const names = [
    "Bìa sách",
    "Lời ngỏ",
    "Happy Birthday",
    "Khung hình I",
    "Nụ cười",
    "Khung hình II",
    "Đứng hình",
    "Khung hình III",
    "Áo ren",
    "Lá thư",
    "Thả thính",
    "Trò chơi",
    "Câu đố 1–2",
    "Câu đố 3–4",
    "Câu đố 5–6",
    "Cậu kể",
    "Gửi lại mình",
    "Tuổi mới",
    "Chương tiếp",
    "Bìa sau",
  ];
  document.getElementById("pageIndicator").textContent = names[page] || `Trang ${page + 1}`;
  document.getElementById("prevBtn").disabled = page <= 0;
  document.getElementById("nextBtn").disabled = page >= total - 1;
  if (page >= 16) renderAnswers();
}

/* ===== quiz ===== */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".opts button");
  if (!btn) return;
  const q = btn.closest(".q");
  q.querySelectorAll("button").forEach((b) => b.classList.remove("picked"));
  btn.classList.add("picked");
  answers[q.dataset.q] = btn.dataset.v;
  renderAnswers();
});

["q7", "q8", "q9"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => {
    answers[id] = e.target.value.trim();
    renderAnswers();
  });
});
const range = document.getElementById("q10");
const rangeVal = document.querySelector(".range-val");
range.addEventListener("input", () => {
  rangeVal.textContent = range.value + " / 10";
  answers.q10 = range.value + "/10";
  renderAnswers();
});
answers.q10 = "8/10";

function renderAnswers() {
  const lines = [];
  lines.push("Lá thư trả lời của cậu");
  lines.push(`Gửi ${CONFIG.sender},`);
  lines.push("");
  for (const [k, label] of Object.entries(Q_LABELS)) {
    const v = answers[k];
    if (v) lines.push(`• ${label}: ${v}`);
  }
  if (lines.length <= 3) {
    document.getElementById("answerSheet").textContent =
      "Chưa có câu trả lời… cậu lật lại vài trang trước nhé.";
    return;
  }
  lines.push("");
  lines.push("P/s: mình đã đọc cuốn sách. Và… có thể đang đỏ mặt.");
  document.getElementById("answerSheet").textContent = lines.join("\n");
}

document.getElementById("copyAnswers").addEventListener("click", async () => {
  renderAnswers();
  const text = document.getElementById("answerSheet").textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const ok = document.getElementById("copyOk");
  ok.hidden = false;
  setTimeout(() => (ok.hidden = true), 2500);
});

/* click hearts */
document.addEventListener("click", (e) => {
  if (e.target.closest("button, input, textarea, a")) return;
  const h = document.createElement("span");
  h.textContent = "♡";
  h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;color:#e8b4b8;pointer-events:none;z-index:20;font-size:18px;transform:translate(-50%,-50%);transition:1s ease;`;
  document.body.appendChild(h);
  requestAnimationFrame(() => {
    h.style.top = e.clientY - 60 + "px";
    h.style.opacity = "0";
  });
  setTimeout(() => h.remove(), 1000);
});

spawnPetals();
sparkles();
document.getElementById("herName").focus();
