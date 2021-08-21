FROM node:14.17.3-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run compile

FROM gcr.io/distroless/nodejs:14 AS app

WORKDIR /app

COPY --from=build /app/node_modules node_modules

COPY --from=build /app/build build

CMD [ "build/src/index.js" ]
