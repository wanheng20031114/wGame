import { Container, Graphics } from 'pixi.js';
import { ResolutionManager } from '../managers/ResolutionManager';

/**
 * 世界容器 (World Container)
 * 包含所有游戏场景内的视觉元素。
 * 
 * 层级结构 (由下至上):
 * 1. bgLayer: 地面背景
 * 2. gridLayer: 调试网格 (可切换)
 * 3. characterLayer: 角色与单位 (开启自动 Y 轴排序以实现 2.5D 遮挡)
 * 4. effectLayer: 特效与弹道
 */
export class WorldContainer extends Container {
    public bgLayer: Container;
    public gridLayer: Container;
    public characterLayer: Container;
    public effectLayer: Container;

    private entitySprites: Map<string, Container> = new Map();

    constructor() {
        super();

        // 1. 初始化层级容器
        this.bgLayer = new Container();
        this.gridLayer = new Container();
        this.characterLayer = new Container();
        this.effectLayer = new Container();

        // 关键：开启角色层的子元素自动排序
        // PixiJS 会根据子元素的 zIndex 属性进行渲染排序
        // 在 2.5D 游戏中，通常设置 zIndex = y 坐标
        this.characterLayer.sortableChildren = true;

        // 2. 按顺序添加到 World
        this.addChild(this.bgLayer);
        this.addChild(this.gridLayer);
        this.addChild(this.characterLayer);
        this.addChild(this.effectLayer);

        // 3. 绘制调试内容 (正式版需移除或替换为纹理)
        this.drawDebugBackground();
        this.drawDebugGrid();
    }

    /**
     * 根据服务器快照更新实体
     * @param serverEntities 服务器下发的实体数据列表
     * @param dt 帧间隔时间 (delta time)，用于客户端平滑插值
     */
    public updateEntities(serverEntities: any[], _dt: number) {
        // 1. 标记当前所有实体，用于检测哪些需要删除
        const activeIds = new Set<string>();

        serverEntities.forEach(data => {
            activeIds.add(data.id);
            let sprite = this.entitySprites.get(data.id);

            if (!sprite) {
                // 如果是新实体，创建并添加
                sprite = this.createEntitySprite(data);
                this.characterLayer.addChild(sprite);
                this.entitySprites.set(data.id, sprite);
            }

            // 计算目标像素坐标 (网格坐标 -> 像素坐标)
            // 1 Grid = 64 Pixel
            const targetX = data.x * 64;
            const targetY = data.y * 64;

            // 简单的线性插值 (Lerp) 平滑移动
            // t = 0.2 表示每帧移动差异的 20%，形成一种平滑跟手的拖尾效果
            const t = 0.2;
            sprite.x = sprite.x + (targetX - sprite.x) * t;
            sprite.y = sprite.y + (targetY - sprite.y) * t;

            // 实时更新 Z-Index 以处理遮挡 (Y 轴越大越靠前)
            sprite.zIndex = sprite.y;
        });

        // 2. 清理已销毁的实体
        for (const [id, sprite] of this.entitySprites) {
            if (!activeIds.has(id)) {
                this.characterLayer.removeChild(sprite);
                this.entitySprites.delete(id);
            }
        }
    }

    /**
     * 创建实体的视觉表现 (Sprite)
     * 目前使用 Graphics 绘制色块作为原型
     */
    private createEntitySprite(data: any): Container {
        const container = new Container();

        const gfx = new Graphics();
        if (data.ownerId === 'enemy') {
            gfx.rect(0, 0, 64, 64);
            gfx.fill(0xff0000); // 红色：敌人
        } else {
            gfx.rect(0, 0, 64, 64);
            gfx.fill(0x0000ff); // 蓝色：玩家单位
        }

        container.addChild(gfx);

        // 设置初始位置
        container.x = data.x * 64;
        container.y = data.y * 64;

        return container;
    }

    private drawDebugBackground() {
        // 绘制 40x20 的深色地面
        const bg = new Graphics();
        bg.rect(0, 0, ResolutionManager.TARGET_WIDTH, ResolutionManager.TARGET_HEIGHT);
        bg.fill(0x2a2a2a); // 深灰色背景
        this.bgLayer.addChild(bg);
    }

    private drawDebugGrid() {
        const grid = new Graphics();
        const cols = 40;
        const rows = 20;
        const size = 64;

        // 绘制网格线
        grid.stroke({ width: 1, color: 0x444444 });

        // 垂直线
        for (let x = 0; x <= cols; x++) {
            grid.moveTo(x * size, 0);
            grid.lineTo(x * size, rows * size);
        }

        // 水平线
        for (let y = 0; y <= rows; y++) {
            grid.moveTo(0, y * size);
            grid.lineTo(cols * size, y * size);
        }

        // 高亮 “恩人大道” (The Silk Road) - 第 9 和 10 行 (索引)
        // 对应 y = 9 * 64 到 11 * 64
        grid.rect(0, 9 * 64, 40 * 64, 2 * 64);
        grid.fill({ color: 0x333300, alpha: 0.3 }); // 半透明黄色

        this.gridLayer.addChild(grid);
    }
}
