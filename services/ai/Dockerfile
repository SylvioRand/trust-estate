FROM python:3.11-slim

WORKDIR /app

# On garde les outils de build nécessaires pour certaines dépendances Python
RUN apt-get update && apt-get install -y --no-install-recommends \
	curl build-essential && \
	rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# LA LIGNE MAGIQUE : On installe d'abord la version CPU de torch
# Cela empêche les versions GPU (lourdes) de s'installer plus tard
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Ensuite on installe le reste (pip verra que torch est déjà là et ne le réinstallera pas)
RUN pip install --no-cache-dir -r ./requirements.txt && \
	apt-get purge -y --auto-remove build-essential

COPY . .

EXPOSE 3005

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3005"]