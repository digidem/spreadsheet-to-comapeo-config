import fs from "fs/promises";
import path from "path";
import type { SheetData } from "./types";
import { debug, fieldsFolder, translationsFolder, cleanData, validateDetailsData, slugifyName } from "./utils";
import { generateFieldFile } from "./fieldGenerator";
import { generatePresetFiles } from "./presetGenerator";

async function createConfigFiles(data: SheetData): Promise<string> {
  cleanData(data);
  const { Translations: translationsData, Categories: categories, Fields: fieldsData, Details: detailsData } = data;
  debug('Translations:', translationsData.slice(0, 5));
  debug('Fields:', fieldsData.slice(0, 5));
  debug('Details:', detailsData.slice(0, 5));
  const translationLanguages = Object.keys(translationsData[0]);
  validateDetailsData(detailsData);
  await generateFieldFile(detailsData, fieldsFolder);
  const categoryNames = categories.map(category => category.name);
  debug('Categories', categoryNames)
  for (const [index, translation] of translationsData.entries()) {
    if (!categoryNames.includes(slugifyName(translation["English"]))) {
      debug("Created:", translation["English"]);
      for (const language of translationLanguages) {
        const languageFolder = path.join(
          translationsFolder,
          slugifyName(language)
        );
        await fs.mkdir(languageFolder, { recursive: true });
        await generatePresetFiles(
          fieldsData,
          translation,
          language,
          languageFolder,
          index,
          categories
        );
      }
    }
  }
  return translationsFolder;
}

export { createConfigFiles };
