import { Application } from 'pixi.js';

/**
 * 分辨率管理器 (Resolution Manager)
 * 负责处理屏幕适配、缩放和坐标转换。
 * 
 * 核心设计：
 * - 目标逻辑分辨率：2560 x 1280 (40列 x 20行，每格 64px)
 * - 适配策略：保持纵横比缩放 (Letterbox)，确保游戏逻辑坐标系永远一致。
 */
export class ResolutionManager {
    // 逻辑宽度：40 * 64px
    public static readonly TARGET_WIDTH = 2560;
    // 逻辑高度：20 * 64px
    public static readonly TARGET_HEIGHT = 1280;

    /**
     * 更新屏幕尺寸适配
     * 应在初始化和 resize 事件中调用。
     * @param app PixiJS Application 实例
     */
    static updateScreen(app: Application) {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // 计算缩放比例：取宽度比和高度比的较小值，保证内容全部可见且不变形
        const scale = Math.min(screenW / ResolutionManager.TARGET_WIDTH, screenH / ResolutionManager.TARGET_HEIGHT);

        // 应用缩放至 Stage (根容器)
        // 这样所有的子容器（World, Grid 等）只需要关心逻辑坐标 (0 - 2560)，无需关心物理屏幕
        app.stage.scale.set(scale);

        // 计算居中偏移量
        const newX = (screenW - ResolutionManager.TARGET_WIDTH * scale) / 2;
        const newY = (screenH - ResolutionManager.TARGET_HEIGHT * scale) / 2;

        app.stage.x = newX;
        app.stage.y = newY;

        console.log(`[Screen] Resized to ${screenW}x${screenH}, Scale: ${scale.toFixed(4)}, Offset: (${newX.toFixed(0)}, ${newY.toFixed(0)})`);
    }
}
