# New portfolio deployment

- New repository: https://github.com/loktrishal-05/loktrishal-portfolio-cinematic
- Permanent local project: `Desktop/loktrishal-portfolio-cinematic`
- Portable source archive: `Desktop/loktrishal-new-portfolio.zip`
- Verified temporary Vercel preview: https://quick-glacier-mr59h2j.tmp.now
- Preview expiry: 2 November 2026, 17:48:28 IST, unless claimed.

Vercel CLI was logged out. Native access to the owner's signed-in Chrome window was rejected by automatic approval review. A device-login request expired without completing authentication, so permanent account-owned deployment remains pending owner action.

Vercel's new anonymous source build hit a Windows `spawn cmd.exe ENOENT` error. Deploying the already-built `dist/` directory directly succeeded without changing the application. The public preview passed the same browser suite as the local build.

Claim the deployment using the private link sent in the conversation to retain it, or authenticate the CLI with `npx vercel login`, then link/deploy only a NEW project. Do not reuse the older project's `.vercel/project.json`, domain or repository. Claim credentials and anonymous deployment metadata must stay out of Git.

For a fresh permanent CLI deployment after sign-in:

```sh
npm ci
npm test
npm run build
npx vercel link --yes --project loktrishal-portfolio-cinematic
npx vercel deploy --prod --yes
```

The earlier repository's `main` commit was checked before and after this work and remains `935af431f705e69b312e631ad6584e2618f15219`. The previous local portfolio checkout is unchanged and clean.
