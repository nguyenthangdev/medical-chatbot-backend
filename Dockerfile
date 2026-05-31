FROM node:24-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY src ./src
COPY bi-schema.sql bi-views.sql ./

EXPOSE 3000

CMD ["yarn", "dev"]
