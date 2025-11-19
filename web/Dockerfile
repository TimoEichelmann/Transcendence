# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json  ./
RUN  npm install --no-audit --no-fund

# Copy source files
COPY . .

# Build Tailwind CSS
RUN npx @tailwindcss/cli -i ./src/css/dev_main.css -o ./src/css/main.css --minify

# Create dist directory and copy files
RUN mkdir -p ./dist
RUN mkdir -p ./dist/profile-images

RUN cp ./src/css/main.css ./dist/output.css 2>/dev/null || echo "CSS copied or not found"

# Compile TypeScript
RUN npx tsc
RUN ls -la ./dist/  # Debug: list files after TypeScript compilation

# Stage 2: nginx serve
FROM nginx:bookworm
COPY --from=builder /app /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]