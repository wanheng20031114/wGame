export class NetworkManager {
    private ws: WebSocket;

    public onSnapshot: ((snapshot: any) => void) | null = null;

    constructor() {
        this.ws = new WebSocket('ws://localhost:3000');

        this.ws.onopen = () => {
            console.log('Connected to The Divine Server');
            this.send({ type: 'READY' }); // Auto ready
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'SNAPSHOT') {
                    if (this.onSnapshot) this.onSnapshot(message.data);
                }
            } catch (e) {
                console.error('Failed to parse message', e);
            }
        };
    }

    public send(data: any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('Socket not open, message dropped');
        }
    }

    public buyUnit(type: string, x: number, y: number) {
        this.send({
            type: 'BUY_UNIT',
            payload: { type, x, y }
        });
    }

    public upgradeUnit(unitId: string) {
        this.send({
            type: 'UPGRADE_UNIT',
            payload: { unitId }
        });
    }

    public deposit(amount: number) {
        this.send({
            type: 'BANK_DEPOSIT',
            payload: { amount }
        });
    }

    public withdraw(amount: number) {
        this.send({
            type: 'BANK_WITHDRAW',
            payload: { amount }
        });
    }

    public ready() {
        this.send({ type: 'READY' });
    }
}
