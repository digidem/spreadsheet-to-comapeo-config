import fs from "fs/promises";
import path from "path";
import { FieldData, TranslationData } from "./types";
import { slugifyName, debug } from "./utils";

export async function generatePresetFiles(
  fieldsData: FieldData[],
  translation: TranslationData,
  language: string,
  folder: string,
  index: number,
  categories: string[]
): Promise<void> {
  const presetsFolder = path.join(folder, "presets");
  await fs.mkdir(presetsFolder, { recursive: true });

  for (const field of fieldsData) {
    if (
      field.name === translation["Portugues"] &&
      !categories.includes(slugifyName(field.name)) &&
      field.fields.length > 0
    ) {
      const slugifiedFieldName = slugifyName(field.name);
      const translationValue = translation[language] || translation[process.env.DEFAULT_TRANSLATION || ""];

      if (!translationValue) {
        throw new Error(`Translation missing for field: ${field.name} in language: ${language} and no default translation available.`);
      }

      const presetContent = {
        icon: slugifiedFieldName,
        sort: index,
        color: field.color,
        fields: field.fields.map(f => slugifyName(f)),
        geometry: ["point", "line", "area"],
        tags: {
          type: slugifiedFieldName,
          category: slugifyName(field.category),
        },
        terms: [slugifiedFieldName, slugifyName(field.category)],
        name: translationValue,
      };

      await fs.writeFile(
        path.join(presetsFolder, `${slugifiedFieldName}.json`),
        JSON.stringify(presetContent, null, 2)
      );

      debug(`Preset content for ${slugifiedFieldName}:`, presetContent);
    }
  }
}
