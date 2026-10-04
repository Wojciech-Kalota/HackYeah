FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY rops_rag ./rops_rag

RUN python -m pip install --no-cache-dir ".[api]"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "rops_rag.api:load_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
