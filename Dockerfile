FROM node:25-alpine3.22
LABEL application="stock farmasi"
WORKDIR /stok-farmasi
ENV APPLICATION_PORT=3001
ENV APPLICATION_HOST=0.0.0.0

COPY . .
RUN npm install
RUN npm install -g @infisical/cli
EXPOSE $APPLICATION_PORT/tcp
CMD ["sh", "-c", "infisical run --env=staging -- npm run start"]
