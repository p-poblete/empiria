#!/usr/bin/env python3
"""
Publication-ready chart generation utilities.
Provides consistent styling and export for matplotlib visualizations.
"""

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from pathlib import Path

# Default color palettes
CATEGORICAL = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#ea580c', '#64748b']
SEQUENTIAL_BLUE = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']
DIVERGING = ['#1e40af', '#60a5fa', '#f8fafc', '#f87171', '#b91c1c']

def setup_style():
    """Configure matplotlib for publication-quality output."""
    plt.rcParams.update({
        'figure.facecolor': 'white',
        'axes.facecolor': 'white',
        'axes.edgecolor': '#e5e7eb',
        'axes.labelcolor': '#374151',
        'axes.titlecolor': '#111827',
        'axes.grid': True,
        'grid.color': '#f3f4f6',
        'grid.linewidth': 0.8,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'xtick.color': '#6b7280',
        'ytick.color': '#6b7280',
        'font.size': 11,
        'axes.titlesize': 14,
        'axes.labelsize': 11,
        'legend.fontsize': 10,
        'figure.titlesize': 16,
    })

def create_figure(width=10, height=6, dpi=150):
    """Create a figure with standard dimensions."""
    setup_style()
    fig, ax = plt.subplots(figsize=(width, height), dpi=dpi)
    return fig, ax

def save_figure(fig, filename, formats=['png', 'pdf'], output_dir='.'):
    """Save figure in multiple formats."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    base = Path(filename).stem
    saved = []
    
    for fmt in formats:
        path = output_dir / f"{base}.{fmt}"
        fig.savefig(path, bbox_inches='tight', facecolor='white', dpi=150)
        saved.append(str(path))
    
    return saved

def bar_chart(data, labels, title='', xlabel='', ylabel='', horizontal=False, color=None, ax=None):
    """Create a bar chart with consistent styling."""
    if ax is None:
        fig, ax = create_figure()
    else:
        fig = ax.figure
    
    color = color or CATEGORICAL[0]
    
    if horizontal:
        bars = ax.barh(labels, data, color=color, edgecolor='white', linewidth=0.5)
        ax.set_xlabel(ylabel)
        ax.set_ylabel(xlabel)
    else:
        bars = ax.bar(labels, data, color=color, edgecolor='white', linewidth=0.5)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
    
    ax.set_title(title, fontweight='600', pad=15)
    
    return fig, ax

def line_chart(x, y_series, labels=None, title='', xlabel='', ylabel='', ax=None):
    """Create a line chart with multiple series support."""
    if ax is None:
        fig, ax = create_figure()
    else:
        fig = ax.figure
    
    # Ensure y_series is list of series
    if isinstance(y_series[0], (int, float)):
        y_series = [y_series]
        labels = labels or ['']
    
    labels = labels or [f'Series {i+1}' for i in range(len(y_series))]
    
    for i, (y, label) in enumerate(zip(y_series, labels)):
        ax.plot(x, y, color=CATEGORICAL[i % len(CATEGORICAL)], 
                linewidth=2, label=label, marker='o' if len(x) < 15 else None,
                markersize=5)
    
    ax.set_title(title, fontweight='600', pad=15)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    
    if len(y_series) > 1:
        ax.legend(frameon=False)
    
    return fig, ax

def scatter_chart(x, y, title='', xlabel='', ylabel='', color=None, size=50, alpha=0.7, ax=None):
    """Create a scatter plot with optional trend line."""
    if ax is None:
        fig, ax = create_figure()
    else:
        fig = ax.figure
    
    color = color or CATEGORICAL[0]
    
    ax.scatter(x, y, c=color, s=size, alpha=alpha, edgecolors='white', linewidth=0.5)
    
    ax.set_title(title, fontweight='600', pad=15)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    
    return fig, ax

def add_trend_line(ax, x, y, color='#94a3b8'):
    """Add a linear trend line to scatter plot."""
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    x_line = np.linspace(min(x), max(x), 100)
    ax.plot(x_line, p(x_line), '--', color=color, linewidth=1.5, alpha=0.8)

def format_axis(ax, x_format=None, y_format=None):
    """Apply number formatting to axes."""
    from matplotlib.ticker import FuncFormatter
    
    formatters = {
        'percent': lambda x, p: f'{x:.0%}',
        'currency': lambda x, p: f'${x:,.0f}',
        'thousands': lambda x, p: f'{x/1000:.0f}K',
        'millions': lambda x, p: f'{x/1e6:.1f}M',
    }
    
    if x_format and x_format in formatters:
        ax.xaxis.set_major_formatter(FuncFormatter(formatters[x_format]))
    if y_format and y_format in formatters:
        ax.yaxis.set_major_formatter(FuncFormatter(formatters[y_format]))

# Example usage
if __name__ == '__main__':
    # Demo bar chart
    categories = ['Product A', 'Product B', 'Product C', 'Product D']
    values = [45, 32, 67, 28]
    
    fig, ax = bar_chart(values, categories, 
                        title='Q4 Sales by Product',
                        xlabel='Product',
                        ylabel='Revenue ($K)')
    format_axis(ax, y_format='thousands')
    save_figure(fig, 'demo_bar')
    
    print("Demo chart saved to demo_bar.png and demo_bar.pdf")
