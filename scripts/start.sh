#!/bin/sh
set -x

# Replace the statically built BUILT_NEXT_PUBLIC_WEBAPP_URL with run-time NEXT_PUBLIC_WEBAPP_URL
# NOTE: if these values are the same, this will be skipped.
scripts/replace-placeholder.sh "$BUILT_NEXT_PUBLIC_WEBAPP_URL" "$NEXT_PUBLIC_WEBAPP_URL"

# Replace HUB_SSO_SECRET placeholder with runtime value
if [ -n "$HUB_SSO_SECRET" ]; then
  scripts/replace-placeholder.sh "build-time-placeholder-hub-sso-secret" "$HUB_SSO_SECRET"
fi

# Wait for database if DATABASE_HOST is set
if [ -n "$DATABASE_HOST" ]; then
  scripts/wait-for-it.sh ${DATABASE_HOST} -- echo "database is up"
fi

# Run migrations (ignore errors if database already has schema)
npx prisma migrate deploy --schema /calcom/packages/prisma/schema.prisma || echo "Migration skipped (database may already be initialized)"

npx ts-node --transpile-only /calcom/scripts/seed-app-store.ts
yarn start
