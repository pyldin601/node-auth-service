FROM node:14 as service

WORKDIR /code

COPY packages/auth/package.json packages/auth/
COPY packages/auth/package-lock.json packages/auth/
COPY packages/auth/tsconfig.json packages/auth/
RUN npm --prefix packages/auth ci

COPY packages/auth packages/auth
RUN npm --prefix packages/auth run build
RUN (cd packages/auth && npm prune --production)

FROM node:14-alpine

WORKDIR /code

ENV NODE_ENV=production

COPY --from=service /code/packages/auth packages/auth

CMD npm --prefix packages/auth start
