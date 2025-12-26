export enum GamePhase {
    PLANNING = 'PLANNING',
    BATTLE = 'BATTLE'
}

export class PhaseManager {
    public currentPhase: GamePhase = GamePhase.PLANNING;
    public timer: number = 0;

    // Config
    // For prototype, let's say 30 seconds, or infinite until "Ready"
    public static readonly PLANNING_TIME_MS = 30000;

    startPlanning() {
        this.currentPhase = GamePhase.PLANNING;
        this.timer = PhaseManager.PLANNING_TIME_MS;
        console.log('Phase: PLANNING Started');
    }

    startBattle() {
        this.currentPhase = GamePhase.BATTLE;
        this.timer = 0;
        console.log('Phase: BATTLE Started');
    }

    update(dt: number) {
        if (this.currentPhase === GamePhase.PLANNING) {
            if (this.timer > 0) {
                this.timer -= dt;
                // If timer hits 0, maybe auto-start battle or just wait?
                // Let's auto-start for now as a fail-safe, or keep at 0.
            }
        }
        // Battle phase end condition is checked by GameState (enemies count = 0)
    }
}
