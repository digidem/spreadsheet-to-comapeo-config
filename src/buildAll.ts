import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import generateConfigsFromSpreadsheet from './configsFromSpreadsheet';
import slugify from 'slugify';
import cleanIcons from './cleanIcons';

const buildAll = async (): Promise<void> => {
  const originalBuildPath = path.join(process.cwd(), 'build');
  const translationsFolder = path.join(process.cwd(), 'translations');

  try {
    await fs.rm(translationsFolder, { recursive: true, force: true });
    await fs.mkdir(translationsFolder);
    console.log('Translations folder cleaned successfully.');

    const languageFolder = await generateConfigsFromSpreadsheet();
    console.log('***********************************');
    console.log('Finished generation');
    console.log('***********************************');

    const folders = await fs.readdir(languageFolder);
    const firstFolder = folders.find(async (folder) => 
      (await fs.stat(path.join(translationsFolder, folder))).isDirectory()
    );

    console.log('firstFolder', firstFolder);

    await cleanIcons(
      path.join(process.cwd(), 'icons'),
      path.join(translationsFolder, firstFolder!, 'presets')
    );

    execSync('sh scripts/copy-all.sh', { stdio: 'inherit' });
    console.log('copy-all.sh script executed successfully.');

    execSync('node scripts/gen-defaults.js', { stdio: 'inherit' });
    console.log('gen-defaults.js script executed successfully.');

    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const { name: originalName, version: originalVersion } = packageJson;

    const translations = await fs.readdir(translationsFolder);
    for (const folder of translations) {
      const folderPath = path.join(translationsFolder, folder);
      const folderStat = await fs.stat(folderPath);

      if (folderStat.isDirectory()) {
        console.log(`Processing folder: ${folder}`);

        const slugifiedFolderName = slugify(folder, { lower: true });

        process.chdir(folderPath);
        const buildPath = path.join(process.cwd(), 'build');
        await fs.mkdir(buildPath, { recursive: true });

        const fileName = `${originalName}--${originalVersion}-${slugifiedFolderName}.mapeosettings`;
        const command = `mapeo-settings build -o "./build/${fileName}"`;

        try {
          execSync('docker --version', { stdio: 'ignore' });
          const dockerCommand = `docker run -itv $(pwd):/usr/src/app communityfirst/mapeo-settings-builder ${command}`;
          console.log('Docker is installed. Starting Docker container...', dockerCommand);
          execSync(dockerCommand, { stdio: 'inherit' });
        } catch (error) {
          console.log('Docker is not installed. Running command locally...');
          execSync(command, { stdio: 'inherit' });
        }

        console.log(`Generated file: ${fileName}`);
        const sourcePath = path.join(buildPath, fileName);
        const destinationPath = path.join(originalBuildPath, fileName);
        await fs.rename(sourcePath, destinationPath);
        console.log(`Renamed and moved file: ${fileName}`);
        console.log('***********************************');
        console.log('Finished building');
      }
    }
  } catch (error) {
    console.error('Error building Mapeo config:', error);
  }
};

buildAll();
