import { GameState } from '../core/GameState';
import { Entity } from '../entities/Entity';
import { GamePhase } from '../core/PhaseManager';

export class BattleSystem {
    constructor(private state: GameState) { }

    public update(dt: number) {
        // Only run in Battle Phase
        if (this.state.phaseManager.currentPhase !== GamePhase.BATTLE) return;

        // 1. Spawn Enemies (Simple logic: every N seconds)
        this.handleSpawning(dt);

        // 2. Move & Combat
        this.handleCombat(dt);
    }

    private spawnTimer = 0;
    private handleSpawning(dt: number) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy();
            this.spawnTimer = 2000; // Spawn every 2 seconds
        }
    }

    private spawnEnemy() {
        // Spawn at Hive (39, 10) - Silk Road Entrance
        const enemy: Entity = {
            id: `enemy_${Math.random().toString(36).substr(2, 5)}`,
            type: 'basic_mob',
            x: 39,
            y: 9 + Math.floor(Math.random() * 2), // Row 9 or 10
            width: 64,
            height: 64,
            hp: 30,
            maxHp: 30,
            attack: 5,
            attackRange: 0.5, // Melee
            ownerId: 'enemy',
            tags: ['mob']
        };
        this.state.entities.set(enemy.id, enemy);
    }

    private handleCombat(dt: number) {
        // Iterate all entities
        this.state.entities.forEach(entity => {
            if (entity.ownerId === 'enemy') {
                this.updateEnemy(entity, dt);
            } else if (entity.ownerId !== 'enemy') {
                this.updateTower(entity, dt);
            }
        });
    }

    private updateEnemy(enemy: Entity, dt: number) {
        // Move Left along Silk Road
        const speed = 2.0; // Grid units per second
        const moveDist = speed * (dt / 1000);

        let blocked = false;

        // Check for blocking units in next position
        // Simple 1D check for now along the row
        const targetX = enemy.x - moveDist;

        // Blocking Check
        for (const [id, value] of this.state.entities) {
            if (value.ownerId !== 'enemy' && value.y === enemy.y) {
                // Collision/Range check
                if (Math.abs(value.x - targetX) < 1.0) { // Within 1 block
                    blocked = true;
                    // Attack Logic here? 
                    // Or separate attack phase.
                    // Enemy attacks blocker
                    this.attack(enemy, value, dt);
                    break;
                }
            }
        }

        if (!blocked) {
            enemy.x -= moveDist;

            // Base Damage Check
            if (enemy.x <= 0) {
                console.log(`Enemy ${enemy.id} reached Base!`);
                // Deduct Player HP
                this.state.players.forEach(p => p.hp -= 1);
                // Destroy Enemy
                this.state.entities.delete(enemy.id);
            }
        }
    }

    private updateTower(tower: Entity, dt: number) {
        // Search for targets in range
        // Range Check
        let target = null;
        let minDist = 999;

        for (const [id, enemy] of this.state.entities) {
            if (enemy.ownerId === 'enemy') {
                const dist = Math.sqrt((tower.x - enemy.x) ** 2 + (tower.y - enemy.y) ** 2);
                if (dist <= tower.attackRange && dist < minDist) {
                    minDist = dist;
                    target = enemy;
                }
            }
        }

        if (target) {
            this.attack(tower, target, dt);
        }
    }

    private attack(attacker: Entity, target: Entity, dt: number) {
        // Simple DPS model
        const damage = attacker.attack * (dt / 1000);
        target.hp -= damage;

        if (target.hp <= 0) {
            console.log(`${target.id} killed by ${attacker.id}`);
            // Death Hook / Bounty
            if (target.ownerId === 'enemy') {
                // Give Bounty
                const player = this.state.players.get(attacker.ownerId);
                if (player) player.cash += 1;
            }
            this.state.entities.delete(target.id);
        }
    }
}
