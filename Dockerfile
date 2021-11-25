FROM node:14

WORKDIR /usr/app

COPY package.json ./
COPY package-lock.json ./

RUN npm i -g ts-node
RUN npm install
RUN npm rebuild argon2 --build-from-source

COPY . .

ENV NODE_ENV production

EXPOSE 8080

CMD [ "ts-node", "src/index.ts" ]
USER node