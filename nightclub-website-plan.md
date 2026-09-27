# Nightclub Website Plan

## Visual Direction

Create a cinematic, high-contrast nightclub experience built around black, white, and a single vivid red accent.

- **Background:** near-black (`#0A0A0A`)
- **Text:** off-white (`#F5F5F5`)
- **Supporting surfaces:** charcoal (`#171717`)
- **Accent:** electric red (`#E10600`)
- **Headings:** a bold condensed display typeface
- **Body text:** a simple, readable sans-serif typeface

Use red sparingly: primary calls to action, active navigation links, date badges, thin dividers, and hover effects. The majority of the page should remain monochrome so the red feels intentional and energetic.

## Page Layout

### 1. Header and Navigation

- Nightclub logo or wordmark on the left
- Navigation links: Home, About, Gallery, Reservations, Contact
- Prominent red **Reserve a Table** button on the right
- Sticky navigation with a translucent black backdrop when the user scrolls
- Collapsible hamburger menu for mobile devices

### 2. Hero Section

The hero should be the largest part of the page, occupying roughly 80 to 100 percent of the viewport height.

- Full-bleed black-and-white nightlife image, video, or abstract light texture
- Dark overlay to preserve text legibility
- Large statement headline, such as **Where the night begins.**
- Short supporting copy describing the atmosphere and music
- Primary red button: **Reserve a Table**
- Secondary outlined button: **View Events**
- Optional subtle grain, light sweep, or red glow animation

### 3. About Us

Use a two-column layout: a striking image on one side and the club story on the other.

- Brief introduction to the venue and its identity
- Details about music, interiors, guests, and atmosphere
- Optional metrics, such as capacity, weekly events, or years open
- Large, low-contrast decorative typography or a thin red divider

### 4. Gallery

Present club photography in a visually varied masonry grid.

- Combination of portrait, square, and landscape images
- Some images span multiple columns for rhythm
- Hover state: small image zoom, dark/red overlay, and a **View photo** label
- Clicking an image opens a lightbox on desktop and mobile
- Serve optimized WebP or AVIF images and lazy-load images below the fold

### 5. Reservation Calendar

Give visitors a clear way to choose the date for their party reservation.

- A month selector with previous and next controls
- A month-grid calendar that displays only the dates in the currently selected month
- Available dates are selectable and shown in white
- Unavailable or fully booked dates are muted and cannot be selected
- The chosen date uses the red accent colour
- Selecting a date opens or reveals the reservation form with that date pre-filled

The calendar should not present promotional events or artist listings. It is strictly a date-availability tool: guests choose the month they want, then choose an available day in that month for their party.

### 6. Reservation Call to Action

Add a bold, full-width section just before the footer.

- Headline: **Your table is waiting.**
- One-line reservation prompt
- Red **Reserve Now** button
- Optional reservation phone number and email

The button can open a reservation form, link to a booking platform, or scroll to a compact form section.

### 7. Footer and Contact

The footer should provide practical venue information without losing the visual style.

- Embedded map or styled map preview
- Full address
- Click-to-call phone number
- Working hours
- Reservation email
- Social links: Instagram, TikTok, Facebook
- Compact secondary navigation and copyright notice

## Responsive Behavior

- **Desktop:** spacious hero, two-column About section, masonry gallery, wide month-grid calendar
- **Tablet:** reduced spacing, two-column gallery and a compact calendar grid
- **Mobile:** single-column sections, full-width buttons, touch-friendly calendar, hamburger menu
- All interactive elements should have at least a 44 by 44 pixel touch target

## Accessibility and Performance

- Use semantic elements: `header`, `nav`, `main`, `section`, and `footer`.
- Give gallery images useful alternative text.
- Maintain sufficient colour contrast, particularly red text or buttons on dark backgrounds.
- Support keyboard navigation and visible focus states.
- Respect the `prefers-reduced-motion` user setting.
- Compress and lazy-load images.
- Include page metadata, Open Graph tags, and local-business structured data for search visibility.
