import math
import os
from datetime import datetime
from typing import List, Dict, Any

# --- CONFIGURATION ---
WIDTH = 1000
HEIGHT = 600
THEME = {
    "bg": "#0D1117",
    "border": "#30363D",
    "text": "#C9D1D9",
    "accent": "#58A6FF",
    "warn": "#D29922",
    "font": "'Fira Code', monospace"
}

PROJECTS = [
    {"id": "aeowun", "name": "AEOWUN", "tag": "[BRAIN]", "x": 500, "y": 280},
    {"id": "drop", "name": "DROP", "tag": "[VAULT]", "x": 200, "y": 150},
    {"id": "axeis", "name": "AXEIS", "tag": "[AUDIT]", "x": 200, "y": 410},
    {"id": "lango", "name": "LANGO", "tag": "[SIM]", "x": 800, "y": 150},
    {"id": "leftovers", "name": "FRIDGE", "tag": "[MOBILE]", "x": 800, "y": 410},
]

# --- MATH ENGINE (Cardano's Cubic Formula) ---
class CardanoSolver:
    """
    Solves for the analytical inversion of a cubic spline mapping.
    Specifically solves 3u^2 - 2u^3 = p (the standard easing curve u(3-2u)).
    """
    @staticmethod
    def solve_for_t(p: float) -> float:
        """
        Calculates the time fraction 't' for a normalized position 'p'
        along a cubic-bezier ease-in-out curve (0.45 0 0.55 1).
        """
        p = max(0.0, min(1.0, p))
        
        # Solving 2u^3 - 3u^2 + p = 0
        # Trigonometric formulation of Cardano's method
        theta = math.asin(max(-1.0, min(1.0, 2.0 * p - 1.0))) / 3.0
        u = 0.5 + math.sin(theta)
        
        # Evaluate the cubic mapping (keySplines="0.45 0 0.55 1")
        # u(1-u)^2 * 3*0.45 + u^2(1-u) * 3*0.55 + u^3
        one_minus_u = 1.0 - u
        tau = (1.35 * (one_minus_u**2) * u) + (1.65 * one_minus_u * (u**2)) + (u**3)
        
        return tau

# --- SVG GENERATION ---
class SchematicGenerator:
    def __init__(self, projects: List[Dict[str, Any]]):
        self.projects = projects
        self.solver = CardanoSolver()

    def generate_svg(self) -> str:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">\n'
        svg += self._build_defs()
        svg += self._build_background()
        svg += self._build_causal_flow()
        svg += self._build_project_nodes()
        svg += self._build_specs()
        svg += '</svg>'
        return svg

    def _build_defs(self) -> str:
        return f"""
<defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>
        .terminal-text {{ font-family: {THEME["font"]}; font-size: 13px; fill: {THEME["text"]}; }}
        .node-name {{ font-family: {THEME["font"]}; font-size: 16px; font-weight: bold; fill: {THEME["accent"]}; }}
        .node-tag {{ font-family: {THEME["font"]}; font-size: 11px; fill: {THEME["warn"]}; }}
        .flow-line {{ stroke: {THEME["accent"]}; stroke-width: 1.5; fill: none; opacity: 0.3; stroke-dasharray: 5,5; }}
        .packet {{ fill: #FFFFFF; }}
        .header {{ font-family: {THEME["font"]}; font-size: 12px; fill: {THEME["text"]}; opacity: 0.5; }}
    </style>
</defs>
"""

    def _build_background(self) -> str:
        return f'<rect width="100%" height="100%" fill="{THEME["bg"]}" />\n'

    def _build_causal_flow(self) -> str:
        svg = '<g id="causal-belts">\n'
        core = next(p for p in self.projects if p["id"] == "aeowun")
        for p in self.projects:
            if p == core: continue
            
            # Draw Flow Line (Belt)
            d = f"M {p['x']} {p['y']} Q {(p['x'] + core['x'])/2} {(p['y'] + core['y'])/2 + 50} {core['x']} {core['y']}"
            svg += f'  <path d="{d}" class="flow-line" />\n'
            
            # Animate Evidence Pulse
            svg += f"""
  <circle r="3" class="packet" filter="url(#glow)">
    <animateMotion dur="4s" repeatCount="indefinite" path="{d}" />
  </circle>
"""
        svg += '</g>\n'
        return svg

    def _build_project_nodes(self) -> str:
        svg = '<g id="system-nodes">\n'
        for p in self.projects:
            svg += f"""
  <g transform="translate({p['x']}, {p['y']})">
    <rect x="-70" y="-30" width="140" height="60" rx="4" stroke="{THEME["border"]}" fill="{THEME["bg"]}" stroke-width="2" />
    <text y="-5" text-anchor="middle" class="node-name">{p['name']}</text>
    <text y="15" text-anchor="middle" class="node-tag">{p['tag']}</text>
  </g>
"""
        svg += '</g>\n'
        return svg

    def _build_specs(self) -> str:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f"""
<g transform="translate(20, 40)">
    <text class="header">NEXICODE_OS v2.0.8 // SESSION_START: {now}</text>
    <text y="20" class="terminal-text">>> INITIALIZING_CAUSAL_MESH...</text>
    <text y="40" class="terminal-text">>> ALL_SYSTEMS_VERIFIED: [TRUE]</text>
</g>
<g transform="translate({WIDTH - 250}, 40)">
    <text class="header">SYSTEM_STATS</text>
    <text y="20" class="terminal-text">UPTIME: 100.0%</text>
    <text y="40" class="terminal-text">INTEGRITY: HIGH</text>
</g>
"""

if __name__ == "__main__":
    gen = SchematicGenerator(PROJECTS)
    svg_content = gen.generate_svg()
    
    with open("C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/schematic.svg", "w") as f:
        f.write(svg_content)
    print("NexiCode Schematic Generated Successfully.")
