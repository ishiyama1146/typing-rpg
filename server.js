const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

function makeRoom() {
  let code;
  do code = Math.floor(1000 + Math.random() * 9000).toString();
  while (rooms[code]);
  rooms[code] = {
    players: {},
    bossMaxHp: 5000,
    bossHp: 5000,
    started: false,
    ended: false,
    attackTimer: null
  };
  return code;
}

function publicRoom(room) {
  return {
    bossHp: room.bossHp,
    bossMaxHp: room.bossMaxHp,
    started: room.started,
    ended: room.ended,
    players: Object.entries(room.players).map(([id,p]) => ({
      id, name:p.name, hp:p.hp, maxHp:p.maxHp, damage:p.damage,
      hits:p.hits, misses:p.misses, combo:p.combo, maxCombo:p.maxCombo
    }))
  };
}

function broadcast(code) {
  if (rooms[code]) io.to(code).emit("state", publicRoom(rooms[code]));
}

function stopRoom(room) {
  if (room.attackTimer) clearInterval(room.attackTimer);
  room.attackTimer = null;
}

function startBoss(code) {
  const room = rooms[code];
  if (!room || room.attackTimer) return;
  room.started = true;

  room.attackTimer = setInterval(() => {
    if (!rooms[code] || room.ended) return stopRoom(room);
    const alive = Object.entries(room.players).filter(([,p]) => p.hp > 0);
    if (!alive.length) {
      room.ended = true;
      stopRoom(room);
      io.to(code).emit("gameOver", { win:false });
      return broadcast(code);
    }
    const [id, p] = alive[Math.floor(Math.random()*alive.length)];
    const dmg = 12;
    p.hp = Math.max(0, p.hp - dmg);
    io.to(code).emit("bossAttack", { target:id, damage:dmg });
    broadcast(code);
  }, 3500);
}

io.on("connection", socket => {
  socket.on("createRoom", ({name}, cb) => {
    const code = makeRoom();
    const room = rooms[code];
    room.players[socket.id] = freshPlayer(name || "PLAYER 1");
    socket.join(code);
    socket.data.room = code;
    cb({ok:true, code});
    broadcast(code);
  });

  socket.on("joinRoom", ({code,name}, cb) => {
    code = String(code || "").trim();
    const room = rooms[code];
    if (!room) return cb({ok:false, message:"部屋が見つかりません"});
    if (Object.keys(room.players).length >= 2) return cb({ok:false, message:"この部屋は満員です"});
    if (room.started) return cb({ok:false, message:"すでにゲームが始まっています"});
    room.players[socket.id] = freshPlayer(name || "PLAYER 2");
    socket.join(code);
    socket.data.room = code;
    cb({ok:true, code});
    broadcast(code);
  });

  socket.on("startGame", () => {
    const code = socket.data.room, room = rooms[code];
    if (!room || Object.keys(room.players).length < 2) return;
    startBoss(code);
    broadcast(code);
  });

  socket.on("hit", ({combo}) => {
    const code = socket.data.room, room = rooms[code];
    if (!room || !room.started || room.ended) return;
    const p = room.players[socket.id];
    if (!p || p.hp <= 0) return;

    p.combo = Math.max(1, Number(combo)||1);
    p.maxCombo = Math.max(p.maxCombo, p.combo);
    p.hits++;
    const crit = p.combo > 0 && p.combo % 25 === 0;
    const damage = crit ? 30 : 10;
    p.damage += damage;
    room.bossHp = Math.max(0, room.bossHp - damage);
    io.to(code).emit("damage", {player:socket.id, damage, crit});

    if (room.bossHp <= 0) {
      room.ended = true;
      stopRoom(room);
      io.to(code).emit("gameOver", {win:true});
    }
    broadcast(code);
  });

  socket.on("miss", () => {
    const code = socket.data.room, room = rooms[code];
    if (!room || !room.players[socket.id]) return;
    room.players[socket.id].misses++;
    room.players[socket.id].combo = 0;
    broadcast(code);
  });

  socket.on("heal", cb => {
    const code = socket.data.room, room = rooms[code];
    const p = room?.players[socket.id];
    if (!room || !p || !room.started || room.ended) return cb?.({ok:false});
    if (p.hits < 30) return cb?.({ok:false, message:"30 HITごとに回復できます"});
    p.hits -= 30;
    Object.values(room.players).forEach(x => x.hp = Math.min(x.maxHp, x.hp + 25));
    io.to(code).emit("healEffect");
    broadcast(code);
    cb?.({ok:true});
  });

  socket.on("disconnect", () => {
    const code = socket.data.room, room = rooms[code];
    if (!room) return;
    delete room.players[socket.id];
    io.to(code).emit("notice", "相方が退出しました");
    if (!Object.keys(room.players).length) {
      stopRoom(room);
      delete rooms[code];
    } else broadcast(code);
  });
});

function freshPlayer(name) {
  return {name:String(name).slice(0,12), hp:100, maxHp:100, damage:0, hits:0, misses:0, combo:0, maxCombo:0};
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`Typing RPG: http://localhost:${PORT}`));
