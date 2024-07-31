# Build stage
FROM node:alpine as build

WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Check the contents of the build directory
RUN ls -la /usr/app/build || ls -la /usr/app/dist

# Production stage
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /usr/app/dist /usr/share/nginx/html

# Copy nginx configuration if you have one
COPY ./default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]