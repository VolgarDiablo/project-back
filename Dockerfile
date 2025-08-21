FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma CLI
RUN npm install -g prisma ts-node

CMD ["npm", "run", "start:dev"]
