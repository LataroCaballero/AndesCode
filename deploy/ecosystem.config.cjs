// deploy/ecosystem.config.cjs
// Source of truth for the PM2 config (D-04, D-05, D-06, D-07).
// Plan 02 copies this file to the VPS at:
//   /home/__USER__/pocketbase/ecosystem.config.cjs
// (.cjs extension required: this project uses "type": "module" in package.json;
//  PM2 accepts .cjs files identically to .js files)
//
// BEFORE DEPLOYING: Replace __USER__ with the VPS process username.
// Discover it by running: nginx -T | grep -i 'user'  (D-02 audit step).

module.exports = {
  apps: [
    {
      name: "pocketbase",

      // D-05: PocketBase binary lives in the user's home directory
      script: "/home/__USER__/pocketbase/pocketbase",

      // REQUIRED: PocketBase is a compiled binary, not a Node.js script.
      // Without interpreter: "none", PM2 would try to run it through Node and fail.
      interpreter: "none",

      // D-06: Bind to localhost only — never expose port 8090 publicly.
      // --dir:           PocketBase data directory (SQLite DB + uploads)
      // --migrationsDir: Path to the repo's pb_migrations/ directory (RESEARCH Pitfall 5).
      //                  PocketBase only scans pb_migrations/ relative to its cwd by default;
      //                  the explicit flag ensures the versioned migration is always found.
      args: "serve --http=127.0.0.1:8090 --dir=/home/__USER__/pocketbase/pb_data --migrationsDir=/home/__USER__/pocketbase/pb_migrations"
    }
  ]
};
