import { fetchData } from "./fetchData";
import { setupDirectories } from "./setup";
import { createConfigFiles } from "./configGen";
import { debug } from './utils'
import dotenv from "dotenv";

dotenv.config();

async function generateConfigsFromSpreadsheet(): Promise<string | undefined> {
  try {
    console.log("Setting up directories...");
    await setupDirectories();
    console.log("Directories setup complete.");

    console.log("Fetching data from spreadsheet...");
    const data = await fetchData();
    console.log("Data fetched successfully.");

    console.log("Creating configuration files...");
    const languageFolder = await createConfigFiles(data);
    console.log("Configuration files have been generated.");
    return languageFolder;
  } catch (error) {
    console.error("Error fetching data:", error);
    debug("Error details:", error);
  }
}

export default generateConfigsFromSpreadsheet;