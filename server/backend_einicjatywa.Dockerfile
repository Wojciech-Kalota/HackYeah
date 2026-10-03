FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["./eInicjatywa/eInicjatywa.csproj", "./"]
RUN dotnet restore
COPY ./eInicjatywa .
RUN dotnet publish eInicjatywa.csproj -c Debug -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

ENTRYPOINT ["dotnet", "eInicjatywa.dll"]
