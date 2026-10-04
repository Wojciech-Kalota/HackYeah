FROM node:24-alpine AS build
WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

ARG VITE_API_URL=/
ARG VITE_RAG_API_URL=/
ENV VITE_API_URL=$VITE_API_URL \
    VITE_RAG_API_URL=$VITE_RAG_API_URL

RUN npm run build

FROM nginx:1.28-alpine
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

