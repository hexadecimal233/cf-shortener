import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, platform }) => {
        const formData = await request.formData();
        const body = Object.fromEntries(formData);

        // 1. 检查密码
        if ((body.creation_password || "") !== platform?.env.PASSWORD) {
            return fail(403, { error: "the password is wrong...", retry: true });
        }

        // 2. 处理别名逻辑
        let alias = body.alias?.toString().trim();
        if (!alias) {
            alias = Math.random().toString(36).substring(2, 8);
        }

        // 3. 检查是否已存在
        const exists = await platform?.env.LINKS.get(alias);
        if (exists) {
            return fail(400, { error: "link already exists", retry: true });
        }

        // 4. 验证并准备数据 (这里假设 zLinkData 包含创建时间等逻辑)
        // 注意：formData 拿到的全是字符串，需要转换类型（如 views 转为 number）
        const newLinkData = {
            url: body.url,
            key: crypto.randomUUID(), // 生成唯一 key 用于管理
            created_at: new Date().toISOString(),
            views: 0,
            referrers: {},
            expire_at: body.expire_at || null,
            burn_after_views: body.burn_after_views ? parseInt(body.burn_after_views.toString()) : null
        };

        // 5. 存入 KV
        await platform?.env.LINKS.put(alias, JSON.stringify(newLinkData));

        const origin = new URL(request.url).origin;

        // 返回给页面的数据
        return {
            success: true,
            alias,
            key: newLinkData.key,
            finalUrl: `${origin}/${alias}`
        };
    }
} satisfies Actions;