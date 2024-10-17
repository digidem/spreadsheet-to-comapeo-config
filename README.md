# Spreadsheet to CoMapeo Config

**Spreadsheet to CoMapeo Config** is a tool designed to streamline the process of converting Google Spreadsheet data into configuration files for CoMapeo. It automates the extraction of data from a specified Google Spreadsheet and transforms it into the required format for CoMapeo configurations.

Key features:
- Fetches data from Google Sheets using the Google Sheets API
- Supports multiple languages for translations
- Generates preset and field configuration files for CoMapeo
- Utilizes environment variables for secure configuration
- Includes debug mode for easier development and troubleshooting

This tool is particularly useful for organizations working with CoMapeo who need to manage and update their configurations efficiently, especially when dealing with multilingual content or frequent updates to their mapping categories and fields.

## Usage

To install the tool globally, use the following command:

```
npm i -g spreadsheet-to-comapeo-config
```

## Developing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Setting up the environment

1. Copy the `.env.example` file to a new file named `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in the values in the `.env` file:

   - `DOC_ID`: This is the ID of your Google Spreadsheet. You can find this in the URL of your spreadsheet. For example, if your spreadsheet URL is `https://docs.google.com/spreadsheets/d/1HrvqbPnQlMNkHn9eM6QkMDWw0J7DxmByBwsA5ZfZrKs/edit#gid=0`, then your `DOC_ID` would be `1HrvqbPnQlMNkHn9eM6QkMDWw0J7DxmByBwsA5ZfZrKs`.

   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: This is the email address of your Google Service Account.

   - `GOOGLE_PRIVATE_KEY`: This is the private key of your Google Service Account. Make sure to keep the entire key, including the `"-----BEGIN PRIVATE KEY-----"` and `"-----END PRIVATE KEY-----"` parts.

   - `DEFAULT_TRANSLATION`: Set this to your preferred default language for translations.

3. Sharing your Google Spreadsheet:

   - Open your Google Spreadsheet.
   - Click on the "Share" button in the top right corner.
   - In the "Share with people and groups" field, paste your `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - Set the permission to "Viewer" (read-only access).
   - Click "Send" to confirm.

4. Important notes:

   - Ensure your spreadsheet is a Google Sheets document, not an uploaded Excel (.xls) file or any other format.
   - The service account only needs read permission to fetch the data.
   - Keep your `.env` file secure and never commit it to version control.

