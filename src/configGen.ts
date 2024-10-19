import fs from "fs/promises";
import path from "path";
import type { SheetData } from "./types";
import { debug, fieldsFolder, translationsFolder, cleanData, validateDetailsData, slugifyName } from "./utils";
import { generateFieldFile } from "./fileGenerators/fieldGenerator";
import { generatePresetFiles } from "./fileGenerators/presetGenerator";

async function createConfigFiles(data: SheetData): Promise<string> {
  cleanData(data);
  const { Translations: translationsData, PresetCategories: presetCategories, Categories: presetsData, Details: detailsData } = data;
  debug('PresetCategories', presetCategories)
  debug('Translations:', translationsData.slice(0, 5));
  debug('Presets:', presetsData.slice(0, 5));
  debug('Details:', detailsData.slice(0, 5));
  const translationLanguages = Object.keys(translationsData[0]);
  validateDetailsData(detailsData);
  await generateFieldFile(detailsData, fieldsFolder);
  const presetCategoryNames = presetCategories.map(category => category.name);
  debug('PresetCategories', presetCategoryNames)
  for (const [index, translation] of translationsData.entries()) {
    if (!presetCategoryNames.includes(slugifyName(translation["English"]))) {
      debug("Created:", translation["English"]);
      for (const language of translationLanguages) {
        const languageFolder = path.join(
          translationsFolder,
          slugifyName(language)
        );
        await fs.mkdir(languageFolder, { recursive: true });
        await generatePresetFiles(
          presetsData,
          translation,
          language,
          languageFolder,
          index,
          presetCategories
        );
      }
    }
  }
  return translationsFolder;
}

export { createConfigFiles };
