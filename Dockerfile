FROM node:alpine
RUN mkdir -p /code
WORKDIR /code
COPY . .
RUN npm i
CMD ["npm", "start"]


