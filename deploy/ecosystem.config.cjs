// deploy/ecosystem.config.cjs
// Source of truth for the PM2 config (D-04, D-05, D-06, D-07).
// VPS audit (2026-06-07): PocketBase binary at /home/pocketbase/pb/pocketbase v0.36.6
// Data dir: /home/pocketbase/pb/pb_data  |  Migrations: /home/pocketbase/pb/pb_migrations
// (.cjs extension required: project uses "type": "module" in package.json)

module.exports = {
  apps: [
    {
      name: "pocketbase",

      // Existing binary — installed 2026-03-10, managed by this config from 2026-06-07
      script: "/home/pocketbase/pb/pocketbase",

      // REQUIRED: PocketBase is a compiled binary, not a Node.js script.
      interpreter: "none",

      // D-06: Bind to localhost only — nginx proxies /api/ and /_/ externally.
      // --origins omitted (default = allow all) — previous --origins=localhost:3005 removed.
      args: "serve --http=127.0.0.1:8090 --dir=/home/pocketbase/pb/pb_data --migrationsDir=/home/pocketbase/pb/pb_migrations"
    }
  ]
};
