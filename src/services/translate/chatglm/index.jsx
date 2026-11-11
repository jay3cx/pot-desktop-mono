import { fetch, Body } from '@tauri-apps/api/http';
import { Language } from './info';

const ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 只支持官方标注「免费/免费」的三个模型，其余旧模型名统一回落到最稳的 4-flash。
const FREE_MODELS = ['glm-4-flash-250414', 'glm-4.7-flash', 'glm-4.6v-flash'];
const DEFAULT_MODEL = 'glm-4-flash-250414';

// 旧版 chatglm / glm-4 系列（非免费或已下线）一律映射到免费模型
const LEGACY_MODEL_MAP = {
    chatglm_turbo: DEFAULT_MODEL,
    chatglm_pro: DEFAULT_MODEL,
    chatglm_std: DEFAULT_MODEL,
    chatglm_lite: DEFAULT_MODEL,
    'glm-4-flash': DEFAULT_MODEL,
    'glm-4-flashx': 'glm-4.7-flash',
    'glm-4-air': 'glm-4.7-flash',
    'glm-4-plus': 'glm-4.7-flash',
    'glm-4-long': 'glm-4.7-flash',
    'glm-4': 'glm-4.7-flash',
};

const normalizeModel = (model) => {
    const value = String(model || '').trim();
    if (!value) return DEFAULT_MODEL;
    if (FREE_MODELS.includes(value)) return value;
    return LEGACY_MODEL_MAP[value] ?? DEFAULT_MODEL;
};

// 4.7-flash 默认带思考，翻译用不上，关掉能快一个数量级；5.3 系列不支持关闭，这里不涉及。
const thinkingFor = (model) =>
    model === 'glm-4.7-flash' ? { type: 'disabled' } : undefined;

const describeFailure = (status, detail) => {
    if (status === 401 || /"code"\s*:\s*"?1000"?/.test(detail) || /身份验证失败/.test(detail)) {
        return '鉴权失败：API Key 不正确、已过期或不属于该模型\n' + detail;
    }
    if (/"?code"?\s*:\s*"?1305"?|访问量过大/.test(detail)) {
        return '模型当前访问量过大（1305），请稍后重试或换一个模型\n' + detail;
    }
    if (/"?code"?\s*:\s*"?1302"?|速率限制/.test(detail)) {
        return '请求过于频繁（1302），请稍后重试\n' + detail;
    }
    if (/1113|余额|欠费|Insufficient/i.test(detail)) {
        return '账户余额不足或未开通该模型\n' + detail;
    }
    if (/model/i.test(detail) && /not|invalid|不存在|不支持|无权访问/i.test(detail)) {
        return '当前模型不可用，请在设置中更换模型\n' + detail;
    }
    return `HTTP ${status}\n${detail}`;
};

// 1305 / 1302 是平台侧限流，重试一次通常就过
const RETRYABLE = /"code"\s*:\s*"?(1305|1302)"?|访问量过大|速率限制/;

const parseBody = (raw) => {
    let result = '';
    if (raw.includes('data:')) {
        for (const line of raw.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
                const data = JSON.parse(payload);
                result += data?.choices?.[0]?.delta?.content ?? '';
            } catch {
                // 忽略不完整分片
            }
        }
    }
    if (!result) {
        try {
            const data = JSON.parse(raw);
            result = data?.choices?.[0]?.message?.content ?? '';
        } catch {
            result = '';
        }
    }
    return result;
};

export async function translate(text, from, to, options = {}) {
    const { config = {}, setResult, detect } = options;

    const { apiKey, promptList } = config;
    const model = normalizeModel(config.model);

    if (!Array.isArray(promptList) || promptList.length === 0) {
        return Promise.reject('翻译提示词为空，请在设置中恢复默认提示词列表');
    }

    const key = String(apiKey || '').trim();
    if (!key) return Promise.reject('API Key 为空，请在设置中填写智谱 API Key');

    const messages = promptList.map((item) => ({
        ...item,
        content: String(item.content)
            .replaceAll('$text', text)
            .replaceAll('$from', from)
            .replaceAll('$to', to)
            .replaceAll('$detect', Language[detect] ?? detect ?? ''),
    }));

    const payload = { model, messages, stream: true, max_tokens: 2048 };
    const thinking = thinkingFor(model);
    if (thinking) payload.thinking = thinking;

    // 关键修复：必须走 Tauri 的 http 插件（Rust 侧发请求）。
    // 智谱的 OPTIONS 预检不返回任何 Access-Control-* 头，webview 原生 fetch 会被 CORS
    // 直接拦掉，表现为 "网络请求失败"，与 API Key 是否正确无关。
    let res;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                body: Body.json(payload),
                responseType: 2, // text
            });
        } catch (error) {
            return Promise.reject(`网络请求失败：${error?.message ?? error}`);
        }
        if (res.ok) break;
        const detail = typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? '');
        if (attempt === 0 && RETRYABLE.test(detail)) {
            await new Promise((r) => setTimeout(r, 1200));
            continue;
        }
        return Promise.reject(describeFailure(res.status, detail));
    }

    const raw = typeof res.data === 'string' ? res.data : '';
    const result = parseBody(raw).trim();
    if (!result) return Promise.reject('返回内容为空：' + String(raw).slice(0, 300));

    if (setResult) setResult(result);
    return result;
}

export * from './Config';
export * from './info';
