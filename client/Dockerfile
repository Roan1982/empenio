FROM node:18-alpine

WORKDIR /app

# Copiar solo package.json (sin package-lock.json)
COPY package.json ./

# Instalar dependencias sin package-lock
RUN npm install --legacy-peer-deps --no-package-lock

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV REACT_APP_API_URL=http://localhost:5000/api
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV CI=true

# Comando de inicio
CMD ["npm", "start"]
