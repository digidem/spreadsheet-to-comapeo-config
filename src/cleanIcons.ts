import fs from "fs/promises";
import path from "path";

const dryMode = process.env.DRY_MODE === "true";

async function cleanIcons(
  iconsDir = path.join(process.cwd(), "icons"),
  presetsDir = path.join(process.cwd(), "presets")
): Promise<void> {
  console.log("***********************************");
  console.log("Starting icon clean", presetsDir);
  console.log("***********************************");
  const unusedIconsDir = path.join(iconsDir, "..", "unused_icons");
  if (process.env.DEBUG === "true") {
    console.debug(`Icons Directory: ${iconsDir}`);
    console.debug(`Unused Icons Directory: ${unusedIconsDir}`);
    console.debug(`Presets Directory: ${presetsDir}`);
  }

  const presetFiles = await fs.readdir(presetsDir);
  const presets = await Promise.all(
    presetFiles.map(async (file) => import(path.join(presetsDir, file)))
  );
  const presetIcons = presets.map((preset) => preset.icon);

  if (!dryMode) {
    await fs.mkdir(unusedIconsDir, { recursive: true });
  } else {
    console.log(
      `[Dry Mode] Would check and create directory: ${unusedIconsDir}`
    );
  }

  const icons = await fs.readdir(iconsDir);

  // Move unused icons
  await Promise.all(
    icons.map(async (icon) => {
      const iconName = path
        .basename(icon, path.extname(icon))
        .split("-")
        .slice(0, -1)
        .join("-");
      if (!presetIcons.includes(iconName)) {
        console.debug(`Moving unused icon: ${iconName}`);
        if (!dryMode) {
          await fs.rename(
            path.join(iconsDir, icon),
            path.join(unusedIconsDir, icon)
          );
        } else {
          console.log(
            `[Dry Mode] Would move unused icon: ${iconName} to ${unusedIconsDir}`
          );
        }
      }
    })
  );

  // Create missing icons
  await Promise.all(
    presetIcons.map(async (iconName) => {
      const sizes = [100, 24];
      for (const size of sizes) {
        const iconFile = `${iconName}-${size}px.svg`;
        try {
          await fs.access(path.join(iconsDir, iconFile));
        } catch (err) {
          if (process.env.DEBUG === "true") {
            console.debug(`Creating missing ${size}px icon: ${iconFile}`);
          }
          if (!dryMode) {
            await fs.writeFile(
              path.join(iconsDir, iconFile),
              generateRedSquareSVG(size)
            );
          } else {
            console.log(
              `[Dry Mode] Would create missing ${size}px icon: ${iconFile}`
            );
          }
        }
      }
    })
  );
}

function generateRedSquareSVG(size: number): string {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="red" />
    </svg>
  `;
}

export default cleanIcons;
