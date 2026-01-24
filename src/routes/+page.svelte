<script lang="ts">
import type { SubmitFunction } from "@sveltejs/kit"
import { enhance } from "$app/forms"
import { links } from "../store/client"
import { Turnstile } from "svelte-turnstile"

let { form, data } = $props()

const submitHandler: SubmitFunction = () => {
  return async ({ result, update }) => {
    await update()
    if (result.type === "success" && result.data?.success) {
      const data = result.data
      links.update((state) => ({
        ...state,
        links: [
          ...state.links,
          {
            alias: data.alias,
            url: data.finalUrl,
            key: data.key,
          },
        ],
      }))
    }
  }
}

const removeLinkFromStash = (alias: string) => {
  if (!confirm("Remove this link from your history?")) return
  links.update((state) => ({
    ...state,
    links: state.links.filter((l) => l.alias !== alias),
  }))
}
</script>

{#if form?.success}
  <div class="flex flex-col items-center gap-6 text-center w-full">
    <h2 class="text-2xl font-bold">Link Ready!</h2>
    <p>
      Your link is:
      <a href={form.finalUrl} target="_blank" class="link link-primary text-xl font-bold"
        >{form.finalUrl}</a
      >
    </p>

    <div class="alert alert-success">
      <div class="flex flex-col items-center gap-2 w-full">
        <h3 class="font-bold text-lg">Success</h3>
        <p class="text-sm">
          Please keep the link secure, it will be gone once you clear your stash!
        </p>
        <a href="/stats/{form.alias}?key={form.key}" class="btn btn-outline btn-sm mt-2"
          >See Stats</a
        >
      </div>
    </div>

    <div class="pt-2"><a href="/" class="btn btn-outline">Back to Home</a></div>
  </div>
{:else}
  <form method="POST" use:enhance={submitHandler} class="form-control w-full space-y-4">
    {#if form?.error}
      <div role="alert" class="alert alert-error"><span>{form.error}</span></div>
    {/if}

    <div>
      <div class="label"><span class="label-text">Original URL</span></div>
      <input
        type="url"
        name="url"
        class="input input-bordered w-full"
        placeholder="https://example.com"
        required />
    </div>

    <div>
      <div class="label"><span class="label-text">Custom Alias (optional)</span></div>
      <input
        type="text"
        name="alias"
        class="input input-bordered w-full"
        placeholder="Leave empty for random" />
    </div>

    <div>
      <div class="label"><span class="label-text">Expire At (optional)</span></div>
      <input type="datetime-local" name="expire_at" class="input input-bordered w-full" />
    </div>

    <div>
      <div class="label"><span class="label-text">Burn After Views (optional)</span></div>
      <input
        type="number"
        name="burn_after_views"
        class="input input-bordered w-full"
        placeholder="Leave empty to never burn" />
    </div>

    <div>
      <div class="label"><span class="label-text">Creation Password</span></div>
      <input
        type="password"
        name="creation_password"
        class="input input-bordered w-full"
        placeholder="If you set one" />
    </div>

    {#if data.turnstileSiteKey}
      <Turnstile siteKey={data.turnstileSiteKey} />
    {/if}

    <button type="submit" class="btn btn-primary w-full font-bold">Shorten It!</button>
  </form>
{/if}

{#if $links.links.length > 0}
  <div class="card bg-base-100 w-full mt-8 border border-base-200">
    <div class="card-body p-4">
      <h3 class="card-title text-lg border-b border-base-200 pb-2 mb-2">Your Stash</h3>
      <div class="flex flex-col gap-3">
        {#each $links.links as link}
          <div class="flex justify-between items-center gap-4 p-3 bg-base-200 rounded-lg">
            <div class="overflow-hidden min-w-0">
              <a href="/{link.alias}" target="_blank" class="link link-primary font-bold text-lg"
                >/{link.alias}</a
              >
              <div class="text-xs opacity-70 truncate mt-1">{link.url}</div>
            </div>
            <div class="join shrink-0">
              <a
                href="/stats/{link.alias}?key={link.key}"
                class="btn btn-sm btn-square join-item btn-warning"
                title="Stats">
                #
              </a>
              <button
                class="btn btn-sm btn-square join-item btn-error"
                onclick={() => removeLinkFromStash(link.alias)}
                title="Remove from history">
                x
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
