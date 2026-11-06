import {
  openAICompletionsApi,
  createAssistantMessageEventStream,
  type AssistantMessageEventStream,
  type Model,
  type OAuthCredentials,
  type OAuthLoginCallbacks,
  type SimpleStreamOptions,
} from "@earendil-works/pi-ai/compat";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PROVIDER = "zcode-bigmodel";
const BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";
const AUTHORIZE_URL = "https://bigmodel.cn/login";
const ZCODE_ORIGIN = "https://zcode.z.ai";
const CLI_INIT_URL = `${ZCODE_ORIGIN}/api/v1/oauth/cli/init`;
const CLI_POLL_URL = `${ZCODE_ORIGIN}/api/v1/oauth/cli/poll`;
const QUOTA_URL = "https://open.bigmodel.cn/api/monitor/usage/quota/limit";
const REDIRECT_URI = "zcode://oauth/callback";
const APP_VERSION = "3.14.3";
const CODING_KEY_NAME = "zcode-api-key";

const models = [
  {
    id: "glm-5.3",
    name: "GLM-5.3 (ZCode OAuth)",
    reasoning: true,
    input: ["text"] as ("text")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1_000_000,
    maxTokens: 131_072,
    thinkingLevelMap: { minimal: null, low: null, medium: null, high: "high", xhigh: null, max: "max" },
    compat: { thinkingFormat: "zai", supportsReasoningEffort: true },
  },
  {
    id: "glm-5.3-flash",
    name: "GLM-5.3-Flash (ZCode OAuth)",
    reasoning: true,
    input: ["text"] as ("text")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1_000_000,
    maxTokens: 131_072,
    thinkingLevelMap: { minimal: null, low: null, medium: null, high: "high", xhigh: null, max: "max" },
    compat: { thinkingFormat: "zai", supportsReasoningEffort: true },
  },
  {
    id: "glm-5.2",
    name: "GLM-5.2 (ZCode OAuth)",
    reasoning: true,
    input: ["text"] as ("text")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1_000_000,
    maxTokens: 131_072,
    thinkingLevelMap: { minimal: null, low: null, medium: null, high: "high", xhigh: null, max: "max" },
    compat: { thinkingFormat: "zai", supportsReasoningEffort: true },
  },
] satisfies readonly Model<"openai-completions">[];

function randomHex(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return [...value].map((item) => item.toString(16).padStart(2, "0")).join("");
}

async function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw signal.reason ?? new Error("OAuth cancelled");
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason ?? new Error("OAuth cancelled"));
    }, { once: true });
  });
}

async function login(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials> {
  const pollToken = randomHex();
  const init = await fetch(CLI_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pollToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider: "bigmodel" }),
    signal: callbacks.signal,
  });
  const initBody = (await init.json()) as Record<string, any>;
  const initData = initBody.data ?? {};
  if (!init.ok || initBody.code !== 0 || typeof initData.flow_id !== "string" || typeof initData.authorize_url !== "string") {
    throw new Error(initBody.msg || `OAuth 初始化失败（HTTP ${init.status}）`);
  }

  const authorize = new URL(initData.authorize_url);
  // BigModel's CLI flow redirects through ZCode's HTTPS callback first.
  // Directly using zcode:// here opens the app but does not complete the CLI flow.
  const zcodeRedirect = new URL(`${ZCODE_ORIGIN}/app/oauth/login`);
  zcodeRedirect.searchParams.set("redirect", REDIRECT_URI);
  zcodeRedirect.searchParams.set("app_version", APP_VERSION);
  authorize.searchParams.set("redirect", zcodeRedirect.toString());
  callbacks.onAuth({
    url: authorize.toString(),
    instructions: "必须允许浏览器打开 ZCode。ZCode 接收 zcode:// 回调后，服务端才会把轮询状态改为 ready；取消打开会一直 pending。不要复制 URL。",
  });

  const expiresAt = Number(initData.expires_at) * 1000;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("OAuth 初始化返回了无效的过期时间，请重试");
  }
  const interval = Math.max(1000, Number(initData.poll_interval_sec || 2) * 1000);
  const flowId = encodeURIComponent(initData.flow_id);
  while (Date.now() < expiresAt) {
    await wait(interval, callbacks.signal);
    const response = await fetch(`${CLI_POLL_URL}/${flowId}`, {
      headers: { Authorization: `Bearer ${pollToken}` },
      signal: callbacks.signal,
    });
    const body = (await response.json()) as Record<string, any>;
    if (!response.ok) throw new Error(body.msg || `OAuth 轮询失败（HTTP ${response.status}）`);
    const data = body.data ?? {};
    if (body.code === 0 && data.status === "pending") {
      callbacks.onProgress?.("等待 ZCode 接收回调（请允许打开 ZCode）…");
      continue;
    }
    if (body.code !== 0 || data.status !== "ready") {
      throw new Error(body.msg || "OAuth 授权失败");
    }

    const access = data.bigmodel?.access_token ?? data.bigmodel?.accessToken;
    const refresh = data.bigmodel?.refresh_token ?? data.bigmodel?.refreshToken;
    if (typeof access !== "string" || !access) throw new Error("OAuth 响应中没有 BigModel access_token");
    return {
      access,
      refresh: typeof refresh === "string" ? refresh : "",
      // The ZCode CLI flow has no documented Pi-compatible refresh endpoint.
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      zcodeJwtToken: typeof data.token === "string" ? data.token : undefined,
    };
  }
  throw new Error("OAuth 登录超时，请重新执行 /login zcode-bigmodel");
}

async function refresh(credentials: OAuthCredentials, signal: AbortSignal): Promise<OAuthCredentials> {
  throw new Error("BigModel ZCode OAuth refresh endpoint 未公开，请重新执行 /login zcode-bigmodel");
}

let cachedCodingKey: { oauth: string; key: string } | undefined;

async function resolveCodingApiKey(oauthToken: string, signal?: AbortSignal): Promise<string> {
  if (cachedCodingKey?.oauth === oauthToken) return cachedCodingKey.key;
  const headers = { Authorization: oauthToken, "Content-Type": "application/json" };
  const customerResponse = await fetch("https://open.bigmodel.cn/api/biz/customer/getCustomerInfo", { headers, signal });
  const customerBody = (await customerResponse.json()) as Record<string, any>;
  const customer = customerBody.data;
  const org = customer?.organizations?.find((item: Record<string, any>) =>
    Array.isArray(item.projects) && item.projects.some((project: Record<string, any>) => String(project.projectType) !== "2"),
  );
  const project = org?.projects?.find((item: Record<string, any>) => String(item.projectType) !== "2");
  if (!customerResponse.ok || !org?.organizationId || !project?.projectId) {
    throw new Error(customerBody.msg || `无法从 OAuth 账号解析 BigModel 项目（HTTP ${customerResponse.status}）`);
  }

  const keyUrl = `https://open.bigmodel.cn/api/biz/v1/organization/${encodeURIComponent(org.organizationId)}/projects/${encodeURIComponent(project.projectId)}/api_keys`;
  const listResponse = await fetch(keyUrl, { headers, signal });
  let listBody = (await listResponse.json()) as Record<string, any>;
  let key = Array.isArray(listBody.data) ? listBody.data.find((item: Record<string, any>) => item.name === CODING_KEY_NAME) : undefined;
  if (!key) {
    const createResponse = await fetch(keyUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: CODING_KEY_NAME }),
      signal,
    });
    listBody = (await createResponse.json()) as Record<string, any>;
    key = listBody.data;
  }
  if (!key?.apiKey) throw new Error(listBody.msg || "OAuth 账号没有可用的 BigModel Coding Plan key");

  const copyResponse = await fetch(`${keyUrl}/copy/${encodeURIComponent(key.apiKey)}`, { headers, signal });
  const copyBody = (await copyResponse.json()) as Record<string, any>;
  const secretKey = copyBody.data?.secretKey;
  if (!copyResponse.ok || typeof secretKey !== "string" || !secretKey) {
    throw new Error(copyBody.msg || `无法获取 BigModel Coding Plan key secret（HTTP ${copyResponse.status}）`);
  }
  const codingKey = `${key.apiKey}.${secretKey}`;
  cachedCodingKey = { oauth: oauthToken, key: codingKey };
  return codingKey;
}

function streamZCode(
  model: Model<"openai-completions">,
  context: Parameters<ReturnType<typeof openAICompletionsApi>["streamSimple"]>[1],
  options?: SimpleStreamOptions,
): AssistantMessageEventStream {
  const stream = createAssistantMessageEventStream();
  (async () => {
    try {
      const token = options?.apiKey?.trim();
      if (!token) throw new Error("没有 BigModel OAuth token，请先执行 /login zcode-bigmodel");
      // The OAuth token authorizes BigModel account APIs; the coding endpoint
      // expects the project key that ZCode derives from that OAuth session.
      const codingKey = await resolveCodingApiKey(token, options?.signal);
      const inner = openAICompletionsApi().streamSimple(model, context, {
        ...options,
        apiKey: "",
        headers: { ...options?.headers, Authorization: codingKey },
      });
      for await (const event of inner) stream.push(event);
      stream.end();
    } catch (error) {
      stream.push({
        type: "error",
        reason: "error",
        error: {
          role: "assistant",
          content: [],
          api: model.api,
          provider: model.provider,
          model: model.id,
          usage: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheWrite: 0,
            totalTokens: 0,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
          },
          stopReason: "error",
          errorMessage: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        },
      });
      stream.end();
    }
  })();
  return stream;
}

export default function (pi: ExtensionAPI) {
  pi.registerProvider(PROVIDER, {
    baseUrl: BASE_URL,
    api: "openai-completions",
    models,
    oauth: {
      name: "ZCode / BigModel OAuth",
      isSubscription: true,
      loginLabel: "使用 BigModel 登录",
      login,
      refreshToken: refresh,
      getApiKey: (credentials) => credentials.access,
    },
    streamSimple: streamZCode,
  });

  pi.registerCommand("zcode-oauth-status", {
    description: "显示 ZCode OAuth provider 配置",
    handler: async (_args, ctx) => {
      ctx.ui.notify(`已注册 ${PROVIDER}，模型接口：${BASE_URL}`, "info");
    },
  });

  pi.registerCommand("zcode-quota", {
    description: "查询 BigModel Coding Plan 当前额度",
    handler: async (_args, ctx) => {
      const auth = await ctx.modelRegistry.getProviderAuth(PROVIDER);
      const token = auth?.auth.apiKey?.trim();
      if (!token) {
        ctx.ui.notify("未找到 ZCode OAuth token，请先执行 /login zcode-bigmodel", "error");
        return;
      }
      try {
        const response = await fetch(QUOTA_URL, {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });
        const body = (await response.json()) as Record<string, any>;
        if (!response.ok || (body.code !== undefined && body.code !== 0 && body.code !== 200)) {
          throw new Error(body.msg || `HTTP ${response.status}`);
        }
        const data = body.data ?? body;
        const limits = Array.isArray(data.limits) ? data.limits : [];
        const dateOnly = (value: unknown) => {
          if (typeof value !== "number") return "未知";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "未知";
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        };
        const progress = (remaining: number) => {
          const value = Math.max(0, Math.min(100, Math.round(remaining)));
          const width = 20;
          const filled = Math.round((value / 100) * width);
          return `[${"█".repeat(filled)}${"░".repeat(width - filled)}]`;
        };
        const lines = [
          `BigModel Coding Plan · ${data.level ?? "未知"}`,
          ...limits.map((limit: Record<string, any>, index: number) => {
            const isTime = limit.type === "TIME_LIMIT";
            const type = isTime ? "工具调用" : limit.type === "TOKENS_LIMIT" ? "Token额度" : String(limit.type ?? `额度${index + 1}`);
            const period = isTime ? "本周" : limit.unit === 3 ? "5小时" : limit.unit === 6 ? "本周" : "周期未知";
            // BigModel's TIME_LIMIT uses usage as the weekly total and currentValue as used.
            const total = isTime && typeof limit.usage === "number" ? limit.usage : null;
            const used = isTime && typeof limit.currentValue === "number" ? limit.currentValue : null;
            const remainingPercent = isTime && total !== null && used !== null
              ? (Math.max(0, total - used) / total) * 100
              : typeof limit.percentage === "number"
                ? Math.max(0, Math.min(100, 100 - limit.percentage))
                : null;
            const usage = isTime && total !== null && used !== null
              ? `已用 ${used}/${total} 次`
              : remainingPercent === null ? "剩余未知" : "剩余额度";
            return `${type}（${period}）：${remainingPercent === null ? "剩余未知" : `${progress(remainingPercent)} ${Math.round(remainingPercent)}%剩余`} · ${usage} · 下次刷新 ${dateOnly(limit.nextResetTime)}`;
          }),
        ];
        ctx.ui.notify(lines.join("\n"), "info");
      } catch (error) {
        ctx.ui.notify(`额度查询失败：${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });
}
