import { RowData, cleanCell, debug } from "./common";
import slugify from "slugify";

export function processCategoriesFromFields(rows: any[]): string[] {
  debug("Extracting categories from Fields sheet");
  const categories: string[] = [];

  rows.forEach((row) => {
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "");

    if (cleanedData.length === 1) {
      const category = slugify(cleanedData[0], { lower: true });
      categories.push(category);
      debug(`Extracted category: ${category}`);
    }
  });

  return categories;
}
