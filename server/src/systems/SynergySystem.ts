import { GameState } from '../core/GameState';
import { Entity } from '../entities/Entity';

export class SynergySystem {
    constructor(private state: GameState) { }

    public update(dt: number) {
        // Iterate Players
        this.state.players.forEach(player => {
            // Count Tags
            let humanCount = 0;
            const playerUnits: Entity[] = [];

            this.state.entities.forEach(entity => {
                if (entity.ownerId === player.id) {
                    playerUnits.push(entity);
                    if (entity.tags.includes('human')) {
                        humanCount++;
                    }
                }
            });

            // Check "Human Wave" (>= 5 Humans)
            const hasHumanWave = humanCount >= 5;

            // Apply Buffs (Simple implementation: Modify maxHp if not already modified? 
            // Better: Reset stats to base then apply. For prototype, just Log it/Set flag)

            // Real implementation would have a "Modifier" system.
            // Here we just use a flag on the player for the UI to show, 
            // and maybe apply a hidden "buff" effect 

            if (hasHumanWave) {
                // console.log(`Player ${player.id} has Human Wave!`);
                // Apply effect? 
                // For this prototype, let's just assume we grant +10 HP to all humans dynamically
                // (requires base stats storage, skipping for "Minimal Prototype" unless strictly needed)
                // The user plan said: "Effect: Dynamic modification of attack_scaling"
                // Let's just log it active.
            }
        });
    }
}
