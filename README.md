# Restaurant Application

API for a restaurant application. Created for study purposes.

Link video: https://youtu.be/wF1KZpHX4PQ

Link Swagger: [swagger.json](./docs/api/swagger.json)

## How to Execute
- Run `kubectl apply -f kubernetes`
- Open localhost:30000/docs on your browser
  - You may have to run `kubectl port-forward svc/svc-api 30000:80`
- Make API requests using the Swagger interface

## Backlog (TODO)
- Validate input parameters on controllers
- Improve error handling: return different status code for different error reasons
- Improve file structure: have adapter and core folders under different domains
- Design da arquitetura
- Converter para Clean Architecture