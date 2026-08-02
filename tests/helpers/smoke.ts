/** Smoke tests hit a deployed site; refuse to run without a target. */
export function requireBaseUrl(): string {
  const url = process.env.SMOKE_BASE_URL
  if (!url) {
    throw new Error(
      'SMOKE_BASE_URL is not set. Run: SMOKE_BASE_URL=https://your.site pnpm test:smoke',
    )
  }
  return url
}
