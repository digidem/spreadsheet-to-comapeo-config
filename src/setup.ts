import * as fs from 'fs';
import * as path from 'path';

async function clearOrCreateDir(dir: string): Promise<void> {
  if (fs.existsSync(dir)) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        await clearOrCreateDir(filePath);
      } else {
        await fs.promises.unlink(filePath);
      }
    }
    console.log(`Cleared content of directory: ${dir}`);
  } else {
    await fs.promises.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function setupDirectories(): Promise<void> {
  const dirs = [
    path.join(process.cwd(), "fields"),
    path.join(process.cwd(), "presets")
  ];

  if (process.env.DEBUG === "true") {
    await clearOrCreateDir(path.join(process.cwd(), "tests"));
  } else {
    await Promise.all(dirs.map(clearOrCreateDir));
  }
}

export { setupDirectories };
