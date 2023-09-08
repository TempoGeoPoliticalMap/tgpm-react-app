#!/bin/bash

# !!!RUN THIS SCRIPT FROM THE ROOT!!!

# download latest deployed api spec
# the api is currently deployed to the low-spec server, which has a cold start-up (can take a few minutes),
#   go to the page manually before running this script to make sure the server is up:
#     https://tgpm-backend-py-flask.azurewebsites.net/
curl -X GET "https://api.tgpm.world/openapi.json" > scripts/openapi/openapi.yaml

# make global params optional
sed -i '' '/Accept/,/required/ s/true/false/g' scripts/openapi/openapi.yaml

# remove old @generated folder
rm -rf src/@generated

export TS_POST_PROCESS_FILE="prettier --write"

# run open api generator
npx openapi-generator-cli generate -i scripts/openapi/openapi.yaml -g typescript-axios -o src/@generated --model-name-suffix=Def --generate-alias-as-model --global-property=skipFormModel=false --strict-spec --enable-post-process-file --additional-properties=useSingleRequestParameter=true,supportsES6=true,removeEnumValuePrefix=false,enumPropertyNaming=UPPERCASE

# search and replace enums in the generated files
sed -n 's/^export enum\ \([a-zA-Z0-9]*\)Def {/sed -i '"'"''"'"' '"'"'s\/\1Def\/\1Enum\/g'"'"' src\/\@generated\/*.ts/p' src/@generated/*.ts | bash
