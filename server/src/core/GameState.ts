import { PhaseManager, GamePhase } from './PhaseManager';
import { Entity } from '../entities/Entity';
import { Player } from './Player';
import { BattleSystem } from '../systems/BattleSystem';
import { SynergySystem } from '../systems/SynergySystem';
import { EconomySystem } from '../systems/EconomySystem';

/**
 * 游戏状态 (Game State)
 * 
 * 职责：
 * 1. 存储世界单一事实来源 (Single Source of Truth)
 * 2. 管理所有实体 (Entities) 和玩家 (Players)
 * 3. 协调各个子系统的更新
 */
export class GameState {
    public phaseManager: PhaseManager;
    public entities: Map<string, Entity>; // 所有战场单位 map: <uuid, Entity>
    public players: Map<string, Player>;  // 玩家数据 map: <playerId, Player>

    // 子系统引用
    public battleSystem: BattleSystem;
    public synergySystem: SynergySystem;
    public economySystem: EconomySystem;

    constructor() {
        this.phaseManager = new PhaseManager();
        this.entities = new Map();
        this.players = new Map();

        // 初始化子系统
        this.battleSystem = new BattleSystem(this);
        this.synergySystem = new SynergySystem(this);
        this.economySystem = new EconomySystem(this);

        // 默认玩家初始化 (原型用)
        this.players.set('player1', {
            id: 'player1',
            cash: 100, // 初始资金
            bank: 0,   // 银行存款
            hp: 20     // 玩家大本营生命值
        });

        // 启动初始阶段
        this.phaseManager.startPlanning();
    }

    /**
     * 状态更新
     * 在 Server Tick 中被调用
     * @param dt 毫秒 delta time
     */
    update(dt: number) {
        const prevPhase = this.phaseManager.currentPhase;
        this.phaseManager.update(dt);

        // 检测阶段切换: 准备阶段 (PLANNING) -> 战斗阶段 (BATTLE)
        if (prevPhase === GamePhase.PLANNING && this.phaseManager.currentPhase === GamePhase.BATTLE) {
            // 结算利息 (Interest)
            this.economySystem.processInterest();
        }

        // 更新子系统逻辑
        this.battleSystem.update(dt);
        this.synergySystem.update(dt);
    }
}
