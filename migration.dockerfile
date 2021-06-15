FROM node:14-alpine

WORKDIR /code

ENV NODE_ENV=production

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY knexfile.js ./
COPY migrations ./migrations

CMD npm run migrate
