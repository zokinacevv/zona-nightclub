# Nightclub Reservation System: Next.js and Tailwind CSS

## Goal

Build the nightclub website with **Next.js** and **Tailwind CSS**, including a reservation calendar that lets guests select a future date, start time, and booking duration. Reservations can last from 2 to 4 hours. After every reservation, the venue is unavailable for a fixed 1.5-hour turnover period, so conflicting times are disabled in the interface.

## Front End

### Next.js

Use Next.js with the App Router for the public website and reservation flow.

- Render the main marketing sections as server-rendered pages for fast loading and search visibility.
- Use client components only where the interface changes in the browser, such as the interactive month calendar, time picker, and reservation form.
- Keep backend endpoints in Next.js route handlers under `app/api`.
- Use environment variables for database credentials, email provider keys, and payment or booking integrations.

### Tailwind CSS

Use Tailwind CSS to implement the black, white, and red visual system consistently.

- Black and charcoal backgrounds
- Off-white text
- Red for selected dates, available calls to action, and important status indicators
- Shared button, input, card, and calendar styles
- Responsive utilities for mobile-first layouts

Suggested components:

```text
app/
  page.tsx
  reserve/page.tsx
  api/
    availability/route.ts
    reservations/route.ts
components/
  reservation-calendar.tsx
  time-slot-picker.tsx
  reservation-form.tsx
  reservation-summary.tsx
lib/
  availability.ts
  validation.ts
  database.ts
```

## Reservation Experience

1. The calendar opens on the present month.
2. Past dates are disabled.
3. Guests can move only through the present and future months.
4. Selecting a date loads available time slots for that day.
5. The guest chooses an enabled start time and a duration of 2, 3, or 4 hours, enters their details, and submits the reservation.
6. The confirmation screen and email show the selected date, start time, booking duration, expected end time, and reservation reference.

The calendar should show only the current date and future dates. Dates with no remaining time slots should appear disabled. A selected date and time use the red accent colour.

## Scheduling Rules

Define the booking rule clearly in one shared configuration file:

```ts
export const reservationRules = {
  timezone: "Europe/Skopje",
  allowedDurationsHours: [2, 3, 4],
  slotIntervalMinutes: 30,
  turnoverBufferMinutes: 90,
  openingTime: "21:00",
  closingTime: "05:00",
  minimumAdvanceMinutes: 120,
  bookingWindowDays: 180,
};
```

### Slot Availability

- Generate potential start times only within the venue's opening hours.
- Let the guest select a booking duration of 2, 3, or 4 hours.
- Block the venue for a fixed 1.5-hour turnover period after every booking. For example, a 3-hour booking blocks the venue for 4.5 hours in total: 3 hours for the party and 1.5 hours afterward.
- A new reservation is available only if its full booking interval, including the required cleanup period, does not overlap an existing confirmed or pending reservation.
- Disable already booked times in the time picker.
- Disable a whole date when no time slots remain.
- Use the venue timezone everywhere; never rely on the visitor's browser timezone for saved reservation times.
- Account for overnight service. For example, a 01:00 reservation belongs to the service night that began the previous evening.

For example, if a confirmed reservation starts at 22:00 and lasts 3 hours, it ends at 01:00. The required 1.5-hour venue block then runs until 02:30. Any requested booking whose time would overlap 22:00–02:30 is disabled. A new reservation may begin at 02:30 if there are no other conflicts and the venue is still open.

## Backend Recommendation

Use **PostgreSQL** as the reservation database. It is reliable for date/time queries, supports transactions, and is well suited to preventing double bookings.

Recommended services:

- **Database:** PostgreSQL, hosted through Neon, Supabase, Railway, or a managed cloud provider
- **ORM:** Prisma or Drizzle ORM
- **Validation:** Zod on both the client and server
- **Authentication:** Auth.js with email-and-password login for the admin dashboard
- **Email confirmations:** Resend, Postmark, or another transactional email service
- **Admin access:** a protected Next.js admin area for staff to view, approve, cancel, block, and manually create reservations

## Admin Authentication

The reservation dashboard must be private. Staff access it through a dedicated login page, for example `/admin/login`.

- Use **Auth.js** with a credentials provider for email-and-password login.
- Create admin accounts by invitation only; do not allow public sign-up.
- Store passwords only as secure hashes, never as plain text.
- Keep the session in a secure, HTTP-only cookie.
- Protect every `/admin` page and every staff-only API route on the server.
- Provide a password-reset email flow through Resend.
- Add optional two-factor authentication for the venue owner and managers.
- Record important staff actions, such as creating, cancelling, or overriding a reservation.

Use two roles initially:

- **Manager:** full access, including staff accounts, settings, availability blocks, and conflict overrides.
- **Staff:** can view reservations and create or update regular reservations, but cannot manage accounts or override conflicts.

## Core Data Model

Store reservations with explicit start and end timestamps, plus the end of the cleanup-blocked period, in the nightclub's timezone.

```text
reservations
  id
  reference_code
  guest_name
  email
  phone
  party_size
  starts_at
  ends_at
  blocked_until        // ends_at plus the required 1.5-hour venue block
  status              // pending, confirmed, cancelled, expired
  booking_source       // website, phone, private, walk_in, admin
  staff_notes
  created_by_user_id   // empty for public website reservations
  cancelled_at
  cancellation_reason
  cancelled_by_user_id
  created_at
  updated_at

availability_blocks
  id
  starts_at
  ends_at
  reason              // private event, maintenance, holiday, manual block
  created_at

admin_users
  id
  name
  email               // unique login email
  password_hash
  role                // manager or staff
  created_at
  last_login_at

admin_audit_log
  id
  admin_user_id
  action              // created_reservation, cancelled_reservation, override_conflict, etc.
  reservation_id
  details
  created_at
```

Use a `status` field so temporary unpaid or unapproved reservations can be managed safely. Pending reservations should expire automatically after a short period, such as 10 to 15 minutes, to avoid holding slots indefinitely.

## Availability API

The client should never decide whether a time is available by itself. It requests availability from the server whenever a guest selects a month or date.

Suggested endpoints:

```text
GET  /api/availability?month=2026-10
GET  /api/availability?date=2026-10-03
POST /api/reservations
```

- The monthly request returns which future dates have at least one available time slot.
- The daily request returns the permitted slots and which ones are disabled.
- The create-reservation request independently validates the selected slot before it writes to the database.

Example daily response:

```json
{
  "date": "2026-10-03",
  "slots": [
    { "time": "21:00", "available": true },
    { "time": "22:30", "available": false },
    { "time": "00:00", "available": true }
  ]
}
```

## Preventing Double Bookings

This is the most important backend rule: perform the final conflict check and reservation creation in one database transaction.

1. The server validates that the selected duration is 2, 3, or 4 hours, then calculates `ends_at`.
2. It calculates `blocked_until` by adding the required 1.5-hour venue block to `ends_at`.
3. It checks for existing `pending` or `confirmed` reservations whose booking or cleanup-blocked ranges overlap the requested range.
4. It checks for overlapping manual availability blocks.
5. If no conflict exists, it inserts the reservation and commits the transaction.
6. If a conflict appears, it returns a conflict response and the interface refreshes the available times.

The overlap rule is:

```text
existing.starts_at < requested.blocked_until
AND existing.blocked_until > requested.starts_at
```

For strongest protection, enforce the rule at the database layer as well. PostgreSQL range types and an exclusion constraint can prevent two active reservation ranges from overlapping, even if two guests submit the same time at the same instant.

## Staff Scheduling Tools

The staff-facing reservation area should include:

- Day, week, and month calendar views
- A reservation list with separate **Upcoming** and **Past** views
- Date-range filters, plus filters for status and booking source
- A reservation detail view with guest details, party size, duration, booking source, and staff notes
- A protected **Add Reservation** action for bookings received privately or by phone
- A source selector when staff add a reservation: **Phone**, **Private**, **Walk-in**, or **Admin**
- The same availability check used by the public calendar, so manual reservations cannot accidentally overlap an existing booking or its 1.5-hour turnover block
- An explicit manager-only override with a required reason, for exceptional situations where staff intentionally need to bypass a conflict warning
- Reservation status controls: approve, cancel, mark as no-show
- A cancellation action that requires a reason, changes the reservation status to `cancelled`, and immediately releases its date and time for future bookings
- Optional cancellation confirmation email through Resend, sent to the guest when an email address is available
- Manual blocks for private events, holidays, or maintenance
- Editable opening hours by weekday
- Configurable capacity, party-size limits, booking duration, and the 1.5-hour turnover block
- Guest-history search by full or partial name, phone number, email address, or reservation reference code
- A guest search result that shows every past, current, cancelled, and future reservation tied to the matching details
- Exportable reservation list for the evening team

### Manual Reservation Flow

1. A staff member opens the protected admin dashboard and selects **Add Reservation**.
2. They enter the guest name, contact details, party size, date, start time, and 2-, 3-, or 4-hour duration.
3. They set the booking source to **Phone** or **Private** and optionally add a staff note.
4. The server checks for conflicts, including the required 1.5-hour venue block after other reservations.
5. If the time is available, the reservation is saved and shown in both the upcoming calendar and reservation list.
6. The staff member can choose whether to send a confirmation email through Resend; this is useful for phone bookings where the caller provided an email address.

### Cancellation and Guest History

Staff can cancel a reservation from its detail page. The system records who cancelled it, when it was cancelled, and the cancellation reason; it does not delete the booking record. Keeping cancelled reservations supports reliable guest history and staff reporting.

After cancellation, the reservation's booking window and its 1.5-hour turnover block are removed from availability checks, allowing the date and time to be booked again. The cancellation is recorded in the admin audit log and can trigger a Resend cancellation email to the guest.

The dashboard guest search should match at least one known detail, such as a name, email address, phone number, or reservation reference. This lets staff quickly see whether a caller has booked before, review previous party sizes or booking durations, and identify cancelled or no-show reservations before creating a new booking.

## Security and Reliability

- Validate every field on the server, not only in the browser.
- Rate-limit reservation submissions to reduce spam and automated bookings.
- Add CAPTCHA only if spam becomes a genuine issue.
- Require HTTPS in production.
- Store all times as timezone-aware timestamps and display them in `Europe/Skopje`.
- Send confirmation and cancellation emails.
- Log booking conflicts and failed submissions for staff review.
- Back up the database and limit admin access by role.

## Recommended Delivery Order

1. Build the public Next.js and Tailwind interface.
2. Add the calendar with future dates and static sample availability.
3. Add PostgreSQL tables and the availability endpoint.
4. Add transactional reservation creation and double-booking protection.
5. Add confirmation emails and a staff admin calendar.
6. Test opening hours, overnight bookings, simultaneous requests, cancellations, and timezone changes.
