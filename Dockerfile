FROM node:14

WORKDIR /

RUN npm install -g lerna

COPY lerna.json ./

COPY package*.json ./
COPY packages/fretboard/package*.json ./packages/fretboard/
COPY packages/api/package*.json ./packages/api/

RUN lerna bootstrap

COPY packages/fretboard ./packages/fretboard/
COPY packages/api packages/api/

WORKDIR /packages/api

ENTRYPOINT [ "npm" ]
CMD [ "run", "start" ]