#!/bin/bash
# Emotion Widget 快速启动脚本

set -e

echo "🧠 Emotion Widget 启动脚本"
echo "=========================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，填入阿里云 AccessKey"
    echo "   然后重新运行此脚本"
    exit 1
fi

echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "✅ 启动成功！"
echo "   演示页面: http://localhost:8080/widget.html"
echo "   API 地址: http://localhost:5000/api/v1"
echo ""
echo "📋 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"