import fs from "fs/promises";
import path from "path";
import { SheetData, DetailData, FieldData, TranslationData } from "./types";
import { fieldsFolder, translationsFolder, cleanData, validateDetailsData, slugifyName } from "./utils";
import { generateFieldFile } from "./fieldGenerator";
import { generatePresetFiles } from "./presetGenerator";

async function createConfigFiles(data: SheetData): Promise<string> {
  cleanData(data);
  const { Translations: translationsData, Categories: categories, Fields: fieldsData, Details: detailsData } = data;
  console.log('Translations:', translationsData.slice(0, 5));
  console.log('Fields:', fieldsData.slice(0, 5));
  console.log('Details:', detailsData.slice(0, 5));
  const translationLanguages = Object.keys(translationsData[0]);
  validateDetailsData(detailsData);
  await generateFieldFile(detailsData, fieldsFolder);

  for (const [index, translation] of translationsData.entries()) {
    console.log("Created:", translation);
    console.log("Created:", translation["English"]);
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
  return translationsFolder;
}

export { createConfigFiles };
