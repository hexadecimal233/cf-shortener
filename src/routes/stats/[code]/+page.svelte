<script lang="ts">
import { deleteLink, updateLink, type LinkAction, type UpdateData } from "../../../utils"

let { data } = $props()
const { linkData, code, origin } = data

// 格式化日期逻辑
const createdAtStr = new Date(linkData.created_at).toLocaleString()
const expireAtStr = linkData.expire_at ? new Date(linkData.expire_at).toLocaleString() : "never"

// 排序后的引用来源列表
const sortedReferrers = Object.entries(linkData.referrers || {}).sort(
  ([, a], [, b]) => (b as number) - (a as number),
)

// 管理状态
let showManageModal = $state(false)
let editingUrl = $state(linkData.url)
let editingExpireAt = $state(linkData.expire_at || "")
let editingBurnAfterViews = $state(linkData.burn_after_views?.toString() || "")
let isLoading = $state(false)
let message = $state<{ type: "success" | "error"; text: string } | null>(null)

// 更新消息显示
function showMessage(type: "success" | "error", text: string, duration = 3000) {
  message = { type, text }
  if (duration > 0) {
    setTimeout(() => {
      message = null
    }, duration)
  }
}

// 处理管理操作
async function handleUpdate(action: LinkAction, value?: string | number | null | UpdateData) {
  if (isLoading) return
  isLoading = true
  message = null

  try {
    await updateLink(code, linkData.key, action, value)
    showMessage("success", "Update complete! The page will be refreshed in 1 seconds...")
    setTimeout(() => window.location.reload(), 1000)
  } catch (e) {
    showMessage("error", e instanceof Error ? e.message : "操作失败")
  } finally {
    isLoading = false
  }
}

// 提交更新（合并URL、过期时间、阅后即焚）
async function submitUpdate() {
  const updateData: UpdateData = {}

  if (editingUrl && editingUrl !== linkData.url) {
    updateData.url = editingUrl
  }

  if (editingExpireAt !== linkData.expire_at) {
    updateData.expire_at = editingExpireAt || null
  }

  if (editingBurnAfterViews !== linkData.burn_after_views?.toString()) {
    updateData.burn_after_views = editingBurnAfterViews ? parseInt(editingBurnAfterViews) : null
  }

  if (Object.keys(updateData).length === 0) {
    showManageModal = false
    return
  }

  await handleUpdate("update", updateData)
  showManageModal = false
}

// 重置访问数
async function resetViews() {
  if (!confirm("Are you sure to reset views? This operation cannot be reverted.")) return
  await handleUpdate("reset_views")
}

// 清除统计
async function clearStats() {
  if (!confirm("Are you sure to clear stats? This operation cannot be reverted.")) return
  await handleUpdate("clear_stats")
}
</script>

<div class="space-y-6 w-full">
  <!-- 消息提示 -->
  {#if message}
    <div role="alert" class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'}">
      <span>{message.text}</span>
    </div>
  {/if}

  <!-- 链接详情卡片 -->
  <div class="card bg-base-100">
    <div class="card-body p-6 space-y-4">
      <div class="flex justify-between items-center border-b border-base-200 pb-2">
        <h3 class="card-title text-xl">Link Details</h3>
        <button onclick={() => (showManageModal = true)} class="btn btn-sm btn-outline">
          Manage
        </button>
      </div>
      <ul class="list-disc list-inside space-y-2">
        <li>
          <span class="opacity-75 font-semibold">Short Link:</span>
          <a href="{origin}/{code}" target="_blank" class="link link-primary font-bold"
            >{origin}/{code}</a
          >
        </li>
        <li>
          <span class="opacity-75 font-semibold">Target URL:</span>
          <span class="break-all">{linkData.url}</span>
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

  <!-- 统计卡片 -->
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

  <!-- 快速操作 -->
  <div class="card bg-base-100">
    <div class="card-body p-6 space-y-4">
      <h4 class="card-title text-xl border-b border-base-200 pb-2">Quick Actions</h4>
      <div class="flex flex-wrap gap-3">
        <button
          onclick={resetViews}
          class="btn btn-warning btn-sm"
          disabled={isLoading || linkData.views === 0}>
          Reset Views
        </button>
        <button
          onclick={clearStats}
          class="btn btn-warning btn-sm"
          disabled={isLoading || sortedReferrers.length === 0}>
          Clear Stats
        </button>
        <a href="/" class="btn btn-outline btn-sm"> Back to Home </a>
      </div>
    </div>
  </div>

  <!-- 删除按钮 -->
  <div class="flex justify-center gap-4 pt-4">
    <button
      type="button"
      onclick={() => deleteLink(code, linkData.key)}
      class="btn btn-error font-bold">
      Delete Link
    </button>
  </div>
</div>

<!-- 管理弹窗 -->
{#if showManageModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">Manage Link</h3>

      <!-- 更新 URL -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Target URL</span></label>
        <input
          type="url"
          bind:value={editingUrl}
          class="input input-bordered"
          placeholder="https://example.com" />
      </div>

      <!-- 更新过期时间 -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Expire At</span></label>
        <input type="datetime-local" bind:value={editingExpireAt} class="input input-bordered" />
        <span class="label-text-alt opacity-60 block mt-2">Leave empty for no expiration</span>
      </div>

      <!-- 更新阅后即焚 -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Burn After Views</span></label>
        <input
          type="number"
          bind:value={editingBurnAfterViews}
          class="input input-bordered"
          placeholder="Leave empty to never burn" />
      </div>

      <!-- 更新按钮 -->
      <div class="form-control mb-4">
        <button onclick={submitUpdate} class="btn btn-primary" disabled={isLoading}>
          Update All
        </button>
      </div>

      <!-- 快捷操作 -->
      <div class="divider">Quick Actions</div>
      <div class="flex flex-wrap gap-2">
        <button
          onclick={resetViews}
          class="btn btn-warning btn-sm"
          disabled={isLoading || linkData.views === 0}>
          Reset Views
        </button>
        <button
          onclick={clearStats}
          class="btn btn-warning btn-sm"
          disabled={isLoading || sortedReferrers.length === 0}>
          Clear Stats
        </button>
      </div>

      <!-- 关闭按钮 -->
      <div class="modal-action">
        <button class="btn" onclick={() => (showManageModal = false)}>Close</button>
      </div>
    </div>
    <!-- 点击背景关闭 -->
    <div class="modal-backdrop bg-black/50" onclick={() => (showManageModal = false)}></div>
  </div>
{/if}
