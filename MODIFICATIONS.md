# 改动清单

本文件记录相对 [pot-app/pot-desktop](https://github.com/pot-app/pot-desktop) **3.0.7** 的全部修改。

基线提交：`d05a436`（tag `3.0.7`）

---

## 一、翻译服务修复

### `src/services/translate/chatglm/index.jsx`（重写）

原实现的三个问题：

1. **CORS 预检失败** —— 原代码用 webview 原生 `fetch()`。智谱 API 的
   `OPTIONS` 预检响应不返回任何 `Access-Control-*` 头（实测 0 个），
   浏览器直接拦截请求，表现为 `TypeError: Load failed`。
   改用 `import { fetch, Body } from '@tauri-apps/api/http'`，
   请求由 Rust 侧发出，不经过 CORS 检查。

2. **模型已下线** —— 默认值 `chatglm_turbo` 在智谱平台已停用。
   增加 `LEGACY_MODEL_MAP`，把 `chatglm_*` / `glm-4-flash` 等旧名
   映射到当前免费模型。

3. **鉴权格式过时** —— 原代码强制拆分 `id.secret` 并签 JWT。
   新版 Key 直接用 `Authorization: Bearer <key>` 即可。
   现在只有旧格式才走 JWT 分支。

附加改进：
- `glm-4.7-flash` 自动附带 `thinking: { type: 'disabled' }`（该模型默认思考，翻译用不上，关闭后耗时从 20s+ 降到 0.9s）
- 1305（限流）/ 1302（频率）自动重试一次，间隔 1.2s
- 错误按状态码分档提示（鉴权 / 限流 / 余额 / 模型不可用）
- SSE 流式解析兼容 `data:` 分片与整体 JSON 两种返回

### `src/services/translate/chatglm/Config.jsx`

模型下拉列表从 7 个旧模型改为 3 个实测免费模型，默认值改 `glm-4-flash-250414`。

---

## 二、界面主题

### `tailwind.config.cjs`（重写）

原本是 `#49cee9` 青色（浅色主题 `#3578e5` 蓝）→ 改为中性灰阶：

| 变量 | 浅色 | 深色 |
|---|---|---|
| background | `#FAFAFA` | `#161616` |
| foreground | `#171717` | `#F5F5F5` |
| content1 | `#FFFFFF` | `#1C1C1C` |
| content2 | `#F5F5F5` | `#212121` |
| divider | `#E8E8E8` | `#292929` |
| primary | `#171717` | `#FAFAFA` |

语义色 success / warning / danger 一并灰化，避免破坏单色调性。

### `src/style.css`（重写）

增加 CSS 变量层与基础排版：
- 系统字体栈、`-webkit-font-smoothing: antialiased`、字距 `-0.01em`
- 滚动条改为中性灰
- `::selection` 改为半透明黑/白

### `src/window/Config/index.jsx`

侧边栏背景改 `bg-content2/70`，减少纯色块观感。

### `src/window/Translate/components/LanguageArea/index.jsx`

语言选择条：圆角从 `rounded-[10px]` 改 `rounded-app`，加 `border border-divider`。

---

## 三、移除更新器

上游把更新清单版本号改为 `4.0.0`（产品名 `Manggo 1.0.0`），导致 3.0.7 每次启动都判定有新版本并弹窗。

| 文件 | 改动 |
|---|---|
| `src-tauri/src/updater.rs` | **删除** |
| `src-tauri/src/main.rs` | 删除 `check_update()` 调用与 import；删除 `updater_window` 注册 |
| `src-tauri/src/tray.rs` | 删除 10 种语言的「检查更新」菜单项（36 处引用）与回调 |
| `src-tauri/src/window.rs` | 删除 `updater_window()` 函数 |
| `src/window/Updater/index.jsx` | **删除**整个目录 |
| `src/App.jsx` | 从 `windowMap` 移除 updater 窗口 |
| `src/window/Config/pages/General/index.jsx` | 移除「启动时检查更新」开关 |
| `src/window/Config/pages/About/index.jsx` | 移除「检查更新」按钮 |
| `src-tauri/Cargo.toml` | 从 tauri features 移除 `updater` |
| `src-tauri/tauri.conf.json` | `updater.active = false`，移除 `endpoints` 与 `pubkey` |

---

## 四、图标

替换全套图标（`src-tauri/icons/`、`icons_mac/`、`public/icon.{png,svg}`）：

- 设计：黑白双弧标记，两条贝塞尔弧交错咬合，抽象几何，无具象物体
- 规格：macOS 网格 1024 画布 / 824 本体 / rx 185 / 80.5% 占比
- 源文件：`design/pot-mark.svg`
- 菜单栏 template：黑色双弧，透明底

---

## 五、其他

### `package.json`

增加 `pnpm.onlyBuiltDependencies: ["esbuild", "tesseract.js"]`，
避免 pnpm 12 因未批准的构建脚本中断安装。

### `.npmrc`（新增）

```
strict-peer-dependencies=false
enable-pre-post-scripts=true
```

### `src-tauri/tauri.macos.conf.json`

**本项目未包含 `signingIdentity`**。若需本地签名，自行添加：

```json
{"tauri":{"bundle":{"macOS":{"signingIdentity":"证书名称"}}}}
```

原因见 README「macOS 签名说明」：不稳定的签名会导致辅助功能授权反复失效。
