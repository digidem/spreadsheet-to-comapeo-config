import { RowData, SheetData, cleanCell, capitalizeFirstLetter, slugifyHeader, debug } from "./common";

export function processTranslationsSheet(rows: any[], headerValues: string[]): SheetData {
  debug("Processing Translations sheet");
  const languages = headerValues.map(slugifyHeader);
  const data: SheetData = { Translations: [], Categories: [] };

  rows.forEach((row) => {
    if (row._rawData[1] !== undefined && row._rawData[1].trim() !== '') {
      const rowData: RowData = {};
      row._rawData.forEach((cell: string, index: number) => {
        const cleanedCell = cleanCell(cell);
        rowData[languages[index]] = capitalizeFirstLetter(cleanedCell);
      });
      data.Translations.push(rowData);
      debug(`Processed translation: ${rowData[languages[0]]}`);
    } else {
      const category = slugifyHeader(row._rawData[0]).toLowerCase();
      data.Categories.push(category);
      debug(`Created category: ${category}`);
    }
  });

  return data;
}
