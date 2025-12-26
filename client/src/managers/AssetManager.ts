import { TextureStyle } from 'pixi.js';

/**
 * 资产管理器 (Asset Manager)
 * 负责全局纹理加载配置和资源预加载。
 */
export class AssetManager {
    static init() {
        // 强制使用 Nearest Neighbor (邻近采样) 缩放模式
        // 这是像素艺术 (Pixel Art) 风格的关键，确保图片缩放时边缘清晰锐利，而不是模糊。
        TextureStyle.defaultOptions.scaleMode = 'nearest';

        console.log('[AssetManager] 初始化完成: 已启用像素完美缩放模式 (Nearest Scaling)。');
    }
}
