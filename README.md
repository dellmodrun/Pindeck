# Homemade Badge 本地版

这是 `https://homemadebadge.com/` 的本地前端包，包含原站单页中的全部区段、3D 交互、字体、图标、WebAssembly 固件模拟器和 Pump 应用数据。

## 启动

双击 `start-local.bat`，浏览器会打开：

`http://127.0.0.1:4173`

也可以在本目录运行：

```powershell
npm start
```

按 `Ctrl+C` 停止服务。

## 页面结构

- `#top`：首页与 3D 徽章故事
- `#token`：代币信息
- `#play`：浏览器固件模拟器与控制台
- `#inside`：材料、接线与固件说明

原站没有独立 URL 的子页面，导航项目均为上述单页锚点。

## 联网说明

页面主体、3D 模型、字体和模拟器均由本地文件提供。原站中指向 X、pump.fun、Solana devnet、IPFS 或水龙头的外部功能仍需联网；区块链交易及第三方服务不属于静态前端本身。
