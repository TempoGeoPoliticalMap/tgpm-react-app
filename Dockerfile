FROM node:18-alpine

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
RUN npm run build
USER node

EXPOSE 8080
CMD "npm" "start"