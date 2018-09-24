FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
# From Resin template \/
# COPY package.json package.json

RUN npm install
# If you are building your code for production
# RUN npm install --only=production
# From Resin Template \/
# RUN JOBS=MAX npm install --production --unsafe-perm && npm cache clean && rm -rf /tmp/*

# Bundle app source
COPY . .

# From Resin template
# ENV INITSYSTEM on


# !! Resin not using port below \/
EXPOSE 8080
CMD [ "npm", "start" ]