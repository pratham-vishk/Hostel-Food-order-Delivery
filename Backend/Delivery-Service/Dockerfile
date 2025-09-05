# ---- Build stage ----
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY . .

# 👇 Build the project (OpenAPI will run automatically before compileJava)
RUN gradle clean build -x test --no-daemon

# ---- Runtime stage ----
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the fat jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
