<script lang="ts">
import { deleteLink } from "../../../utils"

let { data } = $props()
const { linkData, code, origin } = data

// 格式化日期逻辑
const createdAtStr = new Date(linkData.created_at).toLocaleString()
const expireAtStr = linkData.expire_at ? new Date(linkData.expire_at).toLocaleString() : "never"

// 排序后的引用来源列表
const sortedReferrers = Object.entries(linkData.referrers || {}).sort(
  ([, a], [, b]) => (b as number) - (a as number),
)
</script>

<div class="space-y-6 w-full">
  <div class="card bg-base-100">
    <div class="card-body p-6 space-y-4">
      <h3 class="card-title text-xl border-b border-base-200 pb-2">Link Details</h3>
      <ul class="list-disc list-inside space-y-2">
        <li>
          <span class="opacity-75 font-semibold">Short Link:</span>
          <a href="{origin}/{code}" target="_blank" class="link link-primary font-bold"
            >{origin}/{code}</a
          >
        </li>
        <li>
          <span class="opacity-75 font-semibold">Target URL:</span>
          <a href={linkData.url} target="_blank" class="link link-primary break-all"
            >{linkData.url}</a
          >
        </li>
        <li><span class="opacity-75 font-semibold">Total Views:</span> {linkData.views}</li>
        <li><span class="opacity-75 font-semibold">Created At:</span> {createdAtStr}</li>
        <li><span class="opacity-75 font-semibold">Expire At:</span> {expireAtStr}</li>
        <li>
          <span class="opacity-75 font-semibold">Burn After Views:</span>
          {linkData.burn_after_views || "never"}
        </li>
      </ul>
    </div>
  </div>

  <div class="card bg-base-100">
    <div class="card-body p-6 space-y-4">
      <h4 class="card-title text-xl border-b border-base-200 pb-2">Referrer Stats</h4>
      <div class="overflow-x-auto rounded-lg border border-base-200">
        <table class="table w-full">
          <thead class="bg-base-200">
            <tr>
              <th>Referrer</th>
              <th class="text-right">Views</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedReferrers as [ref, count]}
              <tr class="hover">
                <td>{ref}</td>
                <td class="text-right font-mono">{count}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="2" class="p-6 text-center opacity-50 italic">No data yet</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="flex justify-center gap-4 pt-4">
    <button
      type="button"
      onclick={() => deleteLink(code, linkData.key)}
      class="btn btn-error font-bold">
      Delete Link
    </button>
    <a href="/" class="btn btn-outline font-bold"> Back to Home </a>
  </div>
</div>
