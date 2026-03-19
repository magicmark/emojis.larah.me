FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
RUN npm install -g serve
COPY --from=build /app/dist /app
EXPOSE 8080
CMD ["serve", "-s", "/app", "-l", "8080"]
