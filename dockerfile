# Base Stage
FROM node:20.17.0-alpine AS base
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./

# Dev stage
FROM base AS dev
RUN npm i
COPY . .
RUN npm run build
CMD ["npm", "run", "dev"]

# Test stage
FROM dev AS test
RUN npm run lint && npm run format-check && npm run test-ci

# Production stage
FROM base AS production
RUN npm ci --omit=dev
COPY --from=test /app/dist ./dist
CMD [ "node", "dist/app.js" ]