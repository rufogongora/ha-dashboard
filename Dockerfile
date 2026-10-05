# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Rendered to /etc/nginx/conf.d/default.conf at startup with the Spotify
# credentials from the runtime environment (never baked into the image).
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --chmod=755 spotify-auth.envsh /docker-entrypoint.d/05-spotify-auth.envsh
EXPOSE 80
