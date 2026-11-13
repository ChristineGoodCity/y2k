import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const token = () => randomBytes(24).toString("hex");
if (!existsSync(".env"))
  writeFileSync(
    ".env",
    `DB_PASSWORD=${token()}\nDB_ROOT_PASSWORD=${token()}\nWP_ADMIN_PASSWORD=${token()}\n`,
    { mode: 0o600 },
  );
const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .trim()
    .split("\n")
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
function docker(args, input, allowFailure = false) {
  const r = spawnSync("docker", ["compose", ...args], {
    encoding: "utf8",
    input,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.status !== 0 && !allowFailure) {
    console.error(r.stderr);
    process.exit(r.status || 1);
  }
  return r;
}
console.log("Starting isolated WordPress at http://localhost:8081 …");
docker(["up", "-d", "wordpress"]);
let ready = false;
for (let i = 0; i < 60; i++) {
  if (
    docker(
      ["exec", "-T", "wordpress", "test", "-f", "/var/www/html/wp-config.php"],
      undefined,
      true,
    ).status === 0
  ) {
    ready = true;
    break;
  }
  await new Promise((r) => setTimeout(r, 1000));
}
if (!ready)
  throw new Error(
    "WordPress did not initialize. Inspect docker compose logs wordpress.",
  );
const wp = (args, input, allowFailure = false) =>
  docker(["run", "--rm", "-T", "cli", "wp", ...args], input, allowFailure);
if (wp(["core", "is-installed"], undefined, true).status !== 0)
  wp(
    [
      "core",
      "install",
      "--url=http://localhost:8081",
      "--title=Y2K",
      "--admin_user=y2k-admin",
      "--admin_email=admin@y2k.test",
      "--skip-email",
      "--prompt=admin_password",
    ],
    env.WP_ADMIN_PASSWORD + "\n",
  );
if (wp(["plugin", "is-installed", "advanced-custom-fields-pro"], undefined, true).status === 0) {
  wp(["plugin", "activate", "advanced-custom-fields-pro"]);
} else {
  throw new Error("Install ACF Pro before running setup; the page builder requires Flexible Content and Repeater fields.");
}
wp(["plugin", "install", "wp-graphql", "--activate"]);
wp(["plugin", "activate", "y2k-headless"]);
wp(["rewrite", "structure", "/%postname%/", "--hard"]);
for (const script of ["setup-site-settings.php", "setup-page-builder.php", "simplify-builder-fields.php", "setup-navigation.php", "seed.php", "setup-gallery.php", "setup-gallery-titles.php"]) {
  wp(["eval", readFileSync(`scripts/${script}`, "utf8").replace("<?php", "")]);
}
if (!existsSync(".env.local")) {
  writeFileSync(".env.local", "WORDPRESS_GRAPHQL_URL=http://localhost:8081/graphql\n", { mode: 0o600 });
}
console.log(
  "WordPress is ready: http://localhost:8081/wp-admin\nUsername: y2k-admin\nPassword: WP_ADMIN_PASSWORD in your local .env file.\nNext: npm run dev",
);
