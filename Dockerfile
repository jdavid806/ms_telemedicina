# Usa una versión estable de Node.js
FROM node:22

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala dependencias en producción
RUN npm ci --only=production

# Asegura que TypeScript está instalado para poder compilar
RUN npm install -g typescript

# Copia el resto del código
COPY . .

# Compila TypeScript a JavaScript
RUN npm run build

# Establece la variable de entorno para producción
ENV NODE_ENV=production

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
