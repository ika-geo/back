FROM node:18
WORKDIR /usr/src/app
# Install chromium and other dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/* 
    
COPY package*.json ./
# Install application dependencies
RUN npm install
RUN npm install phantomjs-prebuilt@2.1.13 --ignore-scripts

COPY . .
EXPOSE 3001
CMD ["node", "api/index.js"]
