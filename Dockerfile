FROM node:18.20.3

WORKDIR /usr/app

COPY package.json ./

RUN yarn install 

COPY src ./src
COPY docs ./docs
COPY tsconfig.json .
COPY .env.docker ./.env

RUN yarn build

EXPOSE 2000
CMD ["yarn", "dev"]