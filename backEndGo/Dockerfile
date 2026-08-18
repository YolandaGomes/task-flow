# Etapa de build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY go.mod go.sum ./
RUN go mod download

# Copia todo o projeto
COPY . .

# Compila a aplicação localizada em ./cmd
RUN go build -o server ./cmd

# Imagem final
FROM alpine:latest

WORKDIR /root/

# Copia o executável gerado
COPY --from=builder /app/server .

# Porta da API
EXPOSE 8000

# Executa a aplicação
CMD ["./server"]