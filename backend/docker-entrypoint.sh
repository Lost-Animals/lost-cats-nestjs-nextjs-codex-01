#!/bin/sh
set -e

if [ -d /app/prisma/migrations ]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi

exec "$@"
