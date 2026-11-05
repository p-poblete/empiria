# Color Palettes

Curated palettes for data visualization. All tested for colorblind accessibility.

## Categorical (Unordered Categories)

### Default (8 colors)
```
#2563eb  Blue
#dc2626  Red
#16a34a  Green
#ca8a04  Yellow
#9333ea  Purple
#0891b2  Cyan
#ea580c  Orange
#64748b  Slate
```

### Muted (8 colors)
```
#6366f1  Indigo
#f43f5e  Rose
#22c55e  Emerald
#eab308  Amber
#a855f7  Violet
#06b6d4  Teal
#f97316  Orange
#78716c  Stone
```

### High Contrast (6 colors)
```
#1e40af  Blue-900
#b91c1c  Red-700
#15803d  Green-700
#a16207  Yellow-700
#7e22ce  Purple-700
#0e7490  Cyan-700
```

## Sequential (Ordered, Single Hue)

### Blue (5 stops)
```
#dbeafe → #93c5fd → #3b82f6 → #1d4ed8 → #1e3a8a
```

### Green (5 stops)
```
#dcfce7 → #86efac → #22c55e → #15803d → #14532d
```

### Gray (5 stops)
```
#f1f5f9 → #cbd5e1 → #64748b → #334155 → #0f172a
```

### Orange (5 stops)
```
#ffedd5 → #fdba74 → #f97316 → #c2410c → #7c2d12
```

## Diverging (Two Directions from Center)

### Blue-White-Red
```
#1e40af → #60a5fa → #f8fafc → #f87171 → #b91c1c
```

### Green-White-Purple
```
#15803d → #86efac → #f8fafc → #c4b5fd → #7e22ce
```

### Teal-White-Orange
```
#0e7490 → #5eead4 → #f8fafc → #fdba74 → #c2410c
```

## Semantic (Meaning-Driven)

### Status
```
#22c55e  Success/Positive
#eab308  Warning/Caution
#ef4444  Error/Negative
#6b7280  Neutral/Inactive
#3b82f6  Info/Primary
```

### Financial
```
#22c55e  Profit/Up
#ef4444  Loss/Down
#6b7280  Unchanged
```

### Temperature
```
#1e40af  Cold
#3b82f6  Cool
#fbbf24  Warm
#dc2626  Hot
```

## Usage Guidelines

### Applying Palettes

**Categorical data**: Use distinct colors, max 7-8 before confusion
```python
# Matplotlib
colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04']
ax.bar(x, y, color=colors[:len(x)])
```

**Sequential data**: Interpolate between stops
```python
# Generate N colors from sequential palette
from matplotlib.colors import LinearSegmentedColormap
cmap = LinearSegmentedColormap.from_list('custom', ['#dbeafe', '#1e3a8a'])
colors = [cmap(i/n) for i in range(n)]
```

**Diverging data**: Center on meaningful zero
```python
# Normalize around zero
import matplotlib.colors as mcolors
norm = mcolors.TwoSlopeNorm(vmin=-10, vcenter=0, vmax=10)
```

### Recharts Implementation
```jsx
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];

<PieChart>
  {data.map((entry, i) => (
    <Cell key={i} fill={COLORS[i % COLORS.length]} />
  ))}
</PieChart>
```

### Chart.js Implementation
```javascript
const palette = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];
datasets: [{
  backgroundColor: palette,
  borderColor: palette.map(c => c + 'cc'), // slightly transparent
}]
```

## Colorblind Simulation

Test palettes with these tools:
- Coblis: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Viz Palette: https://projects.susielu.com/viz-palette

### Safe Combinations
- Blue + Orange (works for all types)
- Blue + Yellow
- Purple + Green (avoid for deuteranopia)

### Avoid
- Red + Green (protanopia, deuteranopia)
- Blue + Purple (tritanopia)
- Yellow + Light Green
