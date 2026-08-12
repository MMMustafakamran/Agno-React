# CopilotKit CLI test

Run this from this folder. The CLI opens browser authentication when needed.

```bash
npx copilotkit@latest create

# pnpm
pnpm dlx copilotkit@latest create

# yarn
yarn dlx copilotkit@latest create

# bun
bunx copilotkit@latest create
```

Complete these prompts:

1. Choose an app name.
2. Choose a framework.
3. Finish browser sign-in.
4. Select or create the Enterprise Intelligence project.

The generated project should contain:

- `.copilotkit/project.json`
- `.env` with the hosted platform URLs and `INTELLIGENCE_API_KEY`
- a local app/runtime run command such as `npm run dev`, `pnpm dev`, `yarn dev`, or `bun run dev`

## Quick checks

```bash
npx copilotkit@latest whoami
npx copilotkit@latest project select

# pnpm
pnpm dlx copilotkit@latest whoami
pnpm dlx copilotkit@latest project select

# yarn
yarn dlx copilotkit@latest whoami
yarn dlx copilotkit@latest project select

# bun
bunx copilotkit@latest whoami
bunx copilotkit@latest project select

# npm
npm install
npm run dev

# pnpm
pnpm install
pnpm dev

# yarn
yarn install
yarn dev

# bun
bun install
bun run dev
```

Keep the generated `.env` and `.copilotkit/` files private. Do not move the
`INTELLIGENCE_API_KEY` into frontend code.

## Optimized comparison workflow

1. Run `npx copilotkit@latest login` once and finish browser authentication.
2. Keep each generated app in a separate directory: npm, pnpm, Yarn, and Bun.
3. Use the matching folder README for each project.
4. Test the same Rich Threads page and the same actions in each app.
5. Record only startup result, package-manager version, and any CLI error.

The browser session can be shared, but each app should keep its own lockfile,
`node_modules`, `.env`, and `.copilotkit/project.json`.
