import { GameState } from '../core/GameState';

export class EconomySystem {
    constructor(private state: GameState) { }

    // Called when Planning Phase ends
    public processInterest() {
        this.state.players.forEach(player => {
            if (player.bank > 0) {
                const interest = Math.floor(player.bank * 0.15);
                player.bank += interest;
                console.log(`[Economy] Player ${player.id} earned ${interest} interest. Bank: ${player.bank}`);
            }
        });
    }

    public deposit(playerId: string, amount: number) {
        const player = this.state.players.get(playerId);
        if (player && player.cash >= amount) {
            player.cash -= amount;
            player.bank += amount;
            return true;
        }
        return false;
    }

    public withdraw(playerId: string, amount: number) {
        const player = this.state.players.get(playerId);
        if (player && player.bank >= amount) {
            player.bank -= amount;
            player.cash += amount;
            return true;
        }
        return false;
    }
}
