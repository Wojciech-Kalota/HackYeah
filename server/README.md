## Create custom isolated bridge network so containers communicate by container name
```docker file
docker network create network_einicjatywa
```

# Postgres setup

## Build Postgres Image
```dockerfile
docker build -f postgres_einicjatywa.Dockerfile -t postgres_einicjatywa_image .
```

## Launch Postgres Container
```dockerfile
docker run -d --name postgres_einicjatywa_container --network network_einicjatywa --env-file .env -v einicjatywa_volume:/var/lib/postgresql/data -p 5432:5432 postgres_einicjatywa_image
```

# Redis Setup

## Build Redis Image
```dockerfile
docker build -f redis_einicjatywa.Dockerfile -t redis_einicjatywa_image .
```

## Launch Redis Container (Memory restricted to 150MB)
```dockerfile
docker run -d --name redis_einicjatywa_container --network koala_network --restart always --env-file .env -p 6379:6379 redis_einicjatywa_image
```

# Backend Setups

## Build Backend Image
```dockerfile
docker build -f backend_einicjatywa.Dockerfile -t backend_einicjatywa_image .
```

## Launch Backend Container
```dockerfile
docker run -d --name backend_einicjatywa_container --network network_einicjatywa --env-file .env -p 8080:8080 backend_einicjatywa_image
```