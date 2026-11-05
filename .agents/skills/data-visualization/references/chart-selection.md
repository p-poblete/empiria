# Chart Selection Guide

Extended decision tree for choosing the right visualization.

## Quick Decision Tree

```
What are you showing?
│
├─ COMPARISON (values across categories)
│  ├─ Few items (<7)?
│  │  ├─ Precise values matter? → Bar chart (horizontal)
│  │  └─ Ranking emphasis? → Lollipop chart
│  ├─ Many items (7-20)?
│  │  └─ Bar chart (sorted, horizontal)
│  └─ Multiple series?
│     ├─ Compare within category? → Grouped bar
│     └─ Compare totals? → Stacked bar
│
├─ TREND (change over time)
│  ├─ Single series?
│  │  ├─ Continuous data? → Line chart
│  │  └─ Discrete periods? → Column chart
│  ├─ Multiple series?
│  │  ├─ <5 series? → Multi-line chart
│  │  └─ Many series? → Small multiples
│  └─ Show cumulative?
│     └─ Area chart (stacked or stream)
│
├─ DISTRIBUTION (data spread)
│  ├─ Single variable?
│  │  ├─ Detailed shape? → Histogram
│  │  └─ Summary stats? → Box plot
│  ├─ Compare distributions?
│  │  ├─ Few groups? → Violin plot
│  │  └─ Many groups? → Ridgeline plot
│  └─ Show individual points?
│     └─ Strip/Swarm plot
│
├─ COMPOSITION (parts of whole)
│  ├─ Single point in time?
│  │  ├─ 2-5 parts? → Pie/Donut chart
│  │  └─ Many parts? → Treemap
│  ├─ Over time?
│  │  └─ Stacked area/bar
│  └─ Hierarchical?
│     └─ Treemap or Sunburst
│
├─ RELATIONSHIP (correlation)
│  ├─ Two variables?
│  │  ├─ Few points (<100)? → Scatter plot
│  │  └─ Many points? → Hexbin or density
│  ├─ Three variables?
│  │  └─ Bubble chart (size = 3rd var)
│  └─ Many variables?
│     ├─ Correlation matrix? → Heatmap
│     └─ Patterns? → Parallel coordinates
│
└─ GEOSPATIAL
   ├─ Regional data? → Choropleth map
   ├─ Point locations? → Dot/Symbol map
   └─ Flow between locations? → Connection map
```

## Detailed Recommendations

### Bar Charts

**When to use**:
- Comparing discrete categories
- Exact values matter
- Categories have text labels

**Configuration**:
- Horizontal: >5 categories or long labels
- Vertical: Time-based categories, <5 items
- Always start Y-axis at zero
- Sort by value (descending) unless categorical order matters

**Avoid when**:
- Continuous data (use histogram)
- Too many categories (>20, consider filtering)

### Line Charts

**When to use**:
- Continuous data over time
- Showing trends, patterns, rates of change
- Comparing multiple time series

**Configuration**:
- Connect only chronological points
- Use markers sparingly (endpoints, anomalies)
- Limit to 5-7 lines before confusion
- Consider log scale for exponential growth

**Avoid when**:
- Discrete time periods with gaps (use bar)
- Comparing non-temporal categories

### Scatter Plots

**When to use**:
- Exploring correlation between two variables
- Identifying clusters or outliers
- Showing distribution of two dimensions

**Configuration**:
- Add trend line for correlation
- Use opacity for overplotting
- Consider jitter for discrete values
- Size/color can encode additional variables

**Avoid when**:
- One variable is categorical (use box plot)
- Exact values need reading (add table)

### Pie/Donut Charts

**When to use**:
- Parts of a whole (percentages)
- 2-5 categories maximum
- One dominant category to highlight

**Configuration**:
- Start at 12 o'clock, clockwise
- Sort by size (largest first)
- Label directly, avoid legends
- Donut: use center for total/title

**Avoid when**:
- >5 categories (use bar chart)
- Comparing across groups (use stacked bar)
- Similar-sized segments (hard to compare)

### Heatmaps

**When to use**:
- Showing patterns in matrices
- Correlation between many variables
- Time-based patterns (day/hour)

**Configuration**:
- Use sequential color for single direction
- Use diverging color for +/- values
- Add values in cells if readable
- Cluster rows/columns to reveal patterns

**Avoid when**:
- Few data points (use bar/scatter)
- Precise values matter

### Area Charts

**When to use**:
- Emphasizing magnitude over time
- Showing cumulative totals
- Part-to-whole over time (stacked)

**Configuration**:
- Use transparency for overlapping
- Order stacked areas by stability (most stable at bottom)
- Consider stream graph for symmetric view

**Avoid when**:
- Comparing exact values (use line)
- Negative values in stack

## Small Multiples

Use when single chart becomes cluttered:
- Many series on line chart → Grid of individual lines
- Many distributions → Grid of histograms
- Geographic comparisons → Grid of maps

**Layout principles**:
- Same scales across all charts
- Shared axis labels
- Clear facet titles
- Consistent ordering

## Hybrid Approaches

**Box + Strip**: Show summary stats AND individual points
**Bar + Line**: Primary metric (bars) with rate/percentage overlay (line)
**Scatter + Marginal**: Correlation with univariate distributions

## Data Density Guidelines

| Data Points | Recommendation |
|-------------|----------------|
| <20 | Show all points, label directly |
| 20-100 | Scatter/line, selective labels |
| 100-1000 | Consider aggregation or opacity |
| 1000+ | Hexbin, density, or sampling |
