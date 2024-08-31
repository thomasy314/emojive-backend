#Build stage
FROM node:20.17.0-alpine AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:20.17.0-alpine AS production

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

CMD [ "node", "dist/app.js" ]