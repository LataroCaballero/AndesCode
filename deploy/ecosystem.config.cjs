// deploy/ecosystem.config.cjs
// Source of truth for the PM2 config (D-04, D-05, D-06, D-07).
// VPS username resolved via nginx -T audit (D-02): root
// PocketBase working directory: /root/pocketbase/
// (.cjs extension required: this project uses "type": "module" in package.json;
//  PM2 accepts .cjs files identically to .js files)

module.exports = {
  apps: [
    {
      name: "pocketbase",

      // D-05: PocketBase binary lives in root's home directory
      script: "/root/pocketbase/pocketbase",

      // REQUIRED: PocketBase is a compiled binary, not a Node.js script.
      // Without interpreter: "none", PM2 would try to run it through Node and fail.
      interpreter: "none",

      // D-06: Bind to localhost only — never expose port 8090 publicly.
      // --dir:           PocketBase data directory (SQLite DB + uploads)
      // --migrationsDir: Path to the repo's pb_migrations/ directory (RESEARCH Pitfall 5).
      //                  PocketBase only scans pb_migrations/ relative to its cwd by default;
      //                  the explicit flag ensures the versioned migration is always found.
      args: "serve --http=127.0.0.1:8090 --dir=/root/pocketbase/pb_data --migrationsDir=/root/pocketbase/pb_migrations"
    }
  ]
};
