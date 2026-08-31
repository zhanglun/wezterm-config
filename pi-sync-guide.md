# pi 跨设备配置同步指南

> 在新设备上让 pi 阅读此文件，按照下面的步骤操作即可完成配置同步。
> 本文件记录的是本机当前同步基准（2026-08-31）。插件清单、默认模型和扩展清单以本机当前状态为准；其余配置须按目标设备实际情况合并。

## 操作步骤

### 1. 创建目录结构

```bash
mkdir -p ~/.pi/agent/themes ~/.pi/agent/skills ~/.pi/agent/extensions
```

### 2. 写入主配置 `~/.pi/agent/settings.json`

```json
{
  "theme": "dracula",
  "defaultProvider": "custom-openai",
  "defaultModel": "gpt-5.6-terra",
  "defaultThinkingLevel": "high",
  "externalEditor": "zed --wait",
  "packages": [
    "npm:pi-simplify",
    "npm:pi-chrome",
    "npm:pi-markdown-preview",
    "npm:pi-subagents",
    "npm:pi-web-access",
    "npm:pi-execution-time",
    "npm:pi-powerline-footer",
    "npm:pi-chrome-dev-tools",
    "npm:@juicesharp/rpiv-ask-user-question",
    "npm:@narumitw/pi-goal",
    "../../Documents/mine/pi-pet",
    "npm:pi-mcp-adapter",
    "npm:@dietrichgebert/ponytail",
    "npm:@fradser/pi-monitor",
    "npm:@ff-labs/pi-fff"
  ]
}
```

> 这是需要合并的关键字段示例，不是完整覆盖模板。保留目标设备已有的 `lastChangelogVersion`、重试、终端、subagents 等本地配置；`../../Documents/mine/pi-pet` 是本机路径，跨设备需单独克隆/调整。

**注意**：如果此文件已存在，保留 `lastChangelogVersion` 字段，合并其余内容而非覆盖。

本机插件按用途分组如下（截至 2026-08-31）：

- 工作流与质量：`pi-simplify`、`pi-subagents`、`pi-goal`、`rpiv-ask-user-question`、`ponytail`
- MCP 与搜索：`pi-mcp-adapter`、`pi-fff`
- Web 与浏览器：`pi-web-access`、`pi-chrome`、`pi-chrome-dev-tools`、`pi-markdown-preview`
- 状态栏、计时与监控：`pi-execution-time`、`pi-powerline-footer`、`pi-monitor`
- 本地项目包：`pi-pet`（路径依赖，不属于 npm 包）

本次升级后的 npm 版本：

| 包 | 版本 |
|---|---:|
| `pi-simplify` | `0.2.3` |
| `pi-chrome` | `0.15.46` |
| `pi-markdown-preview` | `0.16.0` |
| `pi-subagents` | `0.61.0` |
| `pi-web-access` | `0.27.0` |
| `pi-execution-time` | `0.2.0` |
| `pi-powerline-footer` | `0.16.0` |
| `pi-chrome-dev-tools` | `0.1.0` |
| `@juicesharp/rpiv-ask-user-question` | `2.8.0` |
| `@narumitw/pi-goal` | `0.54.4` |
| `pi-mcp-adapter` | `2.31.0` |
| `@dietrichgebert/ponytail` | `4.9.0` |
| `@fradser/pi-monitor` | `2.1.0` |
| `@ff-labs/pi-fff` | `0.10.6` |

### 3. 注册自定义模型 `~/.pi/agent/models.json`

本机默认使用 `custom-openai`，需要在目标设备按实际 API 网关配置 provider 和模型。不要复制包含密钥的完整文件；建议手动合并结构，密钥通过环境变量或目标 provider 支持的认证方式配置。示例：

```json
{
  "zai-coding-cn": {
    "models": [
      {
        "id": "glm-4.7",
        "name": "GLM-4.7",
        "api": "openai-completions",
        "provider": "zai-coding-cn",
        "baseUrl": "https://open.bigmodel.cn/api/coding/paas/v4",
        "reasoning": true,
        "input": ["text"],
        "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
        "compat": {
          "supportsStore": false,
          "supportsDeveloperRole": false,
          "supportsReasoningEffort": false,
          "maxTokensField": "max_tokens",
          "thinkingFormat": "zai",
          "zaiToolStream": true
        },
        "contextWindow": 204800,
        "maxTokens": 131072
      }
    ]
  }
}
```

`zai-coding-cn` 的模型目录也可能由 `~/.pi/agent/models-store.json` 自动刷新；如果目标设备继续使用 ZAI，再按需保留/刷新该 provider。若已有 `models.json`，合并 provider 而非覆盖。

### 4. 安装 Dracula 主题

```bash
curl -fsSL https://raw.githubusercontent.com/dracula/pi-coding-agent/main/dracula.json \
  -o ~/.pi/agent/themes/dracula.json
```

### 5. 恢复 Skills

当前 `~/.pi/agent/skills/` 目录不存在；本机可用的 pi Skills 由已安装包提供，主要来自：

- `pi-subagents` — `~/.pi/agent/npm/node_modules/pi-subagents/skills/`
- `pi-chrome-dev-tools` — `~/.pi/agent/npm/node_modules/pi-chrome-dev-tools/skills/`

另有一套独立的 Agent Skills 位于 `~/.agents/skills/`，不属于 pi 配置目录；如需跨设备使用，应单独同步。当前已确认存在的设计/工程 Skills 包括 `fireworks-tech-graph`、`hallmark`、`impeccable` 等。

不要把不存在或未确认来源的 `devils-advocate`、`grill-me` 写成必然可恢复项；如果这些自定义 Skill 在其他设备存在，应从源设备单独备份。

### 6. 恢复扩展

将以下已确认存在的文件或目录从旧设备整体拷贝到 `~/.pi/agent/extensions/`：

- `clickable-file-paths.ts` — 可点击文件路径
- `deepseek-usage.ts` — DeepSeek 用量/费用状态栏；依赖当前设备的 DeepSeek 认证
- `friendly-provider-status.ts` — provider 状态显示
- `herdr-agent-state.ts` — agent 状态显示
- `working-timer.ts` — TUI 工作时长显示
- `zai-quota-normalizer.ts` — ZAI 配额显示规范化
- `subagent/` — `pi-subagents` 的本地配置目录；需同时安装 `npm:pi-subagents`

`subagent/config.json` 包含并发、工作树目录与子代理限制等本机工作流参数，应随目录一并同步。当前没有确认存在的 `deepseek-balance.ts`，不要将其列为必需文件。

### 7. 登录认证

本机 `custom-openai` 使用自定义网关，目标设备应按实际方式配置，例如环境变量或 provider 配置。若使用 pi 支持的登录 provider，可执行：

```bash
pi auth check --provider <provider>
```

交互式登录请先启动 `pi`，再在交互界面执行 `/login`；具体 provider 以当前 pi 版本的登录菜单为准。

`auth.json` 含密钥，禁止跨设备明文复制。可用 `pi auth check --provider <provider>` 验证认证状态。

### 8. 按设备调整

- `httpProxy`：改为本机代理端口，没有代理就删掉这一行
- 字体/终端配置不在 pi 范围内，参考 wezterm-config 仓库

## 不同步的内容

| 路径 | 原因 |
|---|---|
| `~/.pi/agent/auth.json` | API 密钥 |
| `~/.pi/agent/sessions/` | 会话历史，设备本地 |
| `~/.pi/agent/npm/` | packages 自动安装 |
| `~/.pi/agent/bin/` | 平台相关二进制 |
| `deepseek-balance.json`、`deepseek-usage.json` 等缓存 | 运行时缓存 |

## 验证清单

- [ ] `pi` 版本为 `0.84.4` 或更高，启动无报错，主题为 dracula
- [ ] `/settings` 中 provider 为 `custom-openai`，模型 `gpt-5.6-terra`（或目标设备实际配置）
- [ ] `/skill` 列表包含已安装包提供的 Skills；独立 `~/.agents/skills/` 另行确认
- [ ] `pi list` 与本指南中的插件清单一致
- [ ] 网络请求正常；如使用代理，确认目标设备的代理端口
- [ ] `pi --offline --no-session -p 'Reply only: OK'` 启动冒烟测试通过
