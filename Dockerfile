FROM node:current-alpine as base

RUN mkdir /app
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
RUN yarn install

EXPOSE 3000

# DEV environment stops here

FROM base as build
ENV NODE_ENV=production
COPY . .
RUN yarn build

CMD [ "yarn", "start" ]
