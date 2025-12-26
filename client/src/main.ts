import './style.css';
import { Application } from 'pixi.js';
import { ResolutionManager } from './managers/ResolutionManager';
import { WorldContainer } from './containers/WorldContainer';
import { AssetManager } from './managers/AssetManager';
import { NetworkManager } from './managers/NetworkManager';
import { HUDContainer } from './containers/HUDContainer';

/**
 * 客户端入口 (Client Entry Point)
 * 
 * 职责：
 * 1. 初始化 PixiJS 应用
 * 2. 挂载 DOM
 * 3. 实例化核心容器 (World, HUD)
 * 4. 启动游戏主循环
 */
(async () => {
  // 1. 初始化资产配置 (设置像素采样模式)
  AssetManager.init();

  // 2. 创建 PixiJS 应用实例
  const app = new Application();

  await app.init({
    background: '#111', // 背景色：深色以突显像素内容
    resizeTo: window,   // 自动监听窗口大小
    antialias: false,   // 关闭抗锯齿 (像素风必须)
    roundPixels: true,  // 强制坐标取整 (防止像素偏移模糊)
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  // 挂载 Canvas 到页面
  document.body.appendChild(app.canvas);

  // 3. 初始屏幕适配
  ResolutionManager.updateScreen(app);

  // 4. 构建场景层级
  // WorldContainer: 游戏世界 (背景, 网格, 角色) - 受 ResolutionManager 缩放控制
  const world = new WorldContainer();
  app.stage.addChild(world);

  // Networking: 连接到 "Divine Server"
  const network = new NetworkManager();

  // HUDContainer: 用户界面 (UI) - 同样受缩放控制 (根据设计文档，HDU 暂时跟随 stage 缩放)
  // 未来如果需要 HUD 固定大小，可以将其移出 stage 或另行处理
  const hud = new HUDContainer(network);
  app.stage.addChild(hud);

  // 5. 游戏状态同步
  let latestSnapshot: any = null;

  network.onSnapshot = (data) => {
    latestSnapshot = data;
  };

  // 6. 开启主循环 (Render Loop)
  app.ticker.add((ticker) => {
    // 只有收到过快照才开始更新实体
    if (latestSnapshot) {
      // 传递 deltaTime 用于平滑插值
      world.updateEntities(latestSnapshot.entities, ticker.deltaTime);
    }
  });

  // 7. 监听窗口变化
  window.addEventListener('resize', () => {
    app.resize(); // Pixi 内部重绘尺寸
    ResolutionManager.updateScreen(app); // 调整逻辑缩放
  });

  console.log('[Client] 恩人协议客户端启动完成 (Benefactor Protocol Client Initialized)');
})();
