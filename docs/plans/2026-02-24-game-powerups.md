# FrawdBot Defense v2 — Power-ups Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a power-up drop system to the FrawdBot Defense easter egg game.

**Architecture:** When an enemy dies, roll a random chance to spawn a power-up object that falls downward. If the player's claw overlaps the drop, activate the effect. Timed effects use a countdown. Shield modifies damage logic. All changes are within the single `index.html` IIFE game script.

**Tech Stack:** Vanilla JavaScript (no dependencies), ASCII rendering into existing terminal DOM element.

---

### Task 1: Add Power-up Data Definitions

**Files:**
- Modify: `index.html:629-633` (after TYPES array)

**Step 1: Add POWERUPS array after TYPES**

```javascript
var POWERUPS = [
    { ch: '[FW]', cls: 'highlight', name: 'FIREWALL', effect: 'shield', weight: 35 },
    { ch: '[RS]', cls: 'warn', name: 'RAPID SCAN', effect: 'rapid', weight: 30 },
    { ch: '[DLP]', cls: 'highlight', name: 'DLP', effect: 'spread', weight: 30 },
    { ch: '[2FA]', cls: 'alert', name: '2FA', effect: 'life', weight: 5 }
];
var DROP_CHANCE = 0.15;
var POWERUP_DURATION = 75; // ticks (~6 seconds at 80ms)
```

**Step 2: Verify**

Open `frawdbot.ai/index.html` in browser, open console, confirm no JS errors. Game should still play identically.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(game): add power-up data definitions"
```

---

### Task 2: Add Power-up State to Game Init

**Files:**
- Modify: `index.html` — inside `start()` function, the `state = { ... }` block (~line 659-673)

**Step 1: Add new state fields to the state object**

Add these fields to the state initializer:

```javascript
powerups: [],    // active falling power-up objects
shield: false,   // firewall shield active
rapid: 0,        // rapid scan ticks remaining
spread: 0,       // DLP spread ticks remaining
flashMsg: '',    // e.g. "+FIREWALL"
flashTick: 0     // flash message countdown
```

**Step 2: Verify**

Open browser, play game, confirm still works. No visible changes yet.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(game): add power-up state fields"
```

---

### Task 3: Spawn Power-ups on Enemy Kill

**Files:**
- Modify: `index.html` — inside the bullet-enemy collision block (~line 793-803)

**Step 1: Add drop roll after enemy kill**

After `state.booms.push(...)` inside the collision handler, add:

```javascript
// power-up drop
if (Math.random() < DROP_CHANCE) {
    var roll = Math.random() * 100, cum = 0;
    for (var p = 0; p < POWERUPS.length; p++) {
        cum += POWERUPS[p].weight;
        if (roll < cum) {
            state.powerups.push({ x: e.x, y: e.y, type: POWERUPS[p], tick: 0 });
            break;
        }
    }
}
```

**Step 2: Verify**

Play the game — nothing visible yet (power-ups exist in state but aren't rendered or moved). Check console for errors.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(game): spawn power-ups on enemy kill"
```

---

### Task 4: Move and Collect Power-ups

**Files:**
- Modify: `index.html` — inside `tick()` function, after the enemy bullet-hits-player block (~line 812)

**Step 1: Add power-up movement and collection logic**

Add after the enemy-bullet-hits-player block:

```javascript
// move power-ups down and check collection
state.powerups = state.powerups.filter(function(p) {
    p.tick++;
    if (p.tick % 2 === 0) p.y++; // fall at half speed
    if (p.y >= H) return false;   // off screen

    // collision with player
    if (p.y >= H - 2 && p.x + p.type.ch.length > state.px && p.x < state.px + 3) {
        // activate effect
        if (p.type.effect === 'shield') {
            state.shield = true;
        } else if (p.type.effect === 'rapid') {
            state.rapid = POWERUP_DURATION;
            state.spread = 0; // replace active timed power-up
        } else if (p.type.effect === 'spread') {
            state.spread = POWERUP_DURATION;
            state.rapid = 0;
        } else if (p.type.effect === 'life') {
            state.lives = Math.min(5, state.lives + 1);
        }
        state.flashMsg = '+' + p.type.name;
        state.flashTick = 20;
        return false;
    }
    return true;
});

// decay timed power-ups
if (state.rapid > 0) state.rapid--;
if (state.spread > 0) state.spread--;
if (state.flashTick > 0) state.flashTick--;
```

**Step 2: Verify**

Play the game — power-ups should now fall and be collectible. Effects not yet visible besides extra lives.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(game): power-up movement and collection logic"
```

---

### Task 5: Modify Shooting for Rapid Fire and Spread Shot

**Files:**
- Modify: `index.html` — the shooting block in `tick()` (~line 758-765)

**Step 1: Replace the existing shoot block**

Replace the current shoot logic with:

```javascript
// shoot
if (keys[' '] || keys['ArrowUp']) {
    var canShoot = state.rapid > 0
        ? !state.bullets.some(function(b) { return b.y > H - 4; })
        : !state.bullets.some(function(b) { return b.y > H - 6; });
    if (canShoot) {
        if (state.spread > 0) {
            // spread: 3 bullets in a fan
            state.bullets.push({ x: state.px + 1, y: H - 3, dx: 0 });
            state.bullets.push({ x: state.px, y: H - 3, dx: -1 });
            state.bullets.push({ x: state.px + 2, y: H - 3, dx: 1 });
        } else {
            state.bullets.push({ x: state.px + 1, y: H - 3, dx: 0 });
        }
    }
    if (state.rapid <= 0) {
        keys[' '] = false;
        keys['ArrowUp'] = false;
    }
}
```

**Step 2: Update bullet movement to support dx**

Replace the existing bullet movement line:

```javascript
state.bullets = state.bullets.filter(function(b) { b.y--; return b.y >= 0; });
```

With:

```javascript
state.bullets = state.bullets.filter(function(b) {
    b.y--;
    b.x += (b.dx || 0);
    return b.y >= 0 && b.x >= 0 && b.x < W;
});
```

**Step 3: Verify**

Play game, collect `[RS]` drop — should be able to hold space for rapid fire. Collect `[DLP]` — should fire 3 bullets.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(game): rapid fire and spread shot mechanics"
```

---

### Task 6: Modify Damage Logic for Shield

**Files:**
- Modify: `index.html` — the enemy-bullet-hits-player block (~line 806-811)

**Step 1: Replace damage logic to check shield**

Replace:

```javascript
state.ebullets.forEach(function(b) {
    if (b.y >= H - 2 && b.x >= state.px && b.x <= state.px + 2) {
        state.lives--;
        b.y = H + 1;
        if (state.lives <= 0) { state.over = true; state.won = false; }
    }
});
```

With:

```javascript
state.ebullets.forEach(function(b) {
    if (b.y >= H - 2 && b.x >= state.px && b.x <= state.px + 2) {
        if (state.shield) {
            state.shield = false;
            state.flashMsg = '-FIREWALL';
            state.flashTick = 20;
        } else {
            state.lives--;
            if (state.lives <= 0) { state.over = true; state.won = false; }
        }
        b.y = H + 1;
    }
});
```

**Step 2: Verify**

Collect `[FW]`, get hit — should lose shield not life. Second hit loses life normally.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(game): shield absorbs one hit"
```

---

### Task 7: Render Power-ups, Shield, and Flash Messages

**Files:**
- Modify: `index.html` — inside `render()` function (~line 834-916)

**Step 1: Add power-up rendering after enemy bullets block**

After the enemy bullets rendering block (after line 865), add:

```javascript
// power-ups
state.powerups.forEach(function(p) {
    var ch = p.type.ch;
    for (var i = 0; i < ch.length; i++) {
        if (p.x + i < W && p.y >= 0 && p.y < H) {
            grid[p.y][p.x + i] = { c: ch[i], s: p.type.cls };
        }
    }
});
```

**Step 2: Modify player rendering for shield state**

Replace the player rendering block:

```javascript
// player /V\ (the claw)
var py = H - 2;
if (state.px < W) grid[py][state.px] = { c: '/', s: 'warn' };
if (state.px + 1 < W) grid[py][state.px + 1] = { c: 'V', s: 'warn' };
if (state.px + 2 < W) grid[py][state.px + 2] = { c: '\\', s: 'warn' };
```

With:

```javascript
// player — {V} if shielded, /V\ if not
var py = H - 2;
var pCls = state.rapid > 0 && state.tick % 4 < 2 ? 'alert' : 'warn';
if (state.shield) {
    if (state.px < W) grid[py][state.px] = { c: '{', s: 'highlight' };
    if (state.px + 1 < W) grid[py][state.px + 1] = { c: 'V', s: 'highlight' };
    if (state.px + 2 < W) grid[py][state.px + 2] = { c: '}', s: 'highlight' };
} else {
    if (state.px < W) grid[py][state.px] = { c: '/', s: pCls };
    if (state.px + 1 < W) grid[py][state.px + 1] = { c: 'V', s: pCls };
    if (state.px + 2 < W) grid[py][state.px + 2] = { c: '\\', s: pCls };
}
```

**Step 3: Add flash message to HUD**

In the HUD rendering section, after the `LIVES:` line (after line 897), add the flash message:

Replace:

```javascript
h += s(quit, 'output');
```

With:

```javascript
h += s(quit, 'output');

// flash message
if (state.flashTick > 0) {
    h += '\n' + s('  ' + state.flashMsg, state.flashMsg.charAt(0) === '+' ? 'highlight' : 'alert');
}
```

**Step 4: Verify**

Full playtest: destroy enemies, see drops falling, collect them, see `{V}` shield, rapid fire blink, spread fan, flash text.

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat(game): render power-ups, shield visual, flash messages"
```

---

### Task 8: Final Cleanup and Squash

**Step 1: Playtest edge cases**

- Collect power-up at screen edge
- Get hit with shield active
- Collect `[2FA]` at 5 lives (should cap)
- Rapid fire + level transition
- Mobile touch controls still work

**Step 2: Squash commits into one**

```bash
git rebase -i HEAD~7
# squash all into first, message: "feat(game): add power-up system — shield, rapid fire, spread shot, extra life"
```

**Step 3: Push**

```bash
git push
```
