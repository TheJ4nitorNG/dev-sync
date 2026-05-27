FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* tsconfig.json turbo.json* ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN npm install
RUN npm run build --workspace=@dev-sync/web

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
