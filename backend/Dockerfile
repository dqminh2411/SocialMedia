# build stage
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build_stage
WORKDIR /app
# Copy only pom.xml first to cache dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline
# Now copy source code (faster rebuilds since dependencies are cached)
COPY src ./src
RUN ["mvn","clean","package", "-DskipTests"]

# run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build_stage /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]