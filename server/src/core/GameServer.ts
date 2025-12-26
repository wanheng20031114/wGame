import { WebSocketServer, WebSocket } from 'ws';
import { GameState } from './GameState';
import { InputHandler } from './InputHandler';

/**
 * 权威服务器核心 (The Divine Server)
 * 
 * 职责：
 * 1. 维护 WebSocket 长连接
 * 2. 驱动 20Hz (50ms) 的固定时间步 (Tick Loop)
 * 3. 接收客户端指令 (Input)
 * 4. 广播世界状态快照 (Snapshot)
 */
export class GameServer {
    private wss: WebSocketServer;
    private port: number;
    private intervalId: NodeJS.Timeout | null = null;

    private gameState: GameState;
    private inputHandler: InputHandler;

    // 核心设定：20 TPS (Ticks Per Second)
    // 这意味着服务器每秒进行 20 次逻辑更新，即每 50 毫秒一次。
    // 即便客户端渲染 60 帧或 144 帧，所有逻辑判定均以此为准。
    private static readonly TICK_RATE = 20;
    private static readonly TICKS_MS = 1000 / GameServer.TICK_RATE;

    constructor(port: number) {
        this.port = port;
        this.wss = new WebSocketServer({ port: this.port });

        this.gameState = new GameState();
        this.inputHandler = new InputHandler(this.gameState);
    }

    public start() {
        console.log(`[Server] 恩人协议服务端 (Divine Server) 启动监听端口: ${this.port}...`);

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('[Server] 新客户端连接');

            // 原型阶段：简单的 ID 分配
            const clientId = 'player1';

            ws.on('message', (message: any) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.inputHandler.handleMessage(clientId, data);
                } catch (e) {
                    console.error('[Server] 无效的消息格式', e);
                }
            });

            ws.on('close', () => {
                console.log('[Server] 客户端断开连接');
            });
        });

        this.startGameLoop();
    }

    private startGameLoop() {
        let lastTime = Date.now();

        this.intervalId = setInterval(() => {
            const now = Date.now();
            const dt = now - lastTime;
            lastTime = now;

            // 执行单次逻辑 Tick
            this.tick(dt);
        }, GameServer.TICKS_MS);

        console.log(`[Server] 游戏主循环已启动，频率: ${GameServer.TICK_RATE} Hz (${GameServer.TICKS_MS}ms)`);
    }

    private tick(dt: number) {
        // 1. 核心逻辑更新 (Core Logic)
        this.gameState.update(dt);

        // 2. 广播状态快照 (Broadcast State)
        this.broadcastState();
    }

    private broadcastState() {
        // 构造快照数据包 (Snapshot Protocol)
        // 仅包含客户端渲染所需的最小数据集
        const snapshot = {
            phase: this.gameState.phaseManager.currentPhase,
            timer: Math.ceil(this.gameState.phaseManager.timer / 1000), // 秒级倒计时
            entities: Array.from(this.gameState.entities.values()),     // 所有实体位置
            players: Array.from(this.gameState.players.values())        // 玩家数据 (金钱等)
        };

        const payload = JSON.stringify({ type: 'SNAPSHOT', data: snapshot });

        // 发送给所有连接状态正常的客户端
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }
}
