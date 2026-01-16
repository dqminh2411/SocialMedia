FROM node:18-alpine AS builder
WORKDIR /react-app

# copy package.json and package-lock.json for better dependencies caching
COPY package*.json ./

# install dependencies
RUN npm install

# copy files to /react-app
COPY . .

# build react app
RUN npm run build


FROM node:18-alpine AS runner
WORKDIR /react-app

COPY --from=builder /react-app/dist ./dist

# install 'serve' to serve production build
RUN npm install -g serve

# expose the port 'serve' will use

EXPOSE 3000

# start app using 'serve'
# output folder of "npm run build" is "dist", not "build" in this case
ENTRYPOINT ["serve", "-s", "dist", "-l", "3000"] 