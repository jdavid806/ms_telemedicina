# Usa Node.js 22 como imagen base
FROM node:22

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json (para evitar reinstalar dependencias innecesarias)
COPY package*.json ./

# Instala dependencias (evita instalar las dev en producción)
RUN npm install --only=production

# Copia el resto del código al contenedor
COPY . .

# Expone el puerto de la app
EXPOSE 3000

# Comando de inicio en producción
CMD ["npm", "start"]
