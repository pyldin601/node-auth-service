FROM node:14-alpine

WORKDIR /code

ENV NODE_ENV=production

COPY packages/auth/package.json packages/auth/
COPY packages/auth/package-lock.json packages/auth/
RUN npm --prefix packages/auth ci

COPY packages/auth/knexfile.js packages/auth/
COPY packages/auth/migrations packages/auth/migrations

CMD npm --prefix packages/auth run migrate
