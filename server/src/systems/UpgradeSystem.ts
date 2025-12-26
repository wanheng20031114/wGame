import { GameState } from '../core/GameState';

export class UpgradeSystem {
    constructor(private state: GameState) { }

    public upgradeUnit(playerId: string, unitId: string): boolean {
        const player = this.state.players.get(playerId);
        const unit = this.state.entities.get(unitId);

        if (!player || !unit) return false;
        if (unit.ownerId !== playerId) return false;

        const cost = 5; // Hardcoded upgrade cost
        if (player.cash < cost) return false;

        player.cash -= cost;

        // Upgrade Logic: Increase Attack
        unit.attack += 2;
        // Optionally increase HP or other stats

        console.log(`[Upgrade] Unit ${unitId} upgraded. New Attack: ${unit.attack}`);
        return true;
    }
}
