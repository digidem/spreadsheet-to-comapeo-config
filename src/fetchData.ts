import { GoogleSpreadsheet } from "google-spreadsheet";
import slugify from "slugify";
import { getAuth } from "./auth";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const docId = process.env.DOC_ID;
const cacheFilePath = path.join(__dirname, ".cache", "data.json");
const debug = console.debug;

interface RowData {
  [key: string]: string | string[];
}

interface SheetData {
  [key: string]: RowData[];
}

async function fetchData(): Promise<SheetData> {
  console.log("Starting to fetch data from Google Sheets...");
  if (!docId) {
    throw new Error("DOC_ID is not defined.");
  }
  try {
    const auth = getAuth();

    debug('Auth successfully initialized with scopes:', auth.scopes);
    const doc = new GoogleSpreadsheet(docId, auth);
    debug(`Document ID: ${docId}`);

    await doc.loadInfo();
    console.log(`Loaded document: ${doc.title}`);

    const data: SheetData = {};
    let currentCategory = "";

    for (let i = 0; i < doc.sheetCount; i++) {
      const sheet = doc.sheetsByIndex[i];
      console.log(
        `Processing sheet ${i + 1}/${doc.sheetCount}: ${sheet.title}`,
      );

      await sheet.loadHeaderRow();
      if (process.env.DEBUG === "true") {
        console.debug(`Header values for ${sheet.title}:`, sheet.headerValues);
      }

      const rows = await sheet.getRows();
      console.log(`Fetched ${rows.length} rows from sheet: ${sheet.title}`);
      const languages = sheet.headerValues.map((header) => slugify(header));
      data[sheet.title] = rows.map((row) => {
        let rowData: RowData = {};
        if (sheet.title === doc.sheetsByIndex[0].title) {
          // Sheet 1
          if (row._rawData[1] !== undefined) {
            row._rawData = row._rawData.map((cell: string) => {
              let cleanedCell = cell.replace(/\(.*?\)/g, "").trim();
              return cleanedCell.charAt(0).toUpperCase() + cleanedCell.slice(1);
            });
            rowData = {
              [languages[0]]: row._rawData[0],
              [languages[1]]: row._rawData[1],
              [languages[2]]: row._rawData[2],
              [languages[3]]: row._rawData[3],
              [languages[4]]: row._rawData[4],
            };
          } else {
            if (!data["Categories"]) {
              data["Categories"] = [];
            }
            const category = slugify(row._rawData[0]).toLowerCase();
            (data["Categories"] as string[]).push(category);
            console.log(`Created category: ${category}`);
          }
        } else if (sheet.title === doc.sheetsByIndex[1].title) {
          // Sheet 2
          row._rawData = row._rawData
            .map((cell: string) => cell.replace(/\(.*?\)/g, "").trim())
            .filter((cell: string) => cell.trim() !== "");
          if (
            row._rawData.length === 1 &&
            (data["Categories"] as string[]).includes(
              slugify(row._rawData[0], { lower: true }),
            )
          ) {
            currentCategory = row._rawData[0];
          } else {
            rowData = {
              name: row._rawData[0],
              category: currentCategory,
              fields: row._rawData.slice(1),
              stringified: JSON.stringify(row._rawData.slice(1)),
            };
          }
        } else if (sheet.title === doc.sheetsByIndex[2].title) {
          // Sheet 3
          row._rawData = row._rawData
            .map((cell: string) => cell.replace(/\(.*?\)/g, "").trim())
            .filter((cell: string) => cell !== "" && cell !== " ");
          let options = row._rawData[1]
            ? row._rawData[1]
                .split(",")
                .map((option: string) => option.trim())
                .filter((option: string) => option !== "")
            : [];
          rowData = {
            field: row._rawData[0],
            options,
            stringified: JSON.stringify(options),
            type:
              row._rawData[2] === "m"
                ? "select_multiple"
                : row._rawData[1]?.toLowerCase() === "texto"
                  ? "text"
                  : "select_one",
          };
        }
        return rowData;
      });
    }

    // Save data to cache
    await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
    await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2));
    console.log("Data cached successfully.");

    return data;
  } catch (error) {
    console.error("Error fetching data:", error.toString());
    // Attempt to use cached data
    try {
      console.log("Using cached data due to fetch failure.");
      const cachedData = JSON.parse(
        await fs.readFile(cacheFilePath, "utf-8"),
      );
      return cachedData;
    } catch {
      throw new Error("No cached data available and failed to fetch new data.");
    }
  }
}

export { fetchData };
