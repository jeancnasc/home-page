FROM alpine:3.20.3

RUN apk add --no-cache yarn
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

RUN yarn build

EXPOSE 3000

ENTRYPOINT [ "yarn", "start", "--host", "0.0.0.0" ]
