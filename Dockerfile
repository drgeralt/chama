FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    graphviz \
    libgraphviz-dev \
    pkg-config \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
# O build do pygraphviz precisa de pkg-config e libgraphviz-dev
RUN uv venv /opt/venv && uv pip install --python /opt/venv -r requirements.txt --no-cache

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    graphviz \
    && rm -rf /var/lib/apt/lists/*

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN groupmod -g ${GROUP_ID} vscode || groupadd -g ${GROUP_ID} chama \
    && usermod -u ${USER_ID} -g ${GROUP_ID} -s /bin/bash vscode || useradd -u ${USER_ID} -g ${GROUP_ID} -s /bin/bash -m chama

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY . .

RUN chown -R ${USER_ID}:${GROUP_ID} /app
USER ${USER_ID}