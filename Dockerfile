# Estágio 1: Builder (Instala dependências e compila pacotes)
FROM python:3.12-slim AS builder

# Instala dependências de build necessárias para compiladores C (ex: psycog2, graphviz)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgraphviz-dev \
    pkg-config \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instala o 'uv' para gerenciamento rápido de pacotes
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY requirements.txt ./

# Cria o ambiente virtual e instala dependências
RUN uv venv /opt/venv && \
    uv pip install --python /opt/venv -r requirements.txt --no-cache
    

# Estágio 2: Runtime (Imagem final, leve e segura)
FROM python:3.12-slim

# Instala apenas as bibliotecas de runtime (sem compiladores)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    graphviz \
    && rm -rf /var/lib/apt/lists/*

# Configura variáveis de ambiente vitais
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Cria um usuário não-root para segurança
RUN useradd -m chama
USER chama

WORKDIR /app

# Copia o ambiente virtual do estágio builder
COPY --from=builder /opt/venv /opt/venv

# Copia o restante do código
COPY . .

# Comando de inicialização unificado (Roda as migrações, arquivos estáticos e sobe o servidor)
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 config.asgi:application"]