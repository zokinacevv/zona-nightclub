# ZONA deployment checklist

1. Create a PostgreSQL database and set `DATABASE_URL`.
2. Set `AUTH_SECRET` to a long random value.
3. Configure Resend and set `RESEND_API_KEY`, `RESERVATIONS_FROM_EMAIL`, and `RESERVATIONS_STAFF_EMAIL`.
4. Set `NEXT_PUBLIC_SITE_URL` to the live ZONA domain.
5. Apply the schema with `npx prisma migrate deploy`.
6. Create the first manager directly in PostgreSQL with a bcrypt password hash, or add a one-time seed script before launch.
7. Run `npm run build`, then deploy to a Node-compatible Next.js host.

Before launch, verify a public reservation, staff email, guest email, admin login, manual booking, cancellation, and venue block.
