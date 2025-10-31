FROM node:25-alpine3.22
LABEL application="stock farmasi"
WORKDIR /stok-farmasi
ENV APPLICATION_PORT=8095
ENV APPLICATION_HOST=0.0.0.0
COPY . .
RUN npm install
EXPOSE $APPLICATION_PORT/tcp
CMD ["npm", "run", "start"]
