import { GameState } from '../core/GameState';
import { Entity } from '../entities/Entity';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid or just use simpler ID

export class ShopSystem {
    constructor(private state: GameState) { }

    public buyUnit(playerId: string, unitType: string, x: number, y: number): boolean {
        const player = this.state.players.get(playerId);
        // Cost table - Hardcoded for prototype
        const cost = 10;

        if (!player || player.cash < cost) {
            console.log(`[Shop] Insufficient funds for ${playerId}`);
            return false;
        }

        // Validate Position (Simple check: is occupied?)
        // In prototype, we iterate. In production, use a spatial grid.
        const isOccupied = Array.from(this.state.entities.values()).some(e =>
            e.x === x && e.y === y // Integer grid match
        );

        if (isOccupied) {
            console.log(`[Shop] Position ${x},${y} is occupied.`);
            return false;
        }

        // Deduct Cash
        player.cash -= cost;

        // Spawn Unit
        const unit: Entity = {
            id: Math.random().toString(36).substr(2, 9), // Simple ID
            type: unitType,
            x: x,
            y: y,
            width: 64, // Default, logic only
            height: 64,
            hp: 100,
            maxHp: 100,
            attack: 10,
            attackRange: 1, // Melee
            ownerId: playerId,
            tags: ['human'] // Default tag for now
        };

        this.state.entities.set(unit.id, unit);
        console.log(`[Shop] Unit ${unitType} spawned at ${x},${y} for ${playerId}`);
        return true;
    }
}
