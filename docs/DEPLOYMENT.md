# New portfolio deployment

- Repository: https://github.com/loktrishal-05/loktrishal-portfolio-cinematic
- Permanent workspace: Desktop/loktrishal-portfolio-cinematic
- Portable source archive: Desktop/loktrishal-new-portfolio.zip
- Current preview: https://zippy-amber-vaqjahm.tmp.now
- Preview expiry: 2 November 2026, 22:34:36 IST unless claimed.

Only this new repository/project is used. The older portfolio remote main remains 935af431f705e69b312e631ad6584e2618f15219, and its local checkout is clean.

Vercel CLI has no owner login. Native access to the signed-in Chrome app was rejected by automatic approval review. Earlier device login expired. Permanent account ownership therefore needs the owner to claim a new preview or complete Vercel authentication; do not describe an anonymous preview as permanent production.

Anonymous source builds hit Windows spawn cmd.exe ENOENT. Deploying the already-built static directory works:

```sh
npm ci
npm test
npm run build
npx --yes vercel@65.9.0 deploy dist --temporary --yes
```

Temporary previews expire after one hour unless claimed. Claim credentials are shared privately in the conversation, never committed. After account sign-in, link only a NEW project:

```sh
npx vercel link --yes --project loktrishal-portfolio-cinematic
npx vercel deploy --prod --yes
```

Do not reuse the older project's .vercel/project.json, domain or repository.

The new 3D public preview passed the complete four-width and five-scenario browser suite. See QA.md.
