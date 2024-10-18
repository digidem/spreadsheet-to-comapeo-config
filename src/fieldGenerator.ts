import fs from "fs/promises";
import path from "path";
import { DetailData } from "./types";
import { slugifyName } from "./utils";

export async function generateFieldFile(detailsData: DetailData[], folder: string): Promise<void> {
  await fs.mkdir(folder, { recursive: true });
  for (const detail of detailsData) {
    console.log("Creating:", detail);
    const lowerCaseField = detail.field[0].toLowerCase();
    const detailContent = {
      key: slugifyName(detail.name),
      type: detail.field[0].toLowerCase(),
      label: detail.name,
      placeholder: detail.field[0].toLowerCase() === "text"
        ? `Descreva ${lowerCaseField}`
        : `Selecione ${detail.field[0].toLowerCase() === "select_one" ? "a opção" : "as opções"} de ${lowerCaseField}`,
      ...(detail.field[0].toLowerCase() !== "text" && { options: JSON.parse(detail.stringified).map((option: string) => option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()) }),
    };
    await fs.writeFile(
      path.join(folder, `${detailContent.key}.json`),
      JSON.stringify(detailContent, null, 2)
    );
  }
}
