let USER = JSON.parse(localStorage.getItem("weight_user") || "null");
const API = "";
const $ = s => document.querySelector(s);
const app = $("#app");
let toastTimer;
function toast(msg, type) {
  let el = $("#toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = "toast show " + (type || "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
}
async function api(path, opts = {}) {
  const hasBody = opts.body !== undefined;
  const fetchOpts = { headers: { "Content-Type": "application/json" }, ...opts };
  if (hasBody) { fetchOpts.body = JSON.stringify(opts.body); fetchOpts.method = fetchOpts.method || "POST"; }
  const res = await fetch(API + path, fetchOpts);
  return res.json();
}
function renderAuth() {
  app.innerHTML = '<div class="auth-page"><div class="app-icon">🍏</div><h1>轻<span>食</span></h1><p class="subtitle">减肥监督打卡<br>每天进步一点点</p><div class="auth-tabs"><button class="auth-tab active" data-tab="login">登录</button><button class="auth-tab" data-tab="register">注册</button></div><form class="auth-form" id="authForm"><div id="authFields"></div><button type="submit" class="btn btn-primary" id="authSubmit">登录</button></form></div>';
  let t = "login";
  app.querySelectorAll(".auth-tab").forEach(tab => { tab.addEventListener("click", () => { t = tab.dataset.tab; app.querySelectorAll(".auth-tab").forEach(x => x.classList.remove("active")); tab.classList.add("active"); uf(t); }); });
  function uf(tab) {
    const f = $("#authFields"), s = $("#authSubmit");
    if (tab === "login") { f.innerHTML = '<div class="field"><label>用户名</label><input type="text" name="name" placeholder="输入你的用户名" required></div><div class="field"><label>密码</label><input type="password" name="password" placeholder="输入密码" required></div>'; s.textContent = "登录"; }
    else { f.innerHTML = '<div class="field"><label>用户名</label><input type="text" name="name" placeholder="给自己起个名字" required></div><div class="field"><label>密码</label><input type="password" name="password" placeholder="设置密码" required></div><div class="row"><div class="field"><label>起始体重 (kg)</label><input type="number" name="startWeight" step="0.1" placeholder="例如 70"></div><div class="field"><label>目标体重 (kg)</label><input type="number" name="targetWeight" step="0.1" placeholder="例如 60"></div></div>'; s.textContent = "注册"; }
  }
  uf("login");
  $("#authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries()), btn = $("#authSubmit"); btn.disabled = true;
    btn.textContent = t === "login" ? "登录中…" : "注册中…";
    try {
      const p = t === "login" ? "/api/login" : "/api/register", res = await api(p, { body: data });
      if (res.error) { toast(res.error, "error"); btn.disabled = false; btn.textContent = t === "login" ? "登录" : "注册"; return; }
      USER = res.user; localStorage.setItem("weight_user", JSON.stringify(USER)); renderApp();
    } catch(e) { toast("网络错误", "error"); btn.disabled = false; btn.textContent = t === "login" ? "登录" : "注册"; }
  });
}
const NAV = [
  {id:"dash",label:"首页",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},
  {id:"checkin",label:"打卡",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},
  {id:"progress",label:"进度",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'},
  {id:"friends",label:"好友",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},
  {id:"rewards",label:"奖励",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},
  {id:"tutorials",label:"教程",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'}
];
function renderApp() {
  if (!USER) { renderAuth(); return; }
  app.innerHTML = '<div class="page active" id="page-dash"></div><div class="page" id="page-checkin"></div><div class="page" id="page-progress"></div><div class="page" id="page-friends"></div><div class="page" id="page-rewards"></div><div class="page" id="page-tutorials"></div><nav class="nav" id="bottomNav">' + NAV.map((item,i) => '<button class="nav-item ' + (i===0?"active":"") + '" data-page="' + item.id + '">' + item.icon + '<span>' + item.label + '</span></button>').join("") + '</nav>';
  app.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      app.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      app.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      const pg = $("#page-" + item.dataset.page);
      if (pg) pg.classList.add("active");
      loadPage(item.dataset.page);
    });
  });
  loadPage("dash");
}
function loadPage(id) { const fn = "render" + id.charAt(0).toUpperCase() + id.slice(1); if (window[fn]) window[fn](); }
async function renderDash() {
  const el = $("#page-dash"); el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  try {
    const [checkins, feed] = await Promise.all([api("/api/checkins/" + USER.id), api("/api/feed/" + USER.id)]);
    const user = await api("/api/user/" + USER.id), today = new Date().toISOString().slice(0,10);
    const ct = checkins.find(c => c.date === today), streak = user.streak || 0, lw = checkins.length > 0 ? checkins[0].weight : user.startWeight;
    const lost = user.startWeight && lw ? Math.max(0,(user.startWeight - lw).toFixed(1)) : 0;
    const pct = user.startWeight && user.targetWeight ? Math.min(100,Math.max(0,((user.startWeight-(lw||user.startWeight))/(user.startWeight-user.targetWeight))*100)).toFixed(0) : 0;
    const recent = Array.isArray(feed) ? feed.slice(0,10) : [];
    el.innerHTML = '<div class="dash-header"><h2>Hi, ' + user.name + ' 👋</h2><span class="date">' + new Date().toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long"}) + '</span></div>'
      + '<div class="streak-card"><div class="streak-number">' + streak + '</div><div class="streak-label">连续打卡天数</div>'
      + (ct ? '<div class="checkin-btn done">✅ 今日已打卡</div>' : '<button class="checkin-btn" onclick="goCheckin()">💭 立即打卡</button>')
      + '</div><div class="stats-grid">'
      + '<div class="stat-card"><div class="label">当前体重</div><div class="value">' + (lw || "-") + ' <span class="unit">kg</span></div></div>'
      + '<div class="stat-card"><div class="label">已减</div><div class="value">' + lost + ' <span class="unit">kg</span></div></div>'
      + '<div class="stat-card"><div class="label">目标体重</div><div class="value">' + (user.targetWeight || "-") + ' <span class="unit">kg</span></div></div>'
      + '<div class="stat-card"><div class="label">完成进度</div><div class="value">' + pct + ' <span class="unit">%</span></div></div>'
      + '</div><div class="section-title">好友动态 <span class="more">最近打卡</span></div>'
      + (recent.length > 0 ? '<ul class="feed-list">' + recent.map(f => '<li class="feed-item"><div class="avatar">' + (f.userName ? f.userName[0] : "?") + '</div><div class="info"><div class="name">' + (f.userName||"未知") + '</div><div class="detail">' + f.date + (f.weight ? " · " + f.weight + " kg" : "") + (f.note ? " · " + f.note : "") + '</div></div><span class="badge">✅</span></li>').join("") + '</ul>' : '<div class="empty-state"><div class="emoji">💬</div><p>还没有好友动态</p></div>');
  } catch(e) { el.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>加载失败</p></div>'; }
}
window.goCheckin = function() {
  app.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  app.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const nav = app.querySelector('[data-page="checkin"]'); if (nav) nav.classList.add("active");
  const pg = $("#page-checkin"); if (pg) pg.classList.add("active");
  renderCheckin();
};
async function renderCheckin() {
  const el = $("#page-checkin"); el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  try {
    const checkins = await api("/api/checkins/" + USER.id), today = new Date().toISOString().slice(0,10);
    const ct = checkins.find(c => c.date === today), user = await api("/api/user/" + USER.id);
    const y = new Date().getFullYear(), m = new Date().getMonth(), fd = new Date(y,m,1).getDay(), dim = new Date(y,m+1,0).getDate();
    const dates = new Set(checkins.map(c => c.date));
    let cal = ""; ["日","一","二","三","四","五","六"].forEach(d => { cal += '<div class="day-label">' + d + "</div>"; });
    for (let i=0; i<fd; i++) cal += '<div class="day empty"></div>';
    for (let d=1; d<=dim; d++) {
      const ds = y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0"), isT = ds === today;
      let cls = "day"; if (ds > today) cls += " future"; else if (dates.has(ds) && isT) cls += " checked today"; else if (dates.has(ds)) cls += " checked"; else if (isT) cls += " today";
      cal += '<div class="' + cls + '">' + d + "</div>";
    }
    el.innerHTML = '<div class="checkin-page"><h2>💭 每日打卡</h2><p class="desc">记录今天的体重和心情</p>'
      + (ct ? '<div class="checkin-card" style="text-align:center"><div class="emoji-big">🎉</div><h3>今日已打卡！</h3><p style="color:var(--text-secondary)">' + (ct.weight ? "体重：" + ct.weight + " kg" : "") + (ct.note ? "<br>" + ct.note : "") + '</p><div style="margin-top:12px;font-size:12px;color:var(--text-muted)">连续打卡 ' + (user.streak||0) + " 天</div></div>"
        : '<div class="checkin-card"><div class="emoji-big">💪</div><div class="field"><label>今日体重 (kg)</label><input type="number" step="0.1" id="weightInput" placeholder="可选"></div><div class="field"><label>备注</label><textarea id="noteInput" placeholder="今天吃了什么？运动了多久？"></textarea></div><div id="videoRecorderContainer"></div><button class="btn btn-primary" id="doCheckin">✅ 打卡</button></div>')
      + '<div class="checkin-card"><label>' + y + "年" + (m+1) + '月打卡日历</label><div class="calendar">' + cal + "</div></div></div>";
    const btn = $("#doCheckin");
    if (btn) {
      btn.addEventListener("click", async () => {
        const w = $("#weightInput").value, n = $("#noteInput").value; btn.disabled = true; btn.textContent = "打卡中…";
        const res = await api("/api/checkin", { body: { userId: USER.id, weight: w, note: n } });
        if (res.error) { toast(res.error, "error"); btn.disabled = false; btn.innerHTML = "✅ 打卡"; return; }
        if (res.success) { USER.streak = res.streak; localStorage.setItem("weight_user",JSON.stringify(USER)); toast("打卡成功！连续 " + res.streak + " 天","success"); renderCheckin(); if (w) checkRewards(w); }
      });
    }
    const vc = document.getElementById("videoRecorderContainer"); if (vc) renderVideoRecorder(vc);
  } catch(e) { el.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>加载失败</p></div>'; }
}
async function renderProgress() {
  const el = $("#page-progress"); el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  try {
    const checkins = await api("/api/checkins/" + USER.id), user = await api("/api/user/" + USER.id), rewards = await api("/api/rewards/" + USER.id);
    const records = checkins.filter(c => c.weight > 0).slice(0,30).reverse();
    const maxW = Math.max(...records.map(r => r.weight), user.startWeight || 70), minW = Math.min(...records.map(r => r.weight), user.targetWeight || 50), range = maxW - minW || 1;
    let chart = "";
    records.forEach(r => { const h = ((maxW - r.weight) / range * 100); chart += '<div class="bar-wrap"><div class="bar" style="height:' + Math.max(h,5) + '%"><div class="bar-value">' + r.weight + '</div></div><div class="bar-label">' + r.date.slice(5) + '</div></div>'; });
    const ms = Array.isArray(rewards) ? rewards : [], cw = records.length > 0 ? records[records.length-1].weight : user.startWeight;
    el.innerHTML = '<div class="progress-page"><h2>📈 体重趋势</h2><p class="desc">' + (records.length > 0 ? "最近 " + records.length + " 次记录" : "还没有体重记录") + '</p><div class="chart-container"><h3>⚖️ 体重变化</h3>'
      + (records.length > 0 ? '<div class="chart">' + chart + '</div>' : '<div class="empty-state"><p>暂无数据</p></div>')
      + '</div><div class="section-title">我的里程碑</div>'
      + (ms.length > 0 ? '<ul class="milestone-list">' + ms.map(m => { const u = cw && m.milestoneWeight && cw <= m.milestoneWeight; return '<li class="milestone-item"><div class="icon ' + (u?"unlocked":"") + '">' + (u?"🏆":"🏷") + '</div><div class="info"><div class="name">' + m.name + '</div><div class="detail">' + (m.milestoneWeight ? "目标体重 ≤ " + m.milestoneWeight + " kg" : "") + '</div></div><span class="status ' + (u?"done":"") + '">' + (u?"✅ 已达成":"进行中") + '</span></li>'; }).join("") + '</ul>' : '<div class="empty-state"><div class="emoji">🏆</div><p>去奖励页设置里程碑</p></div>') + '</div>';
  } catch(e) { el.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>加载失败</p></div>'; }
}
async function renderFriends() {
  const el = $("#page-friends"); el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  try {
    const [friends, lb] = await Promise.all([api("/api/friends/" + USER.id), api("/api/leaderboard")]), rk = ["gold","silver","bronze"], today = new Date().toISOString().slice(0,10);
    el.innerHTML = '<div class="friends-page"><h2>👥 好友监督</h2><p class="desc">和好友互相监督</p><div class="add-friend"><input type="text" id="friendName" placeholder="输入好友的用户名"><button id="addFriendBtn">添加好友</button></div><div class="section-title">我的好友（' + friends.length + "）</div>"
      + (friends.length > 0 ? '<ul class="friend-list">' + friends.map(f => '<li class="friend-card"><div class="avatar">' + (f.name?f.name[0]:"?") + '</div><div class="info"><div class="name">' + f.name + '</div><div class="status">' + (f.lastCheckin===today?"今日已打卡":"最近打卡：" + (f.lastCheckin||"暂无")) + '</div></div><span class="badge ' + (f.lastCheckin===today?"":"offline") + '">' + (f.lastCheckin===today?"🔥 活跃":"😴 离线") + '</span></li>').join("") + '</ul>' : '<div class="empty-state"><div class="emoji">👤</div><p>还没有好友</p></div>')
      + '<div class="leaderboard"><h3>🏆 打卡排行榜</h3>'
      + (Array.isArray(lb) && lb.length > 0 ? lb.slice(0,20).map((u,i) => '<div class="lb-item"><div class="rank ' + (i<3?rk[i]:"") + '">' + (i+1) + '</div><span class="name">' + u.name + (u.id===USER.id?" (你)":"") + '</span><span class="streak">' + (u.streak||0) + " 天</span></div>").join("") : '<div class="empty-state"><p>暂无排名</p></div>') + '</div></div>';
    $("#addFriendBtn").addEventListener("click", async () => {
      const name = $("#friendName").value.trim(); if (!name) { toast("请输入用户名","error"); return; }
      const btn = $("#addFriendBtn"); btn.disabled = true;
      const res = await api("/api/friends/add", { body: { userId: USER.id, friendName: name } });
      if (res.error) { toast(res.error,"error"); btn.disabled = false; return; }
      toast("添加成功！","success"); renderFriends();
    });
    $("#friendName").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#addFriendBtn").click(); });
  } catch(e) { el.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>加载失败</p></div>'; }
}
async function renderRewards() {
  const el = $("#page-rewards"); el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  try {
    const rewards = await api("/api/rewards/" + USER.id), user = await api("/api/user/" + USER.id), checkins = await api("/api/checkins/" + USER.id);
    const lw = checkins.filter(c => c.weight > 0), cw = lw.length > 0 ? lw[0].weight : user.startWeight;
    const list = (Array.isArray(rewards) ? rewards : []).map(r => { return { ...r, unlocked: cw && r.milestoneWeight && cw <= r.milestoneWeight }; });
    const uc = list.filter(r => r.unlocked).length;
    el.innerHTML = '<div class="rewards-page"><h2>🏆 奖励</h2><p class="desc">设置里程碑，达成时奖励自己</p><div class="add-reward"><input type="text" id="rewardName" placeholder="奖励名称"><input type="number" step="0.1" id="rewardWeight" placeholder="目标体重 (kg)"><button class="btn-add" id="addRewardBtn">添加</button></div><div class="section-title">我的奖励（' + uc + "/" + list.length + " 已解锁）</div>"
      + (list.length > 0 ? '<ul class="reward-list">' + list.map(r => '<li class="reward-card ' + (r.unlocked?"unlocked":"") + '"><div class="icon">' + (r.unlocked?"🏆":"🔒") + '</div><div class="info"><div class="name">' + r.name + '</div><div class="detail">' + (r.milestoneWeight ? "体重 ≤ " + r.milestoneWeight + " kg" : "无目标") + '</div></div><div class="actions"><button class="danger" onclick="deleteReward(\'' + r.id + '\')">🗑</button></div></li>').join("") + '</ul>' : '<div class="empty-state"><div class="emoji">🏆</div><p>还没有设置奖励</p></div>') + '</div>';
    if (uc > 0 && !el.dataset.celebrated) { el.dataset.celebrated = "true"; showConfetti(); }
    $("#addRewardBtn").addEventListener("click", async () => {
      const name = $("#rewardName").value.trim(), w = $("#rewardWeight").value;
      if (!name) { toast("请输入奖励名称","error"); return; }
      const res = await api("/api/rewards", { body: { userId: USER.id, name, milestoneWeight: w } });
      if (res.error) { toast(res.error,"error"); return; }
      toast("奖励添加成功！","success"); renderRewards();
    });
  } catch(e) { el.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>加载失败</p></div>'; }
}
window.deleteReward = async function(id) { await api("/api/rewards/" + id, { method: "DELETE" }); renderRewards(); };
async function checkRewards(weight) {
  if (!weight) return;
  const r = await api("/api/rewards/" + USER.id);
  if (!Array.isArray(r)) return;
  const nu = r.filter(x => x.milestoneWeight && Number(weight) <= x.milestoneWeight);
  if (nu.length > 0) { showConfetti(); setTimeout(() => toast("🏆 解锁了新奖励！","success"), 500); }
}
const EXERCISES = [
  {id:"run",name:"跑步",icon:"🏃",cat:"cardio",target:"全身",diff:"初级",desc:"原地或户外慢跑，保持匀速呼吸。步频约每分钟170步，落地轻盈。",benefit:"提升心肺功能、燃脂效果好",tips:"初学者从15分钟开始",reps:"20-40分钟"},
  {id:"jacks",name:"开合跳",icon:"🤟",cat:"cardio",target:"全身",diff:"初级",desc:"站立双脚并拢，跳起同时双手举过头顶并张开双脚。落地时膝盖微曲。",benefit:"全身燃脂、提高心率",tips:"落地时前脚掌先着地",reps:"3组 x 20次"},
  {id:"burpee",name:"波比跳",icon:"💥",cat:"cardio",target:"全身",diff:"高级",desc:"下蹲→双手撑地→双脚向后跳→收回→跳起。",benefit:"全身燃脂王者",tips:"可减掉俯卧撑部分",reps:"3组 x 10次"},
  {id:"rope",name:"跳绳",icon:"⛹️",cat:"cardio",target:"全身",diff:"中级",desc:"手握跳绳，手腕发力甩绳，双脚轻轻跳起过绳。",benefit:"高效燃脂、协调性",tips:"双脚交替跳更省力",reps:"3组 x 1分钟"},
  {id:"pushup",name:"俯卧撑",icon:"💪",cat:"strength",target:"胸部/手臂",diff:"中级",desc:"双手略宽于肩，身体成直线，下降时胸部贴近地面。",benefit:"胸肌、肱三头肌",tips:"可从跪姿开始",reps:"4组 x 12次"},
  {id:"squat",name:"深蹲",icon:"🏋️",cat:"strength",target:"大腿/臀部",diff:"初级",desc:"双脚与肩同宽，臀部向后坐，膝盖不超过脚尖。",benefit:"臀腿力量",tips:"保持背部挺直",reps:"4组 x 15次"},
  {id:"lunge",name:"箭步蹲",icon:"🧍",cat:"strength",target:"腿部/臀部",diff:"初级",desc:"向前跨一大步，双膝弯曲90度，后膝接近地面。",benefit:"单腿力量、平衡",tips:"上身保持挺直",reps:"3组 x 12次每侧"},
  {id:"plank",name:"平板支撑",icon:"💪‍♀️",cat:"strength",target:"核心",diff:"初级",desc:"前臂撑地，身体成一条直线，核心收紧。",benefit:"核心力量、腰背稳定",tips:"不要塌腰",reps:"3组 x 30-60秒"},
  {id:"climber",name:"登山跑",icon:"🧘",cat:"cardio",target:"核心/全身",diff:"中级",desc:"平板姿势，交替将膝盖向胸口提拉。",benefit:"核心燃脂",tips:"保证动作标准",reps:"3组 x 30秒"},
  {id:"deadbug",name:"死虫式",icon:"🐜",cat:"strength",target:"核心",diff:"初级",desc:"仰卧，对侧手脚同时缓慢放下再收回。",benefit:"深层核心",tips:"下背部紧贴地面",reps:"3组 x 10次每侧"},
  {id:"stretch1",name:"大腿前侧拉伸",icon:"🧘‍♂️",cat:"stretch",target:"大腿",diff:"初级",desc:"站立弯曲膝盖，手抓脚踝向臀部拉。",benefit:"放松股四头肌",tips:"保持站立腿微曲",reps:"两侧各30秒"},
  {id:"catcow",name:"猫牛式",icon:"🐱",cat:"stretch",target:"背部/脊柱",diff:"初级",desc:"四足跪姿，吸气塌腰抬头，呼气拱背低头。",benefit:"脊柱灵活性",tips:"配合呼吸缓慢进行",reps:"10次一组"},
  {id:"child",name:"婴儿式",icon:"🧘",cat:"stretch",target:"背部",diff:"初级",desc:"跪姿臀部坐向脚跟，身体前屈贴地。",benefit:"放松背部",tips:"深呼吸保持1分钟",reps:"保持1分钟"},
];
const CATS = {all:"全部",cardio:"🏃 有氧",strength:"💪 力量",stretch:"🧘 拉伸"};

async function renderTutorials() {
  const el = $("#page-tutorials");
  let cat = "all";
  function render() {
    const filtered = cat === "all" ? EXERCISES : EXERCISES.filter(e => e.cat === cat);
    el.innerHTML = '<div class="tutorials-page"><h2>📚 健身教程</h2><p class="desc">标准动作指南 + 在线视频教程</p>'
      + '<div class="tutorial-categories">' + Object.entries(CATS).map(([k,v]) => '<button class="cat-btn ' + (k===cat?"active":"") + '" data-cat="' + k + '">' + v + '</button>').join("") + '</div>'
      + '<div class="exercise-grid">' + filtered.map(ex => '<div class="exercise-card" data-id="' + ex.id + '"><div class="ex-icon">' + ex.icon + '</div><div class="ex-name">' + ex.name + '</div><div class="ex-meta"><span>' + ex.target + '</span><span>' + ex.diff + '</span></div></div>').join("") + '</div>'
      + '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">'
      + '<h3 style="font-size:15px;font-weight:600;margin-bottom:10px">🎥 视频教程</h3>'
      + '<div style="display:flex;gap:8px;margin-bottom:12px">'
      + '<button class="cat-btn active" id="pltBili" data-platform="bilibili">📺 B站</button>'
      + '<button class="cat-btn" id="pltDm" data-platform="dailymotion">🌍 Dailymotion</button>'
      + '</div>'
      + '<div class="video-search-box"><input type="text" id="videoSearchInput" placeholder="搜索健身视频"><button id="videoSearchBtn">🔍 搜索</button></div>'
      + '<div class="tutorial-categories" id="videoQuickSearch">' + ["健身","减肥","增肌","瑜伽","拉伸","HIIT","腹肌"].map(v => '<button class="cat-btn">' + v + '</button>').join("") + '</div>'
      + '<div id="videoResults"><div class="empty-state"><div class="emoji">🎥</div><p>选择平台输入关键词搜索</p></div></div>'
      + '</div></div>';
    el.querySelectorAll(".cat-btn").forEach(b => b.addEventListener("click", () => { cat = b.dataset.cat; render(); }));
    el.querySelectorAll(".exercise-card").forEach(c => c.addEventListener("click", () => showExercise(c.dataset.id)));
    el.querySelectorAll("#videoQuickSearch .cat-btn").forEach(b => b.addEventListener("click", () => { var inp = document.getElementById("videoSearchInput"); if(inp) { inp.value = b.textContent; doVideoSearch(); } }));
    var sBtn = document.getElementById("videoSearchBtn");
    var sInp = document.getElementById("videoSearchInput");
    var pltBili = document.getElementById("pltBili");
    var pltDm = document.getElementById("pltDm");
    if(sBtn) sBtn.addEventListener("click", doVideoSearch);
    if(sInp) sInp.addEventListener("keydown", function(e){ if(e.key==="Enter") doVideoSearch(); });
    if(pltBili) pltBili.addEventListener("click", function(){ pltBili.classList.add("active"); if(pltDm) pltDm.classList.remove("active"); window.videoPlatform = "bilibili"; });
    if(pltDm) pltDm.addEventListener("click", function(){ pltDm.classList.add("active"); if(pltBili) pltBili.classList.remove("active"); window.videoPlatform = "dailymotion"; });
    window.videoPlatform = "bilibili";
  }
  render();
}
function showExercise(id) {
  var ex = EXERCISES.find(function(e){ return e.id===id; });
  if(!ex) return;
  var old = document.querySelector(".exercise-detail"); if(old) old.remove();
  var div = document.createElement("div"); div.className = "exercise-detail open";
  div.innerHTML = '<div class="panel" onclick="event.stopPropagation()"><div class="handle"></div><div class="ex-icon-big">' + ex.icon + '</div><div class="ex-name-big">' + ex.name + '</div><div class="ex-tags"><span>' + (CATS[ex.cat]||ex.cat) + '</span><span>' + ex.target + '</span><span>' + ex.diff + '</span></div><div class="ex-section"><h4>📝 动作要领</h4><p>' + (ex.desc||"") + '</p></div><div class="ex-section"><h4>✨ 训练效果</h4><p>' + (ex.benefit||"") + '</p></div><div class="ex-section"><h4>💡 建议组数</h4><p>' + (ex.reps||"") + '</p></div><div class="ex-section"><div class="tip">💡 ' + (ex.tips||"") + '</div></div><button class="close-btn" onclick="this.closest(\'.exercise-detail\').remove()">✖ 关闭</button></div>';
  div.addEventListener("click", function(e){ if(e.target===div) div.remove(); });
  document.body.appendChild(div);
}

function searchBilibiliJSONP(keyword) {
  return new Promise(function(resolve, reject) {
    var cb = "bili_cb_" + Date.now();
    window[cb] = function(data) { resolve(data); delete window[cb]; };
    var s = document.createElement("script");
    s.src = "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=" + encodeURIComponent(keyword) + "&callback=" + cb;
    s.onerror = function() { reject(new Error("JSONP failed")); delete window[cb]; };
    document.body.appendChild(s);
  });
}
async function doVideoSearch() {
  var inp = document.getElementById("videoSearchInput");
  if(!inp) return; var q = inp.value.trim();
  if(!q) { toast("请输入搜索关键词","error"); return; }
  var res = document.getElementById("videoResults"); if(!res) return;
  res.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  var platform = window.videoPlatform || "bilibili";
  if(platform === "bilibili") {
    try {
      var data = null; try { var r1 = await fetch("/api/videos/bilibili?q=" + encodeURIComponent(q)); if(r1.ok) data = await r1.json(); } catch(e){} if(!data || !data.data) { try { var r2 = await fetch("https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=" + encodeURIComponent(q) + "&page=1&order=click", { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.bilibili.com/" }, mode: "cors" }); data = await r2.json(); } catch(e2){} } if(!data || !data.data) { try { data = await searchBilibiliJSONP(q); } catch(e3){} }
      // fixed
      if(data && data.code === 0 && data.data && data.data.result) {
        var vids = data.data.result.filter(function(v){ return v.type === "video"; });
        if(vids.length===0){ res.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>没有找到相关视频</p></div>'; return; }
        res.innerHTML = '<div class="video-grid">' + vids.map(function(v){
          return '<div class="video-card" data-bvid="'+(v.bvid||"")+'" data-aid="'+(v.aid||"")+'" data-title="'+(v.title||"").replace(/<[^>]*>/g,"").replace(/"/g,"&quot;")+'" data-author="'+(v.author||"")+'"><div class="thumb-wrap"><img src="'+(v.pic||"")+'" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\"play-badge\\\">▶</div>\'"><div class="play-badge">▶</div><div class="duration">'+(v.duration||"")+'</div></div><div class="video-info"><div class="vtitle">'+(v.title||"").replace(/<[^>]*>/g,"")+'</div><div class="vauthor">'+(v.author||"")+'</div></div></div>';
        }).join("") + '</div><div style="text-align:center;margin-top:8px;font-size:11px;color:var(--text-muted)">来源: Bilibili</div>';
        res.querySelectorAll(".video-card").forEach(function(c){ c.addEventListener("click",function(){ playBilibili(c.dataset.bvid, c.dataset.aid, c.dataset.title, c.dataset.author); }); });
      } else {
        res.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>B站搜索失败，尝试切换Dailymotion</p></div>';
      }
    } catch(e) {
      res.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>B站API受限，尝试切换Dailymotion</p></div>';
    }
  } else {
    try {
      var dmData = null; try { var rd1 = await fetch("/api/videos/search?q=" + encodeURIComponent(q)); if(rd1.ok) dmData = await rd1.json(); } catch(e){} if(!dmData || !dmData.list) { try { var rd2 = await fetch("https://api.dailymotion.com/videos?fields=id,title,thumbnail_360_url,url,owner.username,duration&search=" + encodeURIComponent(q) + "&limit=20&sort=relevance"); dmData = await rd2.json(); } catch(e2){} }
      if(!dmData || !dmData.list || dmData.list.length===0) { res.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>没有找到相关视频</p></div>'; return; }
      var vids2 = dmData.list;
      res.innerHTML = '<div class="video-grid">' + vids2.map(function(v){
        return '<div class="video-card" data-id="'+v.id+'" data-title="'+(v.title||"").replace(/"/g,"&quot;")+'" data-author="'+(v.owner&&v.owner.username||"")+'"><div class="thumb-wrap"><img src="'+(v.thumbnail_360_url||"")+'" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\"play-badge\\\">▶</div>\'"><div class="play-badge">▶</div><div class="duration">'+(v.duration?Math.floor(v.duration/60)+":"+String(v.duration%60).padStart(2,"0"):"")+'</div></div><div class="video-info"><div class="vtitle">'+v.title+'</div><div class="vauthor">'+(v.owner&&v.owner.username||"")+'</div></div></div>';
      }).join("") + '</div><div style="text-align:center;margin-top:8px;font-size:11px;color:var(--text-muted)">来源: Dailymotion</div>';
      res.querySelectorAll(".video-card").forEach(function(c){ c.addEventListener("click",function(){ playVideo(c.dataset.id,c.dataset.title,c.dataset.author); }); });
    } catch(e2) { res.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>搜索失败，请检查网络</p></div>'; }
  }
}
function playBilibili(bvid, aid, title, author) {
  var old = document.querySelector(".video-player-overlay"); if(old) old.remove();
  var div = document.createElement("div"); div.className = "video-player-overlay open";
  var src = bvid ? "https://player.bilibili.com/player.html?bvid="+bvid+"&autoplay=1&page=1" : "https://player.bilibili.com/player.html?aid="+aid+"&autoplay=1&page=1";
  div.innerHTML = '<div class="player-wrap"><span class="close-video" onclick="this.closest(\'.video-player-overlay\').remove()">✖</span><iframe src="'+src+'" allow="autoplay; fullscreen" allowfullscreen></iframe></div><div class="vp-title">'+(title||"")+'</div><div class="vp-author">'+(author||"B站")+'</div>';
  div.addEventListener("click", function(e){ if(e.target===div) div.remove(); });
  document.body.appendChild(div);
}
function playVideo(id, title, author) {
  var old = document.querySelector(".video-player-overlay"); if(old) old.remove();
  var div = document.createElement("div"); div.className = "video-player-overlay open";
  div.innerHTML = '<div class="player-wrap"><span class="close-video" onclick="this.closest(\'.video-player-overlay\').remove()">✖</span><iframe src="https://www.dailymotion.com/embed/video/'+id+'?autoplay=1&queue-enable=false" allow="autoplay; fullscreen" allowfullscreen></iframe></div><div class="vp-title">'+(title||"")+'</div><div class="vp-author">'+(author||"")+'</div>';
  div.addEventListener("click", function(e){ if(e.target===div) div.remove(); });
  document.body.appendChild(div);
}
function renderVideoRecorder(container) {
  container.innerHTML = '<div class="video-section"><div class="label">🎥 录制视频打卡（可选）</div><div class="video-recorder" id="videoRecorder"><div class="placeholder"><div class="icon">🎥</div><p>点击下方按钮开始录制</p></div><div class="rec-indicator" id="recIndicator"><div class="pulse"></div>录制中</div><div class="timer" id="recTimer">00:00</div></div><div class="video-controls"><button class="btn-record" id="btnStartRecord">⚫ 开始录制</button><button class="btn-stop" id="btnStopRecord" disabled>❌ 停止</button></div><div class="video-preview" id="videoPreview"><video id="previewVideo" controls></video><div class="preview-actions"><button class="btn-preview" id="btnConfirmVideo">✅ 保存视频</button><button class="btn-retry" id="btnRetryVideo">🔄 重新录制</button></div></div></div>';
  var recorder = document.getElementById("videoRecorder"), indicator = document.getElementById("recIndicator"), timer = document.getElementById("recTimer");
  var btnStart = document.getElementById("btnStartRecord"), btnStop = document.getElementById("btnStopRecord");
  var preview = document.getElementById("videoPreview"), previewVideo = document.getElementById("previewVideo");
  var btnConfirm = document.getElementById("btnConfirmVideo"), btnRetry = document.getElementById("btnRetryVideo");
  var stream = null, mediaRecorder = null, chunks = [], secs = 0, timerInt = null;
  async function startRec() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"user",width:{ideal:320},height:{ideal:480} }, audio: true });
      var ve = document.createElement("video"); ve.srcObject = stream; ve.autoplay = true; ve.muted = true; ve.playsInline = true;
      ve.style.cssText = "width:100%;height:100%;object-fit:cover";
      recorder.innerHTML = ""; recorder.appendChild(ve); recorder.appendChild(indicator); recorder.appendChild(timer);
      indicator.classList.add("show"); timer.classList.add("show"); secs = 0; timer.textContent = "00:00"; chunks = [];
      timerInt = setInterval(function(){ secs++; var m=String(Math.floor(secs/60)).padStart(2,"0"),s=String(secs%60).padStart(2,"0"); timer.textContent=m+":"+s; if(secs>=20) stopRec(); }, 1000);
      mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm" });
      mediaRecorder.ondataavailable = function(e){ if(e.data.size>0) chunks.push(e.data); };
      mediaRecorder.onstop = function(){
        clearInterval(timerInt); indicator.classList.remove("show"); timer.classList.remove("show");
        if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; }
        var blob = new Blob(chunks, { type:"video/webm" });
        previewVideo.src = URL.createObjectURL(blob);
        preview.classList.add("show"); btnStart.disabled = true; btnStop.disabled = true;
      };
      mediaRecorder.start(100); btnStart.disabled = true; btnStop.disabled = false;
      btnStart.textContent = "⏱ 录制中"; btnStart.classList.add("recording");
    } catch(e) {
      recorder.innerHTML = '<div class="placeholder"><div class="icon">⚠️</div><p>无法访问摄像头</p></div>';
      recorder.appendChild(indicator); recorder.appendChild(timer); btnStart.disabled = false;
    }
  }
  function stopRec() { if(mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop(); btnStart.classList.remove("recording"); btnStart.textContent = "⚫ 开始录制"; }
  function resetRec() { preview.classList.remove("show"); previewVideo.src = ""; chunks = []; btnStart.disabled = false; btnStop.disabled = true;
    recorder.innerHTML = '<div class="placeholder"><div class="icon">🎥</div><p>点击下方按钮开始录制</p></div>'; recorder.appendChild(indicator); recorder.appendChild(timer); }
  btnStart.onclick = startRec; btnStop.onclick = stopRec; btnRetry.onclick = resetRec;
  btnConfirm.onclick = function(){ window.latestVideoBlob = previewVideo.src; toast("🎥 视频已录制","success"); };
}
function showConfetti() {
  var el = document.getElementById("confetti");
  if (!el) { el = document.createElement("div"); el.className = "confetti"; el.id = "confetti"; document.body.appendChild(el); }
  el.innerHTML = "";
  var colors = ["#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899"];
  for (var i = 0; i < 60; i++) { var p = document.createElement("div"); p.className = "confetti-piece"; p.style.cssText = "left:" + Math.random()*100 + "%;top:-10px;background:" + colors[Math.floor(Math.random()*colors.length)] + ";width:" + (Math.random()*6+4) + "px;height:" + (Math.random()*6+4) + "px;border-radius:" + (Math.random()>0.5?"50%":"2px") + ";animation-delay:" + (Math.random()*0.5) + "s;animation-duration:" + (Math.random()*1+1.2) + "s;"; el.appendChild(p); }
  el.classList.add("show"); setTimeout(function(){ el.classList.remove("show"); }, 3000);
}
renderApp();


