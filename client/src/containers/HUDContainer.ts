import { Container, Graphics, Text } from 'pixi.js';
import { NetworkManager } from '../managers/NetworkManager';

export class HUDContainer extends Container {
    private network: NetworkManager;

    constructor(network: NetworkManager) {
        super();
        this.network = network;
        this.createShopUI();
        this.createBankUI();
    }

    private createShopUI() {
        const btn = new Graphics();
        btn.rect(0, 0, 200, 60);
        btn.fill(0x00AA00);
        btn.x = 20;
        btn.y = 20;

        // Interaction
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => {
            // Buy at fixed pos for prototype
            console.log('Buy Unit Clicked');
            // Random pos in base area
            const randY = 2 + Math.floor(Math.random() * 8);
            this.network.buyUnit('human_warrior', 2, randY);
        });

        const text = new Text({ text: 'BUY UNIT ($10)', style: { fill: 0xffffff, fontSize: 20 } });
        text.x = 10;
        text.y = 10;
        btn.addChild(text);

        this.addChild(btn);
    }

    private createBankUI() {
        const btn = new Graphics();
        btn.rect(0, 0, 200, 60);
        btn.fill(0xAAAA00);
        btn.x = 240;
        btn.y = 20;

        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => {
            console.log('Deposit Clicked');
            this.network.deposit(10);
        });

        const text = new Text({ text: 'DEPOSIT ($10)', style: { fill: 0xffffff, fontSize: 20 } });
        text.x = 10;
        text.y = 10;
        btn.addChild(text);

        this.addChild(btn);
    }
}
