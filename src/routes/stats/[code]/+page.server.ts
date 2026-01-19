import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'; 

export const load: PageServerLoad = async ({ params, url, platform }) => {
    const { code } = params;
    const key = url.searchParams.get('key');

    if (!platform?.env.LINKS) throw error(500, "KV Binding not found");

    const dataStr = await platform?.env.LINKS.get(code);
    if (!dataStr) {
        throw error(404, "link not found");
    }

    const data = JSON.parse(dataStr);

    // 校验 Key
    if (key !== data.key) {
        throw error(403, "wrong key");
    }

    return {
        code,
        linkData: data,
        origin: url.origin
    };
};