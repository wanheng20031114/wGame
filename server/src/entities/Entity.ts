export interface Entity {
    id: string;
    type: string;

    // Spatial
    x: number; // Grid Column ideally, or pixel?
    // Plan said "40x20 Grid Universe", so logic should be Grid based?
    // But interpolation needs float positions. 
    // Let's store World Pixels for smoothness, or Grid Coordinates (float)?
    // "Grid is the only benchmark". 
    // Let's store Grid Coordinates (0.0 - 39.9) for logic ease.
    y: number;

    // Stats
    hp: number;
    maxHp: number;
    attack: number;
    attackRange: number;

    // Size
    width: number;
    height: number;

    // Meta
    ownerId: string; // 'player1', 'enemy'
    tags: string[]; // ['human', 'tower', 'building']
}
