# pot-desktop-mono

> 基于 [pot-app/pot-desktop](https://github.com/pot-app/pot-desktop) 3.0.7 的个人定制版
>
> 划词翻译工具 · 黑白单色界面 · 修复智谱翻译 · 移除强制更新

<br/>

## 这个项目是什么

这是 [Pot（派了个萌的翻译器）](https://github.com/pot-app/pot-desktop) 的一个 fork，在原作者 3.0.7 版本的基础上做了**界面重设计**和**功能修复**。

原项目是一个跨平台划词翻译软件，支持 20+ 翻译服务、截图 OCR、文本识别。本项目保留其全部核心能力，只针对个人使用场景做了以下调整。

**本仓库不是原创项目。** 全部基础代码归原作者所有，采用 GPL-3.0 协议。如果你想要原版，请访问 [pot-app/pot-desktop](https://github.com/pot-app/pot-desktop)。

<br/>

## 改了什么

### 1. 修复智谱 AI 翻译（原本完全不可用）

原版 `chatglm` 服务即使填入正确 API Key 也会报「网络请求失败」。三个独立原因：

| 问题 | 原因 | 修复 |
|---|---|---|
| CORS 拦截 | 浏览器 `fetch` 会先发 `OPTIONS` 预检，而智谱的预检响应**不返回任何 `Access-Control-*` 头** | 改用 Tauri 的 `@tauri-apps/api/http`，请求由 Rust 侧发出，不走 webview 的 CORS 检查 |
| 模型下线 | 默认模型 `chatglm_turbo` 早已在智谱平台下线 | 旧模型名自动映射到当前免费模型 |
| 鉴权方式 | 旧代码强制把 Key 拆成 `id.secret` 并签 JWT | 新版 Key 直接 `Bearer <key>`，只有旧格式才签 JWT |

同时排查了当时所有可用模型，只保留三个**官方标价「免费」**且在翻译场景实测可用的：

| 模型 | 上下文 | 实测中位耗时 | 说明 |
|---|---|---|---|
| `glm-4-flash-250414` | 128K | 0.66s | 默认，最稳 |
| `glm-4.7-flash` | 200K | 0.89s | 自动关闭 thinking，偶发 1305 已加重试 |
| `glm-4.6v-flash` | 128K | — | 多模态，高峰期易限流 |

### 2. 界面改黑白单色

移除原有的青色/陶土色强调色，全站改为中性灰阶：

- 浅色：画布 `#FAFAFA` / 卡片 `#FFFFFF` / 文字 `#171717`
- 深色：画布 `#161616` / 卡片 `#1C1C1C` / 文字 `#F5F5F5`
- 语义色（success / warning / danger）也一并灰化

参考 Claude Desktop 的克制风格：细边框代替色块、12px 圆角、系统字体。

### 3. 移除强制更新弹窗

上游把更新清单的版本号改成了 `4.0.0 / Manggo 1.0.0`，导致 3.0.7 每次启动都判定有新版本并弹出更新窗口。

本项目已完全移除更新器：删除 `updater.rs`、托盘菜单项、更新窗口、设置页开关，并在 `tauri.conf.json` 中设 `updater.active = false`。

### 4. 新图标

黑白双弧标记（`design/pot-mark.svg`），按 macOS 图标网格绘制：1024 画布 / 824 本体 / 185 圆角 / 80.5% 占比。

<br/>

## 构建

### 环境要求

- Node.js `^22.23.4 || ^24.22.1 || >=26.12.1`
- pnpm
- Rust（stable）
- macOS 需 Xcode Command Line Tools

### 步骤

```bash
pnpm install
pnpm tauri build --bundles app
```

产物在 `src-tauri/target/release/bundle/macos/pot.app`。

### macOS 签名说明

本项目**未附带代码签名证书**。若要本地构建并长期使用，需要注意：

> macOS 的辅助功能授权（划词翻译必需）是按**代码签名**绑定的。未签名的 adhoc 构建每次重新编译都会改变 cdhash，导致系统认为这是一个新程序，**已授予的辅助功能权限会失效**。

解决方案是创建一个本地自签名身份，并在 `src-tauri/tauri.macos.conf.json` 中指定 `signingIdentity`。这样每次构建的 Identifier 保持稳定，授权不会丢失。

<br/>

## 目录说明

```
├── src/                    # 前端（React + NextUI + Tailwind）
│   ├── services/translate/ # 翻译服务实现
│   ├── window/             # 各窗口（翻译 / 设置 / 识别）
│   └── style.css           # 全局主题
├── src-tauri/              # Rust 后端（Tauri）
│   ├── src/                # 主进程、托盘、窗口、服务端
│   └── icons/ icons_mac/   # 应用图标
├── design/                 # 图标源文件
└── MODIFICATIONS.md        # 完整改动清单
```

<br/>

## 许可

本项目遵循 **GPL-3.0**（与原项目一致），完整协议见 [LICENSE](./LICENSE)。

原始代码版权归 [pot-app](https://github.com/pot-app/pot-desktop) 所有。本 fork 的修改部分同样以 GPL-3.0 发布。

<br/>

## 致谢

- [pot-app/pot-desktop](https://github.com/pot-app/pot-desktop) — 原项目
- [Tauri](https://tauri.app/) · [React](https://react.dev/) · [NextUI](https://nextui.org/)
- [Phosphor Icons](https://phosphoricons.com/) — 曾使用的图标集
