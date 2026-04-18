import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { setupImposter } from './games/imposter/server';
import { setupVibeCheck } from './games/vibe-check/server';
import { setupNeverHaveIEver } from './games/never-have-i-ever/server';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 4 * 1024,
  pingTimeout: 20_000,
  pingInterval: 25_000,
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/imposter', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'imposter', 'index.html'));
});
app.get('/vibe-check', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'vibe-check', 'index.html'));
});
app.get('/never-have-i-ever', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'never-have-i-ever', 'index.html'));
});

setupImposter(io.of('/imposter'));
setupVibeCheck(io.of('/vibe-check'));
setupNeverHaveIEver(io.of('/never-have-i-ever'));

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`Shivangi's Game Library running on http://localhost:${PORT}`);
});
