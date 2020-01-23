FROM node:current-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 3000

RUN yarn build

CMD [ "yarn", "start" ]
