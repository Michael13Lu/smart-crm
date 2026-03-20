FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY SmartCRM.sln .
COPY SmartCRM.Core/SmartCRM.Core.csproj SmartCRM.Core/
COPY SmartCRM.Infrastructure/SmartCRM.Infrastructure.csproj SmartCRM.Infrastructure/
COPY SmartCRM.API/SmartCRM.API.csproj SmartCRM.API/
RUN dotnet restore

COPY . .
RUN dotnet publish SmartCRM.API/SmartCRM.API.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "SmartCRM.API.dll"]
