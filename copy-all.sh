#!/bin/bash

# Check if translations folder exists
if [ -d "translations" ]; then
  # Iterate over each folder in the translations directory
  for folder in translations/*; do
    if [ -d "$folder" ]; then
      # Copy package.json and metadata.json to the current folder
      cp package.json "$folder/"
      cp metadata.json "$folder/"
      # Copy fields folder and all contents to the current folder
      if [ -d "fields" ]; then
        cp -r fields "$folder/"
      else
        echo "fields folder does not exist."
      fi

      # Copy icons folder and all contents to the current folder
      if [ -d "icons" ]; then
        cp -r icons "$folder/"
      else
        echo "icons folder does not exist."
      fi
      folderName=$(basename "$folder")

      # Modify the dataset_id and name in metadata.json
      jq --arg folderName "$folderName" '.dataset_id += "-" + $folderName | .name += "-" + $folderName' "$folder/metadata.json" > "$folder/temp_metadata.json" && mv "$folder/temp_metadata.json" "$folder/metadata.json"
    fi
  done
else
  echo "translations folder does not exist."
fi
