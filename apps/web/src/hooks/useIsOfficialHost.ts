const GITHUB_API_URL = 'https://api.github.com/repos/5afe/safe-wallet-ipfs/releases/tags'

// eslint-disable-next-line unused-imports/no-unused-vars
async function getGithubRelease(version: string) {
  const resp = await fetch(`${GITHUB_API_URL}/v${version}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })
  if (!resp.ok) return false
  return await resp.json()
}

export const useIsOfficialHost = (): boolean => {
  return true
}
