FROM node:14 as service

WORKDIR /code

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm ci

COPY ./ ./
RUN npm run build
RUN npm prune --production

FROM node:14-alpine

WORKDIR /code

ENV NODE_ENV=production

COPY --from=service /code ./

CMD npm start
