#!/bin/bash

# PRISM is used for create local mock server from the OpenAPI Spec

# First install prism manually
# yarn global add @stoplight/prism-cli

prism mock openapi/openapi.yaml --port 8080
