import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { linkSchema } from "$lib/schema"
import { ArkErrors } from "arktype"
import { getLink, saveLink } from "$lib/db"

export const POST: RequestHandler = async ({ request, platform }) => {
  const data = (await request.json()) as any

  // 0. verify turnstile if exists
  const turnstileToken = data["cf-turnstile-response"]
  const turnstileSecret = platform?.env.TURNSTILE_SECRET_KEY
  if (turnstileSecret) {
    if (!turnstileToken) {
      return json({ error: "captcha required" }, { status: 400 })
    }

    const verifyFormData = new FormData()
    verifyFormData.append("secret", turnstileSecret)
    verifyFormData.append("response", turnstileToken)
    verifyFormData.append("remoteip", request.headers.get("CF-Connecting-IP") || "")

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      body: verifyFormData,
      method: "POST",
    })

    const outcome = (await result.json()) as any
    if (!outcome.success) {
      return json({ error: "captcha failed" }, { status: 400 })
    }
  }

  // 使用 arktype 验证数据
  const result = linkSchema(data)

  if (result instanceof ArkErrors) {
    return json({ error: result.summary }, { status: 400 })
  }

  // 1. check password
  if (result.creation_password !== (platform?.env.PASSWORD || "")) {
    return json({ error: "the password is wrong" }, { status: 403 })
  }

  // 4. check if alias already exists
  const link = await getLink(result.alias, platform, true)
  if (link) {
    return json({ error: "link already exists" }, { status: 400 })
  }

  // 6. store link data in KV
  await saveLink(result.alias, result, platform)

  const origin = new URL(request.url).origin

  return json({
    success: true,
    result,
    finalUrl: `${origin}/${result.alias}`,
  })
}
