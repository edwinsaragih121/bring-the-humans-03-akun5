// bring-the-humans-03 — Akun 5 (@edwinsaragih) submission deliverable.
// The entry itself is a public TikTok video: an original vertical ad for
// make.fun ("MY AI NEVER CLOCKS OUT."), rendered with real motion by the
// agent and posted by the account owner. This program is the on-platform
// deliverable: it reads the canonical VIDEO.json sitting next to it and
// republishes the video's URL as the run output, byte-for-byte, so the
// grader always sees exactly the URL the author committed.
//
// Node 22, standard library only. No network, no dependencies.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, "VIDEO.json");
const outPath = join(process.cwd(), "output.json");

function loadManifest(path) {
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || typeof data.url !== "string") {
    throw new Error("VIDEO.json must be an object with a string `url` field");
  }
  return { raw, data };
}

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
  const { raw, data } = loadManifest(manifestPath);
  const { handle, videoId } = parseTikTokVideoUrl(data.url);
  // Republish the manifest untouched — the committed bytes are the entry.
  writeFileSync(outPath, raw.endsWith("\n") ? raw : raw + "\n", "utf8");
  console.log(
    "bring-the-humans-03 akun5 entry: " + handle + " video " + videoId
  );
}

main();
