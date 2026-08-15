# pi 跨设备配置同步指南

> 在新设备上让 pi 阅读此文件，按照下面的步骤操作即可完成配置同步。
> 本文件记录的是基准配置（来源：Ubuntu 主力机，2025-08-15）。

## 操作步骤

### 1. 创建目录结构

```bash
mkdir -p ~/.pi/agent/themes ~/.pi/agent/skills ~/.pi/agent/extensions
```

### 2. 写入主配置 `~/.pi/agent/settings.json`

```json
{
  "theme": "dracula",
  "defaultProvider": "zai-coding-cn",
  "defaultModel": "glm-5.3",
  "defaultThinkingLevel": "high",
  "hideThinkingBlock": true,
  "enableSkillCommands": true,
  "transport": "sse",
  "httpProxy": "http://127.0.0.1:7897",
  "packages": [
    "npm:@calesennett/pi-codex-usage",
    "npm:pi-web-access",
    "npm:pi-simplify",
    "npm:awesome-pi-themes",
    "npm:@odinlayer/pi-statusbar",
    "npm:@juicesharp/rpiv-ask-user-question",
    "npm:@narumitw/pi-plan-mode",
    "npm:@narumitw/pi-goal"
  ],
  "pi-codex-usage": { "usageMode": "used" }
}
```

**注意**：如果此文件已存在，保留 `lastChangelogVersion` 字段，合并其余内容而非覆盖。

### 3. 注册自定义模型 `~/.pi/agent/models-store.json`

Provider `zai-coding-cn` 需要手动注册模型。最小示例（glm-4.7）：

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

`glm-5-turbo`、`glm-5.3` 等模型结构相同，只改 `id` 和 `name`。如果已有此文件，合并 provider 而非覆盖。

### 4. 安装 Dracula 主题

```bash
curl -fsSL https://raw.githubusercontent.com/dracula/pi-coding-agent/main/dracula.json \
  -o ~/.pi/agent/themes/dracula.json
```

### 5. 恢复 Skills

以下 skill 目录需从旧设备整体拷贝（含 SKILL.md），放到 `~/.pi/agent/skills/` 下：

- `devils-advocate` — 反迎合对话准则（自定义，务必同步）
- `fireworks-tech-graph` — 技术图表生成
- `grill-me` / `grilling` — 拷问式思维压测
- `hallmark` — 设计规范
- `impeccable` — 前端设计/审查

若无法从旧设备拷贝，`fireworks-tech-graph`、`grilling`、`hallmark`、`impeccable` 可从各自上游仓库重新安装；`devils-advocate` 和 `grill-me` 是纯本地自定义，无上游，**丢失不可恢复**。

### 6. 恢复扩展

- `deepseek-balance.ts` → `~/.pi/agent/extensions/`（自定义扩展，从旧设备拷贝，无上游）

### 7. 登录认证

```bash
# 交互式登录 zai（不要复制旧设备的 auth.json）
pi auth login
```

或按当前设备实际的认证方式操作。`auth.json` 含密钥，禁止跨设备明文复制。

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
| `deepseek-balance.json` 等缓存 | 运行时缓存 |

## 验证清单

- [ ] `pi` 启动无报错，主题为 dracula
- [ ] `/settings` 中 provider 为 zai-coding-cn，模型 glm-5.3
- [ ] skills 命令可用（`/skill` 列表包含 devils-advocate 等）
- [ ] 网络请求正常（如需代理确认端口）
