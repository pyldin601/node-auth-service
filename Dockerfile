FROM node:14 as libs

WORKDIR /code

COPY tsconfig.json ./
COPY libs/shared-server libs/shared-server
RUN yarn --cwd libs/shared-server install --non-interactive --pure-lockfile
RUN yarn --cwd libs/shared-server build


FROM node:14 as service

WORKDIR /code

COPY tsconfig.json ./
COPY services/auth-server/package.json services/auth-server/
COPY services/auth-server/yarn.lock services/auth-server/
COPY services/auth-server/tsconfig.json services/auth-server/
COPY --from=libs /code/libs libs
RUN yarn --cwd services/auth-server install --non-interactive --pure-lockfile
COPY services/auth-server services/auth-server
RUN yarn --cwd services/auth-server build


FROM node:14-alpine

ENV NODE_ENV=production

COPY --from=service /code/services/auth-server/dist/ /code/
CMD node /code/index.js
