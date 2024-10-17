import fs from 'fs';
import path from 'path';

const translationsFolder = path.join(process.cwd(), "translations");
const defaultsPath = path.join(process.cwd(), "defaults.json");

console.log(`Reading defaults from ${defaultsPath}`);
const data: Record<string, string[]> = JSON.parse(fs.readFileSync(defaultsPath, "utf8"));

function processPresetsFolder(presetsFolder: string): void {
  console.log(`Processing presets folder: ${presetsFolder}`);
  
  fs.readdirSync(presetsFolder).forEach((file) => {
    const presetPath = path.join(presetsFolder, file);
    if (process.env.DEBUG === "true") {
      console.debug(`Reading preset file: ${presetPath}`);
    }
    const preset = JSON.parse(fs.readFileSync(presetPath, "utf8"));
    const presetName = path.parse(file).name;

    preset.geometry.forEach((geometry: string) => {
      if (!data[geometry].includes(presetName)) {
        console.log(`Adding preset ${presetName} to geometry ${geometry}`);
        data[geometry].push(presetName);
      }
    });
  });

  Object.entries(data).forEach(([geometry, presets]) => {
    data[geometry] = presets.filter(preset => {
      const exists = fs.existsSync(path.join(presetsFolder, `${preset}.json`));
      if (!exists) {
        console.log(`Removing non-existent preset ${preset} from geometry ${geometry}`);
      }
      return exists;
    });
  });
}

function writeDefaults(filePath: string): void {
  console.log(`Writing updated defaults to ${filePath}`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

if (fs.existsSync(translationsFolder)) {
  console.log(`Translations folder found: ${translationsFolder}`);
  
  fs.readdirSync(translationsFolder)
    .filter(file => fs.statSync(path.join(translationsFolder, file)).isDirectory())
    .forEach(folder => {
      const presetsFolder = path.join(translationsFolder, folder, "presets");
      if (fs.existsSync(presetsFolder)) {
        console.log(`Processing translation folder: ${folder}`);
        processPresetsFolder(presetsFolder);
        writeDefaults(path.join(translationsFolder, folder, "defaults.json"));
      } else {
        console.log(`Presets folder not found in translation folder: ${folder}`);
      }
    });
} else {
  const presetsFolder = path.join(process.cwd(), "presets");
  console.log(`Translations folder not found. Processing default presets folder: ${presetsFolder}`);
  processPresetsFolder(presetsFolder);
  writeDefaults(defaultsPath);
}

console.log("Defaults update complete.");
