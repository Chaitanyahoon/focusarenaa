# ---- Build Stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first (layer caching)
COPY FocusArena.API/FocusArena.API.csproj FocusArena.API/
COPY FocusArena.Application/FocusArena.Application.csproj FocusArena.Application/
COPY FocusArena.Domain/FocusArena.Domain.csproj FocusArena.Domain/
COPY FocusArena.Infrastructure/FocusArena.Infrastructure.csproj FocusArena.Infrastructure/
RUN dotnet restore FocusArena.API/FocusArena.API.csproj

# Copy everything and build
COPY . .
RUN dotnet publish FocusArena.API/FocusArena.API.csproj -c Release -o /app/publish --no-restore

# ---- Runtime Stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render sets PORT env var
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "FocusArena.API.dll"]
