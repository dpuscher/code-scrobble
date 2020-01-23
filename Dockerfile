FROM node:current-alpine as base

RUN mkdir /app
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install

ENV PORT 3000
EXPOSE 3000

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
