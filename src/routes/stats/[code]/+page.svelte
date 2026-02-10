<script lang="ts">
import { deleteLink, updateLink } from "../../../utils"
import type { CreateLink } from "$lib/schema"

let { data } = $props()
const { linkData, code, origin } = data

// 格式化日期逻辑
const createdAtStr = new Date(linkData.createdAt).toLocaleString()
const expireAtStr = linkData.expireAt ? new Date(linkData.expireAt).toLocaleString() : "never"

// 排序后的引用来源列表
const sortedReferrers = Object.entries(linkData.referrers || {}).sort(
  ([, a], [, b]) => (b as number) - (a as number),
)

// 使用 structuredClone 创建编辑状态对象，方便状态管理
let editingState = $state(
  structuredClone({
    alias: linkData.url,
    url: linkData.url,
    expireAt: linkData.expireAt || "",
    burnAfterViews: linkData.burnAfterViews?.toString() || "",
  }),
)

// 管理状态
let showManageModal = $state(false)
let isLoading = $state(false)
let message = $state<{ type: "success" | "error"; text: string } | null>(null)

// 计算更新数据
const updateData: CreateLink = $derived({
  alias: code,
  url: editingState.url,
  expireAt: editingState.expireAt || undefined,
  burnAfterViews: editingState.burnAfterViews ? Number(editingState.burnAfterViews) : undefined,
})

// 更新消息显示
function showMessage(type: "success" | "error", text: string, duration = 3000) {
  message = { type, text }
  if (duration > 0) {
    setTimeout(() => {
      message = null
    }, duration)
  }
}

// 重置浏览次数
async function resetViews() {
  if (isLoading) return
  isLoading = true
  message = null

  try {
    await updateLink(code, linkData.key, {
      alias: code,
      url: linkData.url,
    })
    showMessage("success", "Views reset! The page will be refreshed in 1 seconds...")
    setTimeout(() => window.location.reload(), 1000)
  } catch (e) {
    showMessage("error", e instanceof Error ? e.message : "操作失败")
  } finally {
    isLoading = false
  }
}

// 清除统计数据
async function clearStats() {
  if (isLoading) return
  isLoading = true
  message = null

  try {
    await updateLink(code, linkData.key, {
      alias: code,
      url: linkData.url,
    })
    showMessage("success", "Stats cleared! The page will be refreshed in 1 seconds...")
    setTimeout(() => window.location.reload(), 1000)
  } catch (e) {
    showMessage("error", e instanceof Error ? e.message : "操作失败")
  } finally {
    isLoading = false
  }
}

// 处理管理操作
async function handleUpdate(value: CreateLink) {
  if (isLoading) return
  isLoading = true
  message = null

  try {
    await updateLink(code, linkData.key, value)
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
  await handleUpdate(updateData)
  showManageModal = false
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
          {linkData.burnAfterViews || "never"}
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
        <label class="label"><span class="label-text font-semibold">Alias</span></label>
        <input
          type="url"
          bind:value={editingState.alias}
          class="input input-bordered"
          placeholder="https://example.com" />
      </div>

      <!-- 更新 URL -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Target URL</span></label>
        <input
          type="url"
          bind:value={editingState.url}
          class="input input-bordered"
          placeholder="https://example.com" />
      </div>

      <!-- 更新过期时间 -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Expire At</span></label>
        <input
          type="datetime-local"
          bind:value={editingState.expireAt}
          class="input input-bordered" />
        <span class="label-text-alt opacity-60 block mt-2">Leave empty for no expiration</span>
      </div>

      <!-- 更新阅后即焚 -->
      <div class="form-control mb-4">
        <label class="label"><span class="label-text font-semibold">Burn After Views</span></label>
        <input
          type="number"
          bind:value={editingState.burnAfterViews}
          class="input input-bordered"
          placeholder="Leave empty to never burn" />
      </div>

      <!-- 更新按钮 -->
      <div class="form-control mb-4">
        <button onclick={submitUpdate} class="btn btn-primary" disabled={isLoading}>
          Update All
        </button>
      </div>

      <!-- 关闭按钮 -->
      <div class="modal-action">
        <button class="btn" onclick={() => (showManageModal = false)}>Close</button>
      </div>
    </div>
    <!-- 点击背景关闭 -->
    <div class="modal-backdrop" onclick={() => (showManageModal = false)}></div>
  </div>
{/if}
