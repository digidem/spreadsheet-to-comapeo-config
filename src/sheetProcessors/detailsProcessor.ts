import { RowData, cleanCell, debug } from "./common";

export function processDetailsSheet(rows: any[]): RowData[] {
  debug("Processing Details sheet");
  return rows.map((row) => {
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "" && cell !== " ");
    let options = cleanedData[1]
      ? cleanedData[1].split(",").map((option: string) => option.trim()).filter((option: string) => option !== "")
      : [];
    
    const rowData: RowData = {
      field: cleanedData[0],
      options,
      stringified: JSON.stringify(options),
      type: cleanedData[2] === "m"
        ? "select_multiple"
        : cleanedData[1]?.toLowerCase() === "texto"
          ? "text"
          : "select_one",
    };
    
    debug(`Processed detail: ${rowData.field} with type: ${rowData.type}`);
    return rowData;
  });
}
