# TindaFlow — Theme System

## Changing the brand color

Open `app/globals.css` and update these three lines inside `:root`:

```css
--brand-h: 142;   /* hue        0–360  */
--brand-s: 71%;   /* saturation 0–100% */
--brand-l: 45%;   /* lightness  0–100% */
```

That's it. Every button, badge, active nav item, avatar background, success state,
and focus ring updates automatically.

### Quick reference — common brand colors

| Color  | Hex       | H   | S   | L   |
|--------|-----------|-----|-----|-----|
| Green  | `#22C55E` | 142 | 71% | 45% |
| Blue   | `#3B82F6` | 217 | 91% | 60% |
| Purple | `#8B5CF6` | 258 | 90% | 66% |
| Orange | `#F97316` |  25 | 95% | 53% |
| Red    | `#EF4444` |   0 | 84% | 60% |
| Teal   | `#14B8A6` | 174 | 80% | 40% |

### How to find HSL for any hex

Use any color picker (e.g. https://colorpicker.me) — paste your hex,
copy the HSL values, replace the three variables above.

---

## Token reference

### Brand shades (Tailwind classes)

| Class         | Lightness | Typical use                        |
|---------------|-----------|------------------------------------|
| `brand-50`    | 97%       | Very light backgrounds             |
| `brand-100`   | 93%       | Avatar backgrounds, badge fills    |
| `brand-200`   | 85%       | Hover backgrounds                  |
| `brand-300`   | 73%       | Borders on light backgrounds       |
| `brand-400`   | 60%       | Disabled states                    |
| `brand-500`   | 45%       | Primary (= `--brand-l`)            |
| `brand-600`   | 38%       | Hover on primary buttons           |
| `brand-700`   | 30%       | Text on light brand backgrounds    |
| `brand-800`   | 22%       | Dark text                          |
| `brand-900`   | 15%       | Very dark, rarely used             |

### shadcn semantic tokens

| Token                  | Used for                              |
|------------------------|---------------------------------------|
| `text-foreground`      | Primary body text                     |
| `text-muted-foreground`| Labels, captions, secondary text      |
| `text-primary`         | Brand-colored text (profit, links)    |
| `bg-background`        | Page background                       |
| `bg-card`              | Card / panel surfaces                 |
| `border-border`        | Default borders                       |
| `text-destructive`     | Error / delete actions                |

---

## Adding new shadcn components

With `components.json` in place, run:

```bash
npx shadcn@2.3.0 add <component-name>
```

Examples: `toast`, `table`, `tabs`, `popover`, `dropdown-menu`
