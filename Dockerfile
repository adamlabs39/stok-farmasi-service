FROM node:25-alpine3.22
LABEL application="stock farmasi"
WORKDIR /stok-farmasi
ENV APPLICATION_PORT=0.0.0.0
ENV APPLICATION_HOST=3001

COPY . .
RUN npm install
EXPOSE $APPLICATION_PORT/tcp
CMD ["npm", "run", "start"]
