#!/bin/sh

echo "⏳ Attente de RabbitMQ à rabbitmq:5672..."

while ! nc -z rabbitmq 5672; do
  sleep 2
done

echo "✅ RabbitMQ est prêt. Lancement du service..."

exec "$@"
