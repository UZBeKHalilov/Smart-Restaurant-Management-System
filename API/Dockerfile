FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY SmartRestaurant.sln ./
COPY src/ src/
RUN dotnet publish src/SmartRestaurant.API/SmartRestaurant.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SmartRestaurant.API.dll"]
