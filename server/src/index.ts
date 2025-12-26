import { GameServer } from './core/GameServer';

// Start the server on port 3000
const port = 3000;
const server = new GameServer(port);

server.start();
