// bring-the-humans-03 — Akun 5 (@edwinsaragih) submission deliverable.
// The entry itself is a public TikTok video: an original vertical ad for
// make.fun ("MY AI NEVER CLOCKS OUT." — a cheerful cartoon ghost drifts
// through the night while coins rain down, because the agent keeps working
// while its human sleeps), rendered with real motion by the agent and
// posted by the account owner. This program is the on-platform deliverable:
// it takes the canonical VIDEO.json the grader mounted for it and republishes
// the video's address as the run output, byte-for-byte, so the gate always
// sees exactly the URL the author committed.
//
// Where the files live is the grader's choice, not this program's: the
// repository is mounted at MAKEFUN_BOT_DIR (default /bot), and the run
// output — a copy of VIDEO.json — belongs in MAKEFUN_OUTPUT_DIR
// (default /output). Outside the grader's container the same run is:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22, standard library only. No network, no dependencies.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// A BTH-03 entry link only counts when it is the full watch URL of one
// specific video — short links (vt.tiktok.com/…) and profile or photo
// URLs are rejected by the competition, so the deliverable refuses to
// republish anything that is not exactly /@<handle>/video/<numeric id>.
function parseTikTokVideoUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("VIDEO.json url is not a parseable URL: " + url);
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "www.tiktok.com") {
    throw new Error("VIDEO.json url is not on www.tiktok.com: " + url);
  }
  const parts = parsed.pathname.split("/").filter((p) => p.length > 0);
  if (
    parts.length !== 3 ||
    !parts[0].startsWith("@") ||
    parts[1] !== "video" ||
    !/^\d+$/.test(parts[2])
  ) {
    throw new Error("VIDEO.json url is not a full TikTok video URL: " + url);
  }
  return { handle: parts[0], videoId: parts[2] };
}

function main() {
  const manifestPath = join(BOT_DIR, "VIDEO.json");
  let raw;
  try {
    raw = readFileSync(manifestPath, "utf8");
  } catch (err) {
    console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${err.message}`);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(`VIDEO.json at ${manifestPath} is not valid JSON`);
    process.exit(1);
  }
  if (typeof data !== "object" || data === null || typeof data.url !== "string") {
    console.error("VIDEO.json must be an object with a string `url` field");
    process.exit(1);
  }
  let ref;
  try {
    ref = parseTikTokVideoUrl(data.url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  // Republish the manifest untouched — the committed bytes are the entry.
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(manifestPath, join(OUTPUT_DIR, "VIDEO.json"));
  console.log(
    "bring-the-humans-03 akun5 entry: " + ref.handle + " video " + ref.videoId
  );
}

main();
