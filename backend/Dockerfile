# Emotion Widget 后端 Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖（PyTorch 需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 PyTorch（CPU 版本，减小镜像大小）
RUN pip install --no-cache-dir torch==2.1.0 --index-url https://download.pytorch.org/whl/cpu

# 安装其他依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV USE_LOCAL_MODEL=true

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "app:app"]