FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --omit=dev || true
COPY . .
ENV PORT=4000
EXPOSE 4000
CMD ["node", "app.js"]


