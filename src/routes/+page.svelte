<script lang="ts">
import { links, type Link } from "../store/client"
import { Turnstile } from "svelte-turnstile"
import { env } from "$env/dynamic/public"

let url = $state("")
let alias = $state("")
let expireAt = $state("")
let burnAfterViews = $state("")
let creationPassword = $state("")
let isLoading = $state(false)
let errorMessage = $state("")
let successLink = $state<Link | null>(null)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  isLoading = true
  errorMessage = ""
  successLink = null
  const turnstile = window.turnstile

  try {
    const data: Record<string, string> = {
      url,
    }
    if (alias) data.alias = alias
    if (expireAt) data.expireAt = expireAt
    if (burnAfterViews) data.burnAfterViews = burnAfterViews
    if (creationPassword) data.creationPassword = creationPassword

    const turnstileToken = turnstile.getResponse()
    if (turnstileToken) {
      data["cf-turnstile-response"] = turnstileToken
    }

    const response = await fetch("/api/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = (await response.json()) as any

    if (result.success) {
      const link = {
        alias: result.result.alias,
        url: result.finalUrl,
        key: result.result.key,
      }
      links.update((state) => ({
        ...state,
        links: [...state.links, link],
      }))
      successLink = link
    } else {
      errorMessage = result.error || "Failed to create short link"
    }
  } catch (error) {
    errorMessage = "An error occurred while creating the link"
  } finally {
    turnstile.reset()
    isLoading = false
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

<form onsubmit={handleSubmit} class="form-control w-full space-y-4">
  {#if successLink}
    <div class="flex flex-col items-center gap-6 text-center w-full">
      <h2 class="text-2xl font-bold">Link Ready!</h2>
      <p>
        Your link is:
        <a href={successLink.url} target="_blank" class="link link-primary text-xl font-bold"
          >{successLink.url}</a
        >
      </p>

      <div class="alert alert-success">
        <div class="flex flex-col items-center gap-2 w-full">
          <h3 class="font-bold text-lg">Success</h3>
          <p class="text-sm">
            Please keep the link secure, it will be gone once you clear your stash!
          </p>
          <a
            href="/stats/{successLink.alias}?key={successLink.key}"
            class="btn btn-outline btn-sm mt-2"
            >See Stats</a
          >
        </div>
      </div>
    </div>
  {/if}

  {#if errorMessage}
    <div role="alert" class="alert alert-error"><span>{errorMessage}</span></div>
  {/if}

  <div>
    <div class="label"><span class="label-text">Original URL</span></div>
    <input
      type="url"
      bind:value={url}
      class="input input-bordered w-full"
      placeholder="https://example.com"
      required />
  </div>

  <div>
    <div class="label"><span class="label-text">Custom Alias (optional)</span></div>
    <input
      type="text"
      bind:value={alias}
      class="input input-bordered w-full"
      placeholder="Leave empty for random" />
  </div>

  <div>
    <div class="label"><span class="label-text">Expire At (optional)</span></div>
    <input type="datetime-local" bind:value={expireAt} class="input input-bordered w-full" />
  </div>

  <div>
    <div class="label"><span class="label-text">Burn After Views (optional)</span></div>
    <input
      type="number"
      bind:value={burnAfterViews}
      class="input input-bordered w-full"
      placeholder="Leave empty to never burn" />
  </div>

  <div>
    <div class="label"><span class="label-text">Creation Password</span></div>
    <input
      type="password"
      bind:value={creationPassword}
      class="input input-bordered w-full"
      placeholder="If you set one" />
  </div>

  {#if env.PUBLIC_TURNSTILE_SITE_KEY}
    <Turnstile siteKey={env.PUBLIC_TURNSTILE_SITE_KEY} />
  {/if}

  <button type="submit" disabled={isLoading} class="btn btn-primary w-full font-bold">
    {isLoading ? "Creating..." : "Shorten It!"}
  </button>
</form>

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
