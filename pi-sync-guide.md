# pi 跨设备配置同步指南

> 在新设备上让 pi 阅读此文件，并**以本机配置为准覆盖目标设备的 pi 配置**。
> 本基准采集于 **2026-11-05**，本机 pi CLI 为 **1.4.0**。
>
> 覆盖前请确认目标设备不需要保留自己的 pi 设置。`auth.json`、`models.json` 中的密钥、会话和缓存不在同步范围内，必须按目标设备重新配置。

## 1. 本机基线

| 项目 | 本机值 |
|---|---|
| pi CLI | `1.4.0` |
| Node.js | `v24.15.0` |
| 配置目录 | `~/.pi/agent/` |
| 主题 | `dracula` |
| 默认 provider | `custom-openai` |
| 默认模型 | `gpt-5.6-terra` |
| 默认思考级别 | `high` |
| 外部编辑器 | `zed --wait` |
| TUI 模式 | `regular` |

## 2. 覆盖同步原则

在目标设备执行同步时，按以下原则处理：

- `settings.json`：用本机版本**覆盖**目标设备版本；
- `extensions/`：用本机确认存在的扩展**覆盖/补齐**目标目录；
- `themes/dracula.json`：用本机 Dracula 主题**覆盖**目标文件；
- `extensions/subagent/config.json`、`pi-statusline.json`、`subagents.json`：用本机版本**覆盖**目标文件；
- npm 包：按本指南的 package 清单重新安装/更新，以本机版本为准；
- `models.json`：只复制脱敏后的 provider/model 定义，密钥在目标设备重新填写；
- `auth.json`、会话、缓存、平台二进制：**禁止覆盖同步**。

如果目标设备有需要保留的设置，应先备份；本指南默认不合并目标设备配置。

## 3. 覆盖 `~/.pi/agent/settings.json`

将以下内容作为目标设备的完整 `~/.pi/agent/settings.json`。其中本机的 retry、terminal、subagents、powerline 等设置也属于覆盖基准，不要再与目标设备版本合并。

```json
{
  "lastChangelogVersion": "1.4.0",
  "theme": "dracula",
  "externalEditor": "zed --wait",
  "defaultProvider": "custom-openai",
  "defaultModel": "gpt-5.6-terra",
  "defaultThinkingLevel": "high",
  "retry": {
    "enabled": true,
    "maxRetries": 4,
    "baseDelayMs": 2000,
    "provider": {
      "maxRetries": 0,
      "maxRetryDelayMs": 60000
    }
  },
  "terminal": {
    "showTerminalProgress": true
  },
  "subagents": {
    "defaultModel": "custom-openai/gpt-5.6-luna",
    "defaultThinking": "low",
    "agentOverrides": {
      "scout": {
        "model": "custom-openai/gpt-5.6-luna",
        "thinking": "low",
        "defaultContext": "fresh",
        "acceptanceRole": "read-only"
      },
      "researcher": {
        "model": "custom-openai/gpt-5.6-luna",
        "thinking": "low",
        "defaultContext": "fresh",
        "acceptanceRole": "read-only"
      },
      "context-builder": {
        "model": "custom-openai/gpt-5.6-terra",
        "thinking": "medium",
        "defaultContext": "fresh",
        "acceptanceRole": "read-only"
      },
      "planner": {
        "model": "custom-openai/gpt-5.6-terra",
        "thinking": "medium",
        "defaultContext": "fork",
        "acceptanceRole": "read-only"
      },
      "oracle": {
        "model": "custom-openai/gpt-5.6-sol",
        "thinking": "high",
        "defaultContext": "fork",
        "acceptanceRole": "read-only"
      },
      "advisor": {
        "model": "custom-openai/gpt-5.6-sol",
        "thinking": "high",
        "defaultContext": "fork",
        "acceptanceRole": "read-only"
      },
      "reviewer": {
        "model": "custom-openai/gpt-5.6-sol",
        "thinking": "high",
        "defaultContext": "fresh",
        "acceptanceRole": "read-only"
      },
      "worker": {
        "model": "custom-openai/gpt-5.6-sol",
        "thinking": "medium",
        "defaultContext": "fork",
        "acceptanceRole": "writer"
      },
      "delegate": {
        "model": "custom-openai/gpt-5.6-luna",
        "thinking": "low",
        "defaultContext": "fresh"
      }
    }
  },
  "powerline": {
    "separator": "dot"
  },
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
    "npm:@ff-labs/pi-fff",
    "extensions/zcode-bigmodel-oauth.ts",
    "npm:@plannotator/pi-extension"
  ],
  "extensions": [
    "-builtin:mcp"
  ],
  "tuiMode": "regular"
}
```

注意：

- `../../Documents/mine/pi-pet` 是本机路径依赖。目标设备需将 pi-pet 克隆到对应路径；不需要时从 `packages` 中删除；
- `extensions/zcode-bigmodel-oauth.ts` 是本机扩展文件路径，必须同时复制文件；
- `lastChangelogVersion` 也按本机值覆盖，不保留目标设备旧值。

## 4. 覆盖并安装 npm 包

本机 `~/.pi/agent/npm/package.json` 的直接依赖及版本如下：

| 包 | 本机版本 |
|---|---:|
| `pi-simplify` | `0.2.3` |
| `pi-chrome` | `0.15.57` |
| `pi-markdown-preview` | `0.26.4` |
| `pi-subagents` | `0.84.0` |
| `pi-web-access` | `0.47.0` |
| `pi-execution-time` | `0.3.0` |
| `pi-powerline-footer` | `0.22.0` |
| `pi-chrome-dev-tools` | `0.1.0` |
| `@juicesharp/rpiv-ask-user-question` | `2.15.0` |
| `@narumitw/pi-goal` | `0.54.15` |
| `pi-mcp-adapter` | `7.0.1` |
| `@dietrichgebert/ponytail` | `5.3.3` |
| `@fradser/pi-monitor` | `2.3.1` |
| `@ff-labs/pi-fff` | `0.11.0` |
| `@plannotator/pi-extension` | `0.28.49` |

在目标设备覆盖 `settings.json` 后执行：

```bash
mkdir -p ~/.pi/agent/themes ~/.pi/agent/extensions
pi update
pi list
```

`pi update` 会根据 `settings.json` 的 package 清单安装/更新包。不要直接复制本机 `~/.pi/agent/npm/`，该目录包含平台相关依赖和自动安装内容。

## 5. 覆盖主题

```bash
curl -fsSL https://raw.githubusercontent.com/dracula/pi-coding-agent/main/dracula.json \
  -o ~/.pi/agent/themes/dracula.json
```

目标设备应使用该文件覆盖同名主题文件。

## 6. 覆盖本机扩展

以下是本机 `~/.pi/agent/extensions/` 中已确认存在的文件/目录。将它们复制到目标设备对应路径；同名文件以本机版本覆盖：

```text
extensions/bounded-compaction.ts
extensions/clickable-file-paths.ts
extensions/deepseek-usage.ts
extensions/friendly-provider-status.ts
extensions/herdr-agent-state.ts
extensions/orca-agent-status.ts
extensions/orca-prefill.ts
extensions/orca-titlebar-spinner.ts
extensions/working-timer.ts
extensions/zai-quota-normalizer.ts
extensions/zcode-bigmodel-oauth.ts
extensions/subagent/config.json
```

特别说明：

- `extensions/subagent/config.json` 必须与 `npm:pi-subagents` 一起覆盖；
- `zcode-bigmodel-oauth.ts` 必须与 `settings.json` 中的路径配置一起覆盖；
- 当前没有发现 `deepseek-balance.ts`，不将它列为同步文件；
- 目标设备若需要清理本机不存在的旧扩展，可先备份 `extensions/` 后按本机文件清单清理。

## 7. 覆盖附属配置

以下文件属于本机配置基准，可从源设备复制并覆盖目标设备同路径文件：

```text
~/.pi/agent/pi-statusline.json
~/.pi/agent/subagents.json
~/.pi/agent/desktop/custom.css   # 可选
```

本机 `pi-statusline.json` 的主要配置：

- palette：`sunset`
- density：`compact`
- separator：`none`
- 分段：provider、model、thinking、cwd、branch、tools、context、tokens、cost、time

`subagents.json` 保存本机的 model profiles，包括 `sdd-*`、`review-*`、`gentle-ai-*`、`jd-*` 等 profile。应直接复制本机文件，不要手动拼接。

## 8. 覆盖模型定义，但重新填写认证

本机有两个 provider：

| Provider | API | 本机模型 |
|---|---|---|
| `custom-openai` | OpenAI Completions | `gpt-5.3-codex-spark`、`gpt-5.4`、`gpt-5.4-mini`、`gpt-5.5`、`gpt-5.6-luna`、`gpt-6-luna`、`gpt-5.6-sol`、`gpt-6.1-sol`、`gpt-6-sol`、`gpt-6-astra`、`gpt-5.6-terra`、`grok-4.6`、`grok-4.5`、`grok-4.3`、`grok-4.20-0309-reasoning`、`grok-4.20-0309-non-reasoning`、`grok-4.20-multi-agent-0309`、`grok-3-mini`、`grok-3-mini-fast`、`grok-composer-2.5-fast`、`grok-build-0.1` |
| `volces-ark` | OpenAI Completions | `ark-code-latest` |

`~/.pi/agent/models.json` 含 API key，不能直接复制。目标设备应创建/覆盖对应 provider 和模型定义，然后填入目标设备自己的密钥。不要把以下本机网关地址当作通用地址，目标设备应确认网络可达性：

- `custom-openai`：`http://<custom-openai-host>:<port>/v1`；
- `volces-ark`：`https://ark.cn-beijing.volces.com/api/plan/v3`。

这两个地址来自本机 `models.json`；目标设备若网络环境相同，可按本机值填写，否则替换为目标设备可访问的地址。

`models-store.json` 只保存自动刷新的模型目录缓存。本机当前缓存了 `zai-coding-cn` 和 `deepseek`，不作为同步配置，不要覆盖目标设备缓存。

认证检查：

```bash
pi auth check --provider custom-openai
pi auth check --provider volces-ark
```

## 9. 独立 Agent Skills

本机 `~/.pi/agent/skills/` 没有自定义文件。由 pi 包提供的 Skills 会随包自动加载：

- `pi-subagents/skills/`：`pi-subagents`、`council-mode`；
- `pi-chrome-dev-tools/skills/`：`chrome-dev-tools`。

本机另有独立的 `~/.agents/skills/`，不属于 pi 配置目录。需要同步时，以本机目录整体覆盖目标设备对应目录。当前已确认的目录包括：

```text
apple-design        archify                 auto-commit
banner-design       brand                   code-reading-docs
design              design-system           fireworks-tech-graph
frontend-design     hallmark                hand-drawn
hatch-pet           humanizer               imagegen
impeccable          karpathy-guidelines    pixel-asset-forge
plannotator         research                research-add-fields
research-add-items  research-deep           research-report
slides              taste-skill             technical-diagram-routing
ui-styling
```

## 10. 禁止覆盖同步的内容

| 路径 | 原因 |
|---|---|
| `~/.pi/agent/auth.json` | API/OAuth 凭据 |
| `~/.pi/agent/models.json` 中的 API key | 敏感密钥，目标设备重新填写 |
| `~/.pi/agent/sessions/` | 会话历史可能包含项目内容 |
| `~/.pi/agent/npm/` | 平台相关，由 pi 自动安装 |
| `~/.pi/agent/bin/` | 平台相关二进制 |
| `~/.pi/agent/models-store.json` | 自动刷新缓存 |
| `~/.pi/agent/mcp-*.json` | MCP 缓存/引导状态 |
| `~/.pi/agent/fff/` | 查询历史与 frecency 数据库 |
| `~/.pi/agent/web-search-cache/` | Web 搜索缓存 |
| `~/.pi/agent/run-history.jsonl` | 本机运行历史 |
| `deepseek-usage.json` 等用量缓存 | 运行时缓存 |

本机没有发现独立的 `~/.pi/agent/mcp.json` 配置文件。MCP server 应在目标设备按实际项目和账号重新配置。

## 11. 覆盖后的验证

```bash
pi --version
pi list
pi auth check --provider custom-openai
pi auth check --provider volces-ark
pi --offline --no-session -p 'Reply only: OK'
```

检查项：

- [ ] pi 版本为 `1.4.0` 或更高；
- [ ] `settings.json` 与本指南中的完整配置一致；
- [ ] 默认 provider 为 `custom-openai`，默认模型为 `gpt-5.6-terra`；
- [ ] `pi list` 与本指南的 package 清单一致；
- [ ] 扩展文件和 `extensions/subagent/config.json` 已按本机版本覆盖；
- [ ] Dracula 主题已覆盖；
- [ ] `pi auth check` 在目标设备通过；
- [ ] offline 冒烟测试输出 `OK`。

## 12. 本机配置检查命令

后续以本机为准重新生成/核对本指南时：

```bash
pi --version
pi list
cat ~/.pi/agent/settings.json
cat ~/.pi/agent/npm/package.json
find ~/.pi/agent/extensions -maxdepth 2 -type f | sort
find ~/.agents/skills -mindepth 1 -maxdepth 1 -type d | sort
```
