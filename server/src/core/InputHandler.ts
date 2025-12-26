import { GameState } from '../core/GameState';
import { ShopSystem } from '../systems/ShopSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { PhaseManager, GamePhase } from '../core/PhaseManager';

/**
 * 输入处理器 (Input Handler)
 * 
 * 职责：
 * 1. 解析客户端发来的 WebSocket 消息
 * 2. 验证操作合法性 (Validation)
 * 3. 调用相应系统的执行方法
 */
export class InputHandler {
    private shopSystem: ShopSystem;
    private economySystem: EconomySystem;
    private upgradeSystem: UpgradeSystem;

    constructor(private state: GameState) {
        this.shopSystem = new ShopSystem(state);
        this.economySystem = new EconomySystem(state);
        this.upgradeSystem = new UpgradeSystem(state);
    }

    public handleMessage(clientId: string, message: any) {
        const { type, payload } = message;

        if (!type) return;

        switch (type) {
            case 'BUY_UNIT':
                // 购买单位
                // payload: { type: string, x: number, y: number }
                // 限制：仅在准备阶段可购买
                if (this.state.phaseManager.currentPhase === GamePhase.PLANNING) {
                    this.shopSystem.buyUnit(clientId, payload.type, payload.x, payload.y);
                }
                break;

            case 'UPGRADE_UNIT':
                // 升级单位
                if (this.state.phaseManager.currentPhase === GamePhase.PLANNING) {
                    this.upgradeSystem.upgradeUnit(clientId, payload.unitId);
                }
                break;

            case 'BANK_DEPOSIT':
                // 存款到银行
                // payload: { amount: number }
                this.economySystem.deposit(clientId, payload.amount);
                break;

            case 'BANK_WITHDRAW':
                // 从银行取款
                this.economySystem.withdraw(clientId, payload.amount);
                break;

            case 'READY':
                // 玩家准备就绪，尝试提前结束倒计时
                // (原型简易实现：直接开始战斗)
                this.state.phaseManager.startBattle();
                break;
        }
    }
}
