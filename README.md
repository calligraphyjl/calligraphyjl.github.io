# CallIJL · 个人作品集

一个纯静态的个人主页：HTML + CSS + 原生 JavaScript，零依赖、零构建，克隆下来双击 `index.html` 即可打开。

**在线地址**：https://calligraphyjl.github.io/

## 页面模块

| 编号 | 模块 | 说明 |
| --- | --- | --- |
| — | Bing 搜索栏 | 页面最顶端，可直接跳转必应搜索 |
| — | 滚动公告条 | 横向无限滚动，悬停暂停 |
| 01 | 个人简介 | 首屏区域，纹样背景 |
| 02 | 喜欢的音乐 | Hip-hop / R&B，专辑封面卡片 |
| 03 | 项目展示 | 猜数字小游戏，代码 / README 标签页 |
| 04 | 文集与书法练习 | 诗词（6 图轮播）、小说（竖向阅读弹窗）、书法（3 竖幅 + 1 横幅） |
| 05 | 相册 | 猫猫狗狗与熊猫，点击放大 |
| 06 | 工具索引 | Tbox / GitHub / Git / BibiGPT |
| — | 进站弹窗 | 海报 + 点击任意处进入 |

## 特性

- **双主题**：深蓝（`#0a192f` + `#64ffda`）/ 米白（`#faf8f3` + `#4f7a6a`），右上角切换，选择写入 `localStorage`
- **响应式**：1440 / 820 / 390 三档实测无横向溢出；≤860px 导航折叠为抽屉菜单；≤768px 卡片单列、小说弹窗宽度 96%
- **交互**：滚动淡入、导航高亮、诗词展开、小说竖向滚动弹窗、相册灯箱、图片轮播
- **无障碍**：弹窗带 `role="dialog"` + `aria-modal`，Esc 关闭，焦点回归触发元素，支持 `prefers-reduced-motion`

## 目录结构

```
.
├─ index.html         页面结构
├─ css/style.css      全部样式（含两套主题变量）
├─ js/main.js         交互脚本
├─ images/            图片资源
└─ .nojekyll          跳过 GitHub Pages 的 Jekyll 处理
```

## 本地预览

直接双击 `index.html`；或在此目录起一个静态服务：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 部署（GitHub Pages）

推送到 `main` 分支后，在仓库 **Settings → Pages** 把 Source 设为 `Deploy from a branch` → `main` / `/ (root)`，几十秒后即可通过 https://calligraphyjl.github.io/ 访问。

## 修改指引

- 名字、一句话简介：`index.html` 中的 `.hero-name`、`.hero-tagline`
- 主题配色：`css/style.css` 顶部的 `:root[data-theme="navy"]` / `:root[data-theme="paper"]`
- 首屏背景：替换 `images/hero-bg.jpg` 即可，无需改代码
- 新增板块：复制一个 `<section class="sec">`，改 `id` 与 `.sec-num`，再往导航里加一条 `<a href="#新id" data-nav="新id">`
