const http = require('http'), fs = require('fs'), path = require('path');
const PORT = 3457, DIR = path.join(__dirname, 'public'), DB_DIR = path.join(__dirname, 'data'), DB_FILE = path.join(DB_DIR, 'db.json');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{"users":[],"checkins":[],"rewards":[],"friendships":[]}', 'utf8');
function readDB() { try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return { users: [], checkins: [], rewards: [], friendships: [] }; } }
function writeDB(d) { fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf8'); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }
function parseBody(req) { return new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } }); }); }
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const send = (code, data) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
  const parts = pathname.split('/').filter(Boolean);
  if (pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') { res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }
    try {
      // Register
      if (pathname === '/api/register' && req.method === 'POST') {
        const b = await parseBody(req);
        if (!b.name || !b.password) { send(400, { error: '用户名和密码不能为空' }); return; }
        const db = readDB();
        if (db.users.find(u => u.name === b.name)) { send(400, { error: '用户名已存在' }); return; }
        const user = { id: uid(), name: b.name, password: b.password, startWeight: Number(b.startWeight) || 0, targetWeight: Number(b.targetWeight) || 0, streak: 0, lastCheckin: '', createdAt: new Date().toISOString() };
        db.users.push(user); writeDB(db);
        send(200, { success: true, user: { id: user.id, name: user.name, startWeight: user.startWeight, targetWeight: user.targetWeight, streak: user.streak, lastCheckin: user.lastCheckin, createdAt: user.createdAt } });
        return;
      }
      // Login
      if (pathname === '/api/login' && req.method === 'POST') {
        const b = await parseBody(req);
        const u = readDB().users.find(u => u.name === b.name && u.password === b.password);
        if (!u) { send(400, { error: '用户名或密码错误' }); return; }
        send(200, { success: true, user: { id: u.id, name: u.name, startWeight: u.startWeight, targetWeight: u.targetWeight, streak: u.streak, lastCheckin: u.lastCheckin, createdAt: u.createdAt } });
        return;
      }
      // Get user
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'user' && req.method === 'GET') {
        const u = readDB().users.find(u => u.id === parts[2]);
        if (!u) { 
      if (pathname === "/api/videos/bilibili" && req.method === "GET") { const q = url.searchParams.get("q"); if (!q) { send(400, { error: "no q" }); return; } proxyBilibili(q, send); return; }
      if (pathname === "/api/videos/search" && req.method === "GET") { const q = url.searchParams.get("q"); if (!q) { send(400, { error: "no q" }); return; } proxyDailymotion(q, send); return; }
send(404, { error: '用户不存在' }); return; }
        send(200, { id: u.id, name: u.name, startWeight: u.startWeight, targetWeight: u.targetWeight, streak: u.streak, lastCheckin: u.lastCheckin, createdAt: u.createdAt });
        return;
      }
      // Update user
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'user' && req.method === 'PUT') {
        const b = await parseBody(req); const db = readDB(); const i = db.users.findIndex(u => u.id === parts[2]);
        if (i === -1) { send(404, { error: '用户不存在' }); return; }
        Object.assign(db.users[i], b); writeDB(db);
        send(200, { success: true }); return;
      }
      // Get checkins
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'checkins' && req.method === 'GET') {
        send(200, readDB().checkins.filter(c => c.userId === parts[2]).sort((a, b) => b.date.localeCompare(a.date))); return;
      }
      // Checkin
      if (pathname === '/api/checkin' && req.method === 'POST') {
        const b = await parseBody(req); if (!b.userId) { send(400, { error: '缺少用户ID' }); return; }
        const db = readDB(); const u = db.users.find(u => u.id === b.userId);
        if (!u) { send(404, { error: '用户不存在' }); return; }
        const date = today();
        if (db.checkins.find(c => c.userId === b.userId && c.date === date)) { send(400, { error: '今天已经打过卡了' }); return; }
        db.checkins.push({ id: uid(), userId: b.userId, date, weight: Number(b.weight) || 0, note: b.note || '' });
        const yd = new Date(); yd.setDate(yd.getDate() - 1);
        u.streak = u.lastCheckin === yd.toISOString().slice(0, 10) ? (u.streak || 0) + 1 : 1;
        u.lastCheckin = date; writeDB(db);
        send(200, { success: true, streak: u.streak }); return;
      }
      // Friends
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'friends' && req.method === 'GET') {
        const db = readDB(); const fids = db.friendships.filter(f => f.userId === parts[2]).map(f => f.friendId);
        send(200, db.users.filter(u => fids.includes(u.id)).map(u => ({ id: u.id, name: u.name, streak: u.streak, lastCheckin: u.lastCheckin }))); return;
      }
      // Add friend
      if (pathname === '/api/friends/add' && req.method === 'POST') {
        const b = await parseBody(req); if (!b.userId || !b.friendName) { send(400, { error: '参数不完整' }); return; }
        const db = readDB(); const f = db.users.find(u => u.name === b.friendName);
        if (!f) { send(404, { error: '用户不存在' }); return; }
        if (f.id === b.userId) { send(400, { error: '不能添加自己为好友' }); return; }
        if (db.friendships.find(x => x.userId === b.userId && x.friendId === f.id)) { send(400, { error: '已经是好友了' }); return; }
        db.friendships.push({ userId: b.userId, friendId: f.id }, { userId: f.id, friendId: b.userId }); writeDB(db);
        send(200, { success: true, friend: { id: f.id, name: f.name } }); return;
      }
      // Rewards
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'rewards' && req.method === 'GET') {
        send(200, readDB().rewards.filter(r => r.userId === parts[2])); return;
      }
      if (pathname === '/api/rewards' && req.method === 'POST') {
        const b = await parseBody(req); if (!b.userId || !b.name) { send(400, { error: '参数不完整' }); return; }
        const db = readDB();
        db.rewards.push({ id: uid(), userId: b.userId, name: b.name, milestoneWeight: Number(b.milestoneWeight) || 0, unlocked: false });
        writeDB(db); send(200, { success: true }); return;
      }
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'rewards' && req.method === 'PUT') {
        const b = await parseBody(req); const db = readDB(); const i = db.rewards.findIndex(r => r.id === parts[2]);
        if (i === -1) { send(404, { error: '奖励不存在' }); return; }
        Object.assign(db.rewards[i], b); writeDB(db); send(200, { success: true }); return;
      }
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'rewards' && req.method === 'DELETE') {
        const db = readDB(); db.rewards = db.rewards.filter(r => r.id !== parts[2]); writeDB(db); send(200, { success: true }); return;
      }
      // Leaderboard
      if (pathname === '/api/leaderboard' && req.method === 'GET') {
        send(200, readDB().users.map(u => ({ id: u.id, name: u.name, streak: u.streak || 0 })).sort((a, b) => (b.streak || 0) - (a.streak || 0)));
        return;
      }
      // Feed
      if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'feed' && req.method === 'GET') {
        const db = readDB(); const fids = db.friendships.filter(f => f.userId === parts[2]).map(f => f.friendId);
        fids.push(parts[2]);
        send(200, db.checkins.filter(c => fids.includes(c.userId)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50).map(c => ({ ...c, userName: (db.users.find(u => u.id === c.userId) || {}).name })));
        return;
      }
      send(404, { error: '接口不存在' }); return;
    } catch (e) { send(500, { error: e.message }); return; }
  }
  // Static files
  let fp = pathname === '/' ? '/index.html' : pathname;
  fp = path.join(DIR, fp);
  const ct = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end('<h1>404</h1>'); return; }
    res.writeHead(200, { 'Content-Type': ct[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => console.log('Server on http://0.0.0.0:' + PORT));
