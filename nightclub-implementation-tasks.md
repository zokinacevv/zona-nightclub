# Nightclub Website and Reservation System: Detailed Tasks

## Project Outcome

Deliver a black, white, and red nightclub website built with Next.js and Tailwind CSS. Guests can reserve a future date and available start time for a 2-, 3-, or 4-hour party. Every booking blocks the venue for a further 1.5 hours. Staff can securely manage reservations through an admin dashboard.

## Scope and Fixed Rules

- Use Next.js App Router and Tailwind CSS.
- Use `Europe/Skopje` as the venue timezone.
- Show only the current and future months in the public reservation calendar.
- Disable past dates, unavailable dates, unavailable times, and dates with no remaining slots.
- Allow booking durations of 2, 3, or 4 hours.
- After each reservation ends, block the venue for 90 minutes.
- Use Resend for guest and staff email notifications.
- Require staff login to access the admin dashboard.

## Phase 1: Project Foundation

### 1. Set up the application

- Create the Next.js project with TypeScript and the App Router.
- Configure Tailwind CSS and global base styles.
- Add environment-variable templates for the database, Auth.js, and Resend.
- Add linting, formatting, and a basic test command.
- Create route groups for public pages and the protected admin area.

**Done when:** the application starts locally, Tailwind classes render correctly, and environment secrets are not committed to source control.

### 2. Create the design system

- Add colour tokens for near-black, charcoal, off-white, and red.
- Define heading and body type styles.
- Create reusable Tailwind component patterns for buttons, section headings, form fields, cards, status badges, dialogs, and error messages.
- Add keyboard focus styles and reduced-motion support.

**Done when:** red is reserved for meaningful states and calls to action, and every interactive component is usable with keyboard navigation.

## Phase 2: Public Marketing Website

### 3. Build the header and navigation

- Add logo or club wordmark.
- Add links: Home, About, Gallery, Reservations, Contact.
- Add the red **Reserve a Table** call to action.
- Make the header sticky with a translucent dark background after scrolling.
- Add a mobile hamburger menu with accessible open, close, and focus behavior.

**Done when:** all links scroll or navigate to the correct section, and the navigation works on desktop and mobile.

### 4. Build the hero section

- Add full-viewport black-and-white visual treatment.
- Add a readable dark overlay, headline, supporting copy, and reservation CTA.
- Link the primary CTA to the reservation calendar.
- Add only subtle motion that respects `prefers-reduced-motion`.

**Done when:** the reservation CTA is visible without scrolling on common desktop and mobile screen sizes.

### 5. Build content sections

- Add the About section with club story, image, and optional venue metrics.
- Add a responsive masonry-style gallery with optimized images.
- Add a gallery lightbox with close control, keyboard support, and alt text.
- Add the full-width reservation CTA section.
- Add the footer with map, address, phone, working hours, email, social links, and secondary navigation.

**Done when:** the public page includes all planned sections, images load efficiently, and contact details are actionable on mobile.

## Phase 3: Reservation Data and Scheduling

### 6. Create the database schema

- Provision PostgreSQL.
- Add `reservations`, `availability_blocks`, `admin_users`, and `admin_audit_log` tables.
- Add indexes for reservation start time, status, phone, and email searches.
- Store `starts_at`, `ends_at`, and `blocked_until` as timezone-aware timestamps.
- Add database migrations and seed data for local development.

**Done when:** a test reservation, an availability block, an admin user, and an audit-log entry can be created locally.

### 7. Implement shared booking rules

- Create one server-side configuration module for the timezone, opening hours, 30-minute slot interval, 2/3/4-hour duration options, 90-minute turnover block, minimum advance time, and booking window.
- Calculate `ends_at` from the selected duration.
- Calculate `blocked_until` as `ends_at + 90 minutes`.
- Handle booking sessions that run past midnight.
- Validate that booking end and blocked times follow the venue’s operating rules.

**Done when:** a reservation from 22:00 for 3 hours ends at 01:00 and prevents a new booking before 02:30.

### 8. Build availability services and API routes

- Build a monthly availability endpoint that returns future dates with at least one valid start time.
- Build a daily availability endpoint that returns selectable and disabled times for the selected date and duration.
- Exclude cancelled and expired reservations from blocking availability.
- Include confirmed and pending reservations in conflict checks.
- Include manual availability blocks in conflict checks.
- Return clear validation errors for invalid or past dates.

**Done when:** the API never returns a time that would overlap an existing booking, its 90-minute turnover period, or a manual block.

### 9. Prevent double bookings

- Build the create-reservation endpoint.
- Recalculate all dates and availability on the server; never trust client availability alone.
- Perform the conflict check and reservation insert in a single transaction.
- Add a database-level overlap constraint for active reservations where practical.
- Return a conflict response if another guest reserves the slot first.
- Refresh client availability after a conflict response.

**Done when:** two simultaneous requests for the same slot produce only one successful reservation.

## Phase 4: Public Reservation Flow

### 10. Build the reservation calendar

- Start the calendar on the current month.
- Allow navigation to future months only, up to the configured booking window.
- Disable past dates and dates with no available slots.
- Use red for the currently selected date.
- Load monthly availability when the visitor changes month.
- Load daily time availability when the visitor selects a date.

**Done when:** guests see only valid future dates and cannot select a fully booked or past day.

### 11. Build the reservation form and time picker

- Display enabled and disabled time slots for the chosen date.
- Let the guest select a 2-, 3-, or 4-hour duration.
- Re-check available start times if the duration changes.
- Collect guest name, email, phone number, party size, and optional notes.
- Validate fields in the browser and again on the server.
- Show a clear reservation summary before submission.
- Show a confirmation view with reference code, date, time, duration, and expected end time.

**Done when:** a guest can complete a valid reservation and receives a useful response for invalid or now-unavailable selections.

### 12. Add notification emails with Resend

- Create a guest confirmation email template.
- Create a staff notification email template.
- Send both only after the database transaction succeeds.
- Include reference code, contact information, date, time, duration, party size, and booking source in staff emails.
- Add cancellation email support.
- Record email failures for retry or staff review without invalidating an already saved reservation.

**Done when:** confirmed website reservations send a guest email and staff notification email.

## Phase 5: Admin Authentication and Dashboard

### 13. Add staff authentication

- Set up Auth.js credentials login at `/admin/login`.
- Create invitation-only staff accounts; do not offer public registration.
- Hash passwords securely.
- Add password reset emails using Resend.
- Protect admin pages and APIs with server-side session checks.
- Add role checks for `manager` and `staff`.
- Record staff actions in `admin_audit_log`.

**Done when:** unauthenticated users cannot access admin routes or staff APIs, and a manager can create a staff account.

### 14. Build the admin reservation dashboard

- Add dashboard summary cards for today’s, upcoming, and pending reservations.
- Add day, week, and month calendar views.
- Add separate Upcoming and Past reservation lists.
- Add filters for date range, status, and booking source.
- Add search by partial name, phone, email, and reference code.
- Build a reservation detail panel with complete guest and booking information.

**Done when:** staff can find a caller’s previous bookings by one known detail and review past, future, cancelled, and no-show records.

### 15. Add manual reservations

- Add a protected **Add Reservation** action.
- Collect the same core reservation details as the public flow.
- Let staff mark source as Phone, Private, Walk-in, or Admin.
- Add staff notes.
- Run the same conflict check and 90-minute turnover rule as the public booking route.
- Allow staff to choose whether to send a confirmation email.
- Limit conflict overrides to managers, requiring an override reason and audit-log entry.

**Done when:** staff can create a phone or private reservation without it overlapping another active booking.

### 16. Add cancellation and availability blocks

- Add a cancellation control to the reservation detail view.
- Require a cancellation reason.
- Set status to `cancelled`; never delete reservation history.
- Record cancelled time, staff member, and reason.
- Remove the cancelled booking from future availability conflict checks.
- Optionally send a guest cancellation email.
- Add manual venue blocks for private events, maintenance, and holidays.

**Done when:** cancelling a future booking makes its slot available again, while the cancelled record remains searchable in history.

## Phase 6: Quality, Security, and Launch

### 17. Test critical booking scenarios

- Test all 2-, 3-, and 4-hour durations.
- Test the 90-minute venue turnover rule.
- Test bookings before and after midnight.
- Test full dates, manual blocks, cancellations, pending-expiry behavior, and conflicting concurrent requests.
- Test staff and manager permissions.
- Test desktop, tablet, and mobile reservation flows.

**Done when:** automated and manual tests cover the scheduling rules and no unauthorized role can perform manager-only actions.

### 18. Complete accessibility and performance checks

- Check contrast, focus states, form labels, error messages, keyboard navigation, and calendar accessibility.
- Optimise and lazy-load gallery images.
- Add metadata, Open Graph tags, sitemap, robots rules, and local-business structured data.
- Check Core Web Vitals and mobile performance.

**Done when:** the site is usable with keyboard-only navigation and has no major accessibility or performance regressions.

### 19. Deploy and operate

- Configure production database, environment variables, custom domain, and HTTPS.
- Configure Resend sending domain and staff notification recipient list.
- Set database backups and error monitoring.
- Seed the first manager account securely.
- Create a short staff guide covering login, manual bookings, cancellations, guest history search, and manual blocks.

**Done when:** staff can log in, receive reservation emails, manage the calendar, and recover from ordinary booking issues without developer help.

## Final Acceptance Checklist

- [ ] Public page follows the black, white, and red nightclub design.
- [ ] Navigation includes Reservations, and CTAs open the reservation experience.
- [ ] Calendar shows only present and future dates.
- [ ] Unavailable dates and hours are disabled.
- [ ] Guests can choose 2-, 3-, or 4-hour reservations.
- [ ] Every booking blocks the venue for 90 minutes after its end.
- [ ] The system prevents double bookings, including simultaneous submissions.
- [ ] Guests and staff receive reservation emails through Resend.
- [ ] Admin users can log in securely.
- [ ] Staff can view past and future bookings and search guest history.
- [ ] Staff can add phone and private reservations.
- [ ] Staff can cancel bookings without losing reservation history.
- [ ] Managers can manage staff, availability blocks, and exceptional overrides.
