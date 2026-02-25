# FrawdBot Defense v2 — Power-ups & Shields

## Overview
Add a power-up drop system to the existing Space Invaders easter egg game. Destroyed enemies have a chance to drop collectible power-ups that fall down the screen. The player catches them with the claw to activate effects.

## Power-up Types

| Drop | Symbol | Color | Effect | Duration |
|------|--------|-------|--------|----------|
| Firewall | `[FW]` | green | Shield — absorbs 1 hit without losing a life | Until hit |
| Rapid Scan | `[RS]` | orange | Rapid fire — removes bullet cooldown | ~6 seconds |
| Data Loss Prevention | `[DLP]` | green | Spread shot — fires 3 bullets in a fan | ~6 seconds |
| Two-Factor Auth | `[2FA]` | red | Extra life (max 5) | Permanent |

## Mechanics
- Drop rate: ~15% per kill
- `[2FA]` is rare (~3% of drops)
- Timed power-ups last ~75 ticks (~6 seconds at 80ms)
- Only one timed power-up active at a time (new replaces old)
- Shield stacks: second firewall while shielded is no-op

## Visual Feedback
- Shield active: player renders as `{V}` instead of `/V\`
- Rapid scan active: player blinks orange
- Spread active: fires `!!!` fan pattern
- Flash text on collect: `+FIREWALL`, `+RAPID SCAN`, etc.

## No Changes To
- Level progression, enemy types, touch controls, activation method
