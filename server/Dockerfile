# Używamy obrazu Node.js jako bazowego
FROM node:20

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy plik package.json oraz package-lock.json
COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę plików aplikacji
COPY . .

# Otwieramy port 5000
EXPOSE 5000

# Uruchamiamy aplikację
CMD ["node", "app.js"]
