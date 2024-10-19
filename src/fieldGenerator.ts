import fs from "fs/promises";
import path from "path";
import type { DetailData } from "./types";
import { slugifyName } from "./utils";

export async function generateFieldFile(detailsData: DetailData[], folder: string): Promise<void> {
  await fs.mkdir(folder, { recursive: true });
  for (const detail of detailsData) {
    console.log("Creating:", detail);
    const detailContent = {
      key: slugifyName(detail.field),
      type: detail.type,
      label: detail.field,
      placeholder: detail.type === "text"
        ? `Descreva ${detail.field.toLowerCase()}`
        : `Selecione ${detail.type === "select_one" ? "a opção" : "as opções"} de ${detail.field.toLowerCase()}`,
    };
    if (detail.type !== "text") {
      (detailContent as { options?: string[] }).options = detail.options.map(option => 
        option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
      );
    }

    await fs.writeFile(
      path.join(folder, `${detailContent.key}.json`),
      JSON.stringify(detailContent, null, 2)
    );
  }
}
