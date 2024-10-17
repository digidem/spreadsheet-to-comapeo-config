import fs from "fs/promises";
import path from "path";
import slugify from "slugify";

const fieldsFolder = path.join(
  process.cwd(),
  process.env.DEBUG === "true" ? "tests/fields" : "fields"
);
const translationsFolder = path.join(process.cwd(), "translations");

interface SheetData {
  [key: string]: any[];
}

interface DetailData {
  name: string;
  category: string;
  fields: string[];
  stringified: string;
}

interface FieldData {
  name: string;
  category: string;
  fields: string[];
}

interface TranslationData {
  [key: string]: string;
}

async function createConfigFiles(data: SheetData): Promise<string> {
  cleanData(data);
  const { Translations: translationsData, Categories: categories, Fields: fieldsData, Details: detailsData } = data;
  const translationLanguages = Object.keys(translationsData[0]);
  validateDetailsData(detailsData);
  await generateFieldFile(detailsData, fieldsFolder);

  const categoryColors = getCategoryColors(categories);

  for (const [index, translation] of translationsData.entries()) {
    console.log("Created:", translation["English"]);
    for (const language of translationLanguages) {
      const languageFolder = path.join(
        translationsFolder,
        slugify(language, { lower: true })
      );
      await fs.mkdir(languageFolder, { recursive: true });
      await generatePresetFiles(
        fieldsData,
        translation,
        language,
        languageFolder,
        index,
        categories,
        categoryColors
      );
    }
  }
  return translationsFolder;
}

function cleanData(data: SheetData): void {
  Object.keys(data).forEach(sheetName => {
    data[sheetName] = data[sheetName].filter(row => Object.keys(row).length > 0);
  });
}

function validateDetailsData(detailsData: DetailData[]): void {
  if (!detailsData[0]?.fields) {
    throw new Error("First field in Details sheet is missing or invalid.");
  }
}

function getCategoryColors(categories: string[]): Record<string, string> {
  const predefinedColors = ["#00ff00", "#ff6d01", "#ff0000", "#b45f06", "#4a86e8", "#ffff00"];
  return categories.reduce((acc, category, index) => {
    acc[category] = index < predefinedColors.length
      ? predefinedColors[index]
      : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return acc;
  }, {} as Record<string, string>);
}

async function generateFieldFile(detailsData: DetailData[], folder: string): Promise<void> {
  await fs.mkdir(folder, { recursive: true });
  for (const detail of detailsData) {
    const lowerCaseField = detail.fields[0].toLowerCase();
    const detailContent = {
      key: slugify(detail.name, { lower: true }),
      type: detail.fields[0].toLowerCase(),
      label: detail.name,
      placeholder: detail.fields[0].toLowerCase() === "text"
        ? `Descreva ${lowerCaseField}`
        : `Selecione ${detail.fields[0].toLowerCase() === "select_one" ? "a opção" : "as opções"} de ${lowerCaseField}`,
      ...(detail.fields[0].toLowerCase() !== "text" && { options: JSON.parse(detail.stringified).map((option: string) => option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()) }),
    };
    await fs.writeFile(
      path.join(folder, `${detailContent.key}.json`),
      JSON.stringify(detailContent, null, 2)
    );
  }
}

async function generatePresetFiles(
  fieldsData: FieldData[],
  translation: TranslationData,
  language: string,
  folder: string,
  index: number,
  categories: string[],
  categoryColors: Record<string, string>
): Promise<void> {
  const presetsFolder = path.join(folder, "presets");
  await fs.mkdir(presetsFolder, { recursive: true });

  for (const field of fieldsData) {
    if (
      field.name === translation["Portugues"] &&
      !categories.includes(slugify(field.name, { lower: true })) &&
      field.fields.length > 0
    ) {
      const slugifiedFieldName = slugify(field.name, { lower: true });
      const translationValue = translation[language] || translation[process.env.DEFAULT_TRANSLATION || ""];

      if (!translationValue) {
        throw new Error(`Translation missing for field: ${field.name} in language: ${language} and no default translation available.`);
      }

      const presetContent = {
        icon: slugifiedFieldName,
        sort: index,
        color: categoryColors[slugify(field.category, { lower: true })] || "#000000",
        fields: field.fields.map(f => slugify(f, { lower: true })),
        geometry: ["point", "line", "area"],
        tags: {
          type: slugifiedFieldName,
          category: slugify(field.category, { lower: true }),
        },
        terms: [slugifiedFieldName, slugify(field.category, { lower: true })],
        name: translationValue,
      };

      await fs.writeFile(
        path.join(presetsFolder, `${slugifiedFieldName}.json`),
        JSON.stringify(presetContent, null, 2)
      );

      if (process.env.DEBUG === "true") {
        console.debug(`Preset content for ${slugifiedFieldName}:`, presetContent);
      }
    }
  }
}

export { createConfigFiles };
