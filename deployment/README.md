# Wdrozenie na jednym VPS

Konfiguracja zachowuje obecna architekture: osobny PostgreSQL dla backendu,
osobny PostgreSQL dla RAG, Redis oraz osobne kontenery backendu, RAG i
frontendu. Na zewnatrz wystawiony jest tylko port 80. Nginx kieruje zwykle
zapytania `/api/*` do backendu, a `/api/ideas/analyze` do RAG.

## 1. Przygotowanie VPS

Uzyj Ubuntu Server 24.04. Zaloguj sie przez SSH i zainstaluj Docker Engine
oraz wtyczke Docker Compose z oficjalnego repozytorium Dockera:

https://docs.docker.com/engine/install/ubuntu/

Na maszynie z 4 GB RAM utworz tez 4 GB swapu:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl --system
```

## 2. Przeslanie projektu

Z lokalnego PowerShella, po podstawieniu klucza i adresu IP:

```powershell
scp -i "C:\sciezka\klucz.pem" -r "C:\Users\igorm\Desktop\krak\HackYeah" azureuser@ADRES_IP:~/
```

Nazwa uzytkownika i sposob logowania moga byc inne u dostawcy VPS.

## 3. Sekrety

Na serwerze:

```bash
cd ~/HackYeah
cp .env.production.example .env.production
nano .env.production
```

Uzupelnij trzy rozne hasla i `OPENAI_API_KEY`. Plik `.env.production` jest
ignorowany przez Git. Nie wysylaj go ani nie wklejaj publicznie.

## 4. Budowanie i start

Na VPS z 4 GB RAM buduj obrazy kolejno:

```bash
docker compose --env-file .env.production -f compose.production.yaml build backend
docker compose --env-file .env.production -f compose.production.yaml build rag-api
docker compose --env-file .env.production -f compose.production.yaml build frontend
docker compose --env-file .env.production -f compose.production.yaml up -d
```

Sprawdz stan i logi:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --tail=100
curl http://127.0.0.1/api/utils/health
```

Strona powinna byc dostepna pod `http://ADRES_IP`.

## 5. Firewall

Po sprawdzeniu, ze SSH dziala:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

Nie otwieraj portow 5432, 6379, 8000 ani 8080.

## 6. Aktualizacja i zatrzymanie

Po przeslaniu nowej wersji ponownie zbuduj tylko zmieniona usluge, a potem
uruchom `up -d`. Przyklad dla frontendu:

```bash
docker compose --env-file .env.production -f compose.production.yaml build frontend
docker compose --env-file .env.production -f compose.production.yaml up -d frontend
```

Zatrzymanie kontenerow bez usuwania danych:

```bash
docker compose --env-file .env.production -f compose.production.yaml down
```

Przy zakonczeniu testu usun VPS w panelu dostawcy, aby zatrzymac naliczanie
oplat. Samo wylaczenie systemu nie zawsze konczy rozliczenie uslugi.

