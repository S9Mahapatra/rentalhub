# Global UI Design Rules (RentalHub)

Based on the provided design system, all new pages, components, buttons, and layouts must strictly adhere to the following aesthetic rules:

## 1. Color Palette & Contrast
- **Primary Backgrounds**: White (`bg-white`) or very light gray (`bg-[#F7F7F9]`, `bg-neutral-50`).
- **Text & Elements**: High contrast black/dark gray (`text-neutral-950`, `bg-neutral-950`) against white backgrounds.
- **Accents**: Use Emerald/Mint Green (`emerald-50`, `emerald-500`, `emerald-700`) for badges, availability indicators, and specific highlights (like "SAVE").
- **Borders**: Soft, semi-transparent borders for cards (`border-neutral-200/80`).

## 2. Typography
- Clean, bold, sans-serif fonts.
- **Headers**: Use `font-extrabold` or `font-black` (e.g., `text-2xl font-extrabold text-neutral-950 tracking-tight`).
- **Subtitles/Labels**: Use uppercase with wide letter spacing for small section labels (e.g., `text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest`).

## 3. Shapes & Components
- **Buttons**: All buttons must be pill-shaped (`rounded-full`).
  - Active/Primary buttons: `bg-neutral-950 text-white shadow-2xs`.
  - Inactive/Secondary buttons: White or light gray backgrounds with dark text (`bg-white text-neutral-600 border border-neutral-200/80`).
- **Cards & Containers**: Use large rounded corners (`rounded-[11px]`, `rounded-[20px]`, `rounded-xl`, `rounded-3xl`).
- **Images**: Should have soft backgrounds (`bg-[#F7F7F9]`) and large rounded corners.

## 4. Badges & Tags
- Pill-shaped badges (`rounded-full`).
- Often use soft background colors with darker text (e.g., `bg-emerald-50 text-emerald-700`).
- Use extremely small text for tags (e.g., `text-[9px]`, `text-[10px]`, `text-[11px]`) combined with `font-bold` or `font-extrabold`.

## 5. Interactions
- Use subtle hover effects (e.g., `hover:shadow-xl`, `hover:border-neutral-300`, `hover:scale-105` for images).
- Active scale interactions on main buttons (`active:scale-95`).

Every page and component built must faithfully reproduce this premium, high-contrast, rounded aesthetic.
