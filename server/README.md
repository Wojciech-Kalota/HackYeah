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

# Backend Setup

## Build Backend Image
```dockerfile
docker build -f backend_einicjatywa.Dockerfile -t backend_einicjatywa_image .
```

TODO: change the volume to somwhere meaningful XDD
## Launch Backend Container
```dockerfile
docker run -d --name backend_einicjatywa_container --network network_einicjatywa --env-file .env -p 8080:8080 backend_einicjatywa_image
```