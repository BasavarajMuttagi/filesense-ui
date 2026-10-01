import fs from "node:fs";
import path from "node:path";

export default function setup() {
  const dir = path.resolve(process.cwd(), "screenshots");
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}
