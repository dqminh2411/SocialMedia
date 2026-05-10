FROM node:18-alpine AS builder
WORKDIR /app-fe

# copy package.json and package-lock.json for better dependencies caching
COPY package*.json ./

# install dependencies
RUN npm install

# copy files to /app-fe
COPY . .

# build react app
RUN npm run build


FROM node:18-alpine AS runner
WORKDIR /app-fe

COPY --from=builder /app-fe/dist ./dist

# install 'serve' to serve production build
RUN npm install -g serve

# expose the port 'serve' will use

EXPOSE 3000

# start app using 'serve'
# output folder of "npm run build" is "dist", not "build" in this case
ENTRYPOINT ["serve", "-s", "dist", "-l", "3000"] 