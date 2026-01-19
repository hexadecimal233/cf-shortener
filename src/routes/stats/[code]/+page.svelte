<script lang="ts">
    import { goto } from '$app/navigation';

    let { data } = $props();
    const { linkData, code, origin } = data;

    // 格式化日期逻辑
    const createdAtStr = new Date(linkData.created_at).toLocaleString();
    const expireAtStr = linkData.expire_at 
        ? new Date(linkData.expire_at).toLocaleString() 
        : "never";

    // 排序后的引用来源列表
    const sortedReferrers = Object.entries(linkData.referrers || {})
        .sort(([, a], [, b]) => (b as number) - (a as number));

    async function deleteLink() {
        if (!confirm("Are you sure?")) return;

        const response = await fetch(`/${code}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: linkData.key })
        });

        if (response.ok) {
            alert("link deleted");
            goto('/');
        } else {
            alert("Failed to delete");
        }
    }
</script>

<div class="lists">
    <ul class="nes-list is-disc">
        <li>
            short link:
            <a href="{origin}/{code}" target="_blank" class="nes-text is-primary">{origin}/{code}</a>
        </li>
        <li>
            target url:
            <a href={linkData.url} target="_blank" class="nes-text is-primary">{linkData.url}</a>
        </li>
        <li>total views: {linkData.views}</li>
        <li>created at: {createdAtStr}</li>
        <li>expire at: {expireAtStr}</li>
        <li>burn after views: {linkData.burn_after_views || "never"}</li>
    </ul>
</div>

<div>
    <h4>referrer stats</h4>
    <div class="nes-table-responsive">
        <table class="nes-table is-bordered">
            <thead>
                <tr>
                    <th>referrer</th>
                    <th>views</th>
                </tr>
            </thead>
            <tbody>
                {#each sortedReferrers as [ref, count]}
                    <tr>
                        <td>{ref}</td>
                        <td>{count}</td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="2">No data yet</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<section class="action-buttons" style="margin-top: 2rem; display: flex; gap: 1rem;">
    <button type="button" onclick={deleteLink} class="nes-btn is-error">
        delete link
    </button>
    <a href="/" class="nes-btn">
        back to home
    </a>
</section>