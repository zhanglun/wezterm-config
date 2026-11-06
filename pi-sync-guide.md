# pi 跨设备配置同步指南

> 在新设备上让 pi 阅读此文件，并**以本机配置为准覆盖目标设备的 pi 配置**。
> 本基准采集于 **2026-11-07**，本机 pi CLI 为 **1.5.0**。
>
> 覆盖前请确认目标设备不需要保留自己的 pi 设置。`auth.json`、`models.json` 中的密钥、会话和缓存不在同步范围内，必须按目标设备重新配置。

## 1. 本机基线

| 项目 | 本机值 |
|---|---|
| pi CLI | `1.5.0` |
| Node.js | `v22.23.4` |
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
- `extensions/`：只需补齐 `zcode-bigmodel-oauth.ts`，其余见第 6 节；
- `themes/dracula.json`：用本机 Dracula 主题**覆盖**目标文件；
- `pi-statusline.json`、`subagents.json`、`extensions/subagent/config.json`：本机不存在，**不要创建或同步**，见第 6、7 节；
- npm 包：按本指南的 package 清单重新安装/更新，以本机版本为准；
- `models.json`：只复制脱敏后的 provider/model 定义，密钥在目标设备重新填写；
- `auth.json`、会话、缓存、平台二进制：**禁止覆盖同步**。

如果目标设备有需要保留的设置，应先备份；本指南默认不合并目标设备配置。

## 3. 覆盖 `~/.pi/agent/settings.json`

将以下内容作为目标设备的完整 `~/.pi/agent/settings.json`。其中本机的 retry、terminal、subagents、powerline 等设置也属于覆盖基准，不要再与目标设备版本合并。

```json
{
  "lastChangelogVersion": "1.5.0",
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

- 早期基线里的 `../../Documents/mine/pi-pet` 本地路径依赖已移除，`packages` 中不要再加回；
- `extensions/zcode-bigmodel-oauth.ts` 是本机扩展文件路径，必须同时复制文件；源码已收录在本仓库 `pi/extensions/zcode-bigmodel-oauth.ts`，可直接复制；
- `lastChangelogVersion` 也按本机值覆盖，不保留目标设备旧值。

## 4. 覆盖并安装 npm 包

本机 `~/.pi/agent/npm/package.json` 的直接依赖及版本如下：

| 包 | 本机版本 |
|---|---:|
| `pi-simplify` | `0.2.3` |
| `pi-chrome` | `0.15.57` |
| `pi-markdown-preview` | `0.26.4` |
| `pi-subagents` | `0.86.0` |
| `pi-web-access` | `0.47.0` |
| `pi-execution-time` | `0.3.0` |
| `pi-powerline-footer` | `0.22.0` |
| `pi-chrome-dev-tools` | `0.1.0` |
| `@juicesharp/rpiv-ask-user-question` | `2.15.0` |
| `@narumitw/pi-goal` | `0.54.17` |
| `pi-mcp-adapter` | `7.0.1` |
| `@dietrichgebert/ponytail` | `5.3.3` |
| `@fradser/pi-monitor` | `2.3.1` |
| `@ff-labs/pi-fff` | `0.11.0` |
| `@plannotator/pi-extension` | `0.28.51` |

在目标设备覆盖 `settings.json` 后执行：

```bash
mkdir -p ~/.pi/agent/themes ~/.pi/agent/extensions
pi update
pi update --extensions
pi list
```

注意：`pi update` 只更新 pi 自身并**跳过**扩展安装，必须再执行一次 `pi update --extensions` 才会按 `settings.json` 的 `packages` 清单安装 npm 包。不要直接复制本机 `~/.pi/agent/npm/`，该目录包含平台相关依赖和自动安装内容。

## 5. 覆盖主题

```bash
curl -fsSL https://raw.githubusercontent.com/dracula/pi-coding-agent/main/dracula.json \
  -o ~/.pi/agent/themes/dracula.json
```

目标设备应使用该文件覆盖同名主题文件。

## 6. 覆盖本机扩展

本机 `~/.pi/agent/extensions/` 当前只有一个文件，源码收录在仓库内，直接复制即可：

```bash
mkdir -p ~/.pi/agent/extensions
cp pi/extensions/zcode-bigmodel-oauth.ts ~/.pi/agent/extensions/
```

该文件必须与 `settings.json` 中 `packages` 的 `extensions/zcode-bigmodel-oauth.ts` 条目同时存在，否则 pi 启动会报路径缺失。

历史基线还引用过以下扩展，但**本机与仓库均无源码**，只有旧源机器上有。需要时从源机器拷贝，拿不到就忽略（不装不影响 pi 启动，也不会被 `settings.json` 引用）：

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
extensions/subagent/config.json
```

- `extensions/subagent/config.json` 是 `npm:pi-subagents` 的可选配置，缺失时使用内置默认值，不影响启动；
- 当前没有发现 `deepseek-balance.ts`，不将它列为同步文件。

## 7. 附属配置

本机**没有** `pi-statusline.json`、`subagents.json`、`desktop/custom.css`，不需要补齐。

- 状态栏由 `npm:pi-powerline-footer` 提供，配置在 `settings.json` 的 `powerline` 键内（当前 `separator` 为 `dot`），该插件**不读独立的 json 文件**。它的内置 preset 只有 `default`、`minimal`、`compact`、`full`、`nerd`、`ascii`；
- 早期基线提到的 `pi-statusline.json`（palette `sunset`、density `compact`、10 个分段）属于另一个**未安装**的插件 `@narumitw/pi-statusline`，与本指南的包清单无关。不要安装，也不要补这个文件，它对 pi-powerline-footer 无效；
- subagent 的模型配置已在 `settings.json` 的 `subagents.agentOverrides` 内，不需要额外的 `subagents.json`。

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
design-taste-frontend  humanizer          impeccable
karpathy-guidelines    plannotator        plannotator-annotate
plannotator-inbox      plannotator-last   plannotator-review
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

- [ ] pi 版本为 `1.5.0` 或更高；
- [ ] `settings.json` 与本指南中的完整配置一致；
- [ ] 默认 provider 为 `custom-openai`，默认模型为 `gpt-5.6-terra`；
- [ ] `pi list` 与本指南的 package 清单一致（15 个 npm 包 + `extensions/zcode-bigmodel-oauth.ts`）；
- [ ] `~/.pi/agent/extensions/zcode-bigmodel-oauth.ts` 已复制；
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
