# Używamy obrazu Node.js jako bazowego
FROM node:20 AS build

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy plik package.json oraz package-lock.json
COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę plików aplikacji
COPY . .

# Budujemy aplikację
RUN npm run build

# Używamy obrazu serwera Nginx
FROM nginx:alpine

# Kopiujemy zbudowane pliki do katalogu, który obsługuje Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Kopiujemy plik konfiguracyjny Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Otwieramy port 80
EXPOSE 80

# Uruchamiamy Nginx
CMD ["nginx", "-g", "daemon off;"]
