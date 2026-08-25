import math
import os
from datetime import datetime
from typing import List, Dict, Any

# --- CONFIGURATION (UNIX WORKSTATION) ---
WIDTH = 1000
HEIGHT = 700
THEME = {
    "bg": "#030305",
    "border": "#2A2A35",
    "border_rivet": "#4A4A5A",
    "text": "#E4E0EC",
    "muted": "#776B9E",
    "accent": "#9A6FC1", # AEOWUN Purple
    "green": "#00FF66",
    "warn": "#FFD000",
    "font": "'Fira Code', 'Courier New', monospace"
}

# --- CURATED TRUTH (Pre-selected logic snippets - safe for public view) ---
# These are representative logic fragments discovered during the source audit.
# The generator DOES NOT read local files; it uses this static repository.
CURATED_TRUTH = {
    "AEOWUN": "if key.startswith('truth:'): raise ValueError('AUTHORITY_VIOLATION')",
    "DROP": "verify_checksum(staging_hash, source_hash) >> fd.sync()",
    "LANGO": "sandbox.enforce(mem_limit=128, cpu_limit=5, sys_call_filter=STRICT)",
    "AXEIS": "kill_engine.attack(hypotheses) -> set_lethality(0.2)",
    "CORE": "os._exit(1) # STAGNATION_WATCHDOG_TRIGGERED"
}

# --- MATH ENGINE (Cardano's Cubic Formula) ---
class CardanoSolver:
    @staticmethod
    def solve_for_t(p: float) -> float:
        p = max(0.0, min(1.0, p))
        # Exact root of 2u^3 - 3u^2 + p = 0 via Cardano/trigonometric formulation
        theta = math.asin(max(-1.0, min(1.0, 2.0 * p - 1.0))) / 3.0
        u = 0.5 + math.sin(theta)
        
        # Evaluate for keySplines="0.45 0 0.55 1"
        one_minus_u = 1.0 - u
        tau = (1.35 * (one_minus_u**2) * u) + (1.65 * one_minus_u * (u**2)) + (u**3)
        return tau

# --- SVG GENERATION ---
class WorkstationGenerator:
    def __init__(self):
        self.solver = CardanoSolver()

    def generate_svg(self) -> str:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">\n'
        svg += self._build_defs()
        svg += self._build_background()
        
        # --- TILING PANES ---
        # 1. WHOAMI (Top Left)
        svg += self._build_pane(10, 10, 300, 200, "WHOAMI.txt", self._build_whoami())
        
        # 2. SYSLOG (Top Right)
        svg += self._build_pane(320, 10, 670, 200, "DIAGNOSTIC_FEED.log", self._build_syslog())
        
        # 3. PROJECTS (Middle)
        svg += self._build_project_row(10, 220)
        
        # 4. CALIBRATION_GRID (Bottom)
        svg += self._build_pane(10, 480, 980, 180, "CALIBRATION_GRID.hex", self._build_heatmap())
        
        # --- THE CAUSAL PROBE (Cardano Animation) ---
        svg += self._build_causal_probe()
        
        # --- OVERLAYS ---
        svg += self._build_crt_overlay()
        svg += self._build_footer()
        
        svg += '</svg>'
        return svg

    def _build_defs(self) -> str:
        return f"""
<defs>
    <filter id="phosphor" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>
        .mono {{ font-family: {THEME["font"]}; }}
        .header {{ font-size: 11px; fill: {THEME["muted"]}; letter-spacing: 1px; }}
        .text {{ font-size: 12px; fill: {THEME["text"]}; }}
        .code {{ font-size: 11px; fill: {THEME["green"]}; opacity: 0.8; }}
        .rivet {{ fill: {THEME["border_rivet"]}; }}
        .scanline {{ fill: url(#scanlinePattern); opacity: 0.05; pointer-events: none; }}
        .probe {{ stroke: {THEME["warn"]}; stroke-width: 1; fill: none; opacity: 0.3; }}
        .laser {{ fill: {THEME["warn"]}; }}
    </style>
    <pattern id="scanlinePattern" width="100%" height="4" patternUnits="userSpaceOnUse">
        <rect width="100%" height="1" fill="#FFFFFF" />
    </pattern>
</defs>
"""

    def _build_background(self) -> str:
        return f'<rect width="100%" height="100%" fill="{THEME["bg"]}" />\n'

    def _build_pane(self, x, y, w, h, title, content) -> str:
        svg = f'<g transform="translate({x}, {y})">\n'
        svg += f'  <rect width="{w}" height="{h}" fill="rgba(10,8,14,0.5)" stroke="{THEME["border"]}" stroke-width="1.5" rx="4" />\n'
        svg += f'  <rect width="{w}" height="24" fill="{THEME["border"]}" opacity="0.3" rx="4 4 0 0" />\n'
        svg += f'  <text x="10" y="16" class="mono header">{title}</text>\n'
        for rx, ry in [(4,4), (w-4,4), (4,h-4), (w-4,h-4)]:
            svg += f'  <circle cx="{rx}" cy="{ry}" r="1.5" class="rivet" />\n'
        svg += f'  <g transform="translate(15, 45)">{content}</g>\n'
        svg += '</g>\n'
        return svg

    def _build_whoami(self) -> str:
        return f"""
  <text y="0" class="mono text" filter="url(#phosphor)">ZACHARY JOUBERT</text>
  <text y="20" class="mono text" style="font-size: 9px; opacity: 0.6;">[SYSTEMS_MECHANIC // BUILD_TO_VERIFY]</text>
  <text y="60" class="mono code" style="fill: {THEME['accent']};">"A mechanic gets pissed at a</text>
  <text y="75" class="mono code" style="fill: {THEME['accent']};">machine and can at least</text>
  <text y="90" class="mono code" style="fill: {THEME['accent']};">physically attack it..."</text>
  <text y="115" class="mono text" style="font-size: 10px; opacity: 0.4;">[WRENCH_STATUS: ENGAGED]</text>
"""

    def _build_syslog(self) -> str:
        svg = ""
        for i, (key, val) in enumerate(CURATED_TRUTH.items()):
            y = i * 25
            svg += f'<text y="{y}" class="mono code" opacity="0">\n'
            svg += f'  <animate attributeName="opacity" values="0;1;0" dur="8s" begin="{i*1.5}s" repeatCount="indefinite" />\n'
            svg += f'  [{key}] >> {val}\n'
            svg += '</text>\n'
        return svg

    def _build_project_row(self, x, y) -> str:
        svg = f'<g transform="translate({x}, {y})">\n'
        projects = [
            ("AEOWUN", "IDE_SHELL", THEME["accent"]),
            ("LANGO", "LOGIC_SIM", THEME["green"]),
            ("DROP", "VAULT_ENG", THEME["warn"]),
            ("AXEIS", "ADVERSARY", "#FF4B54"),
            ("FRIDGE", "MOBILE_APP", "#00D2F1")
        ]
        for i, (name, tag, color) in enumerate(projects):
            px = i * 196 # Tighter spacing
            svg += f"""
  <g transform="translate({px}, 0)">
    <rect width="186" height="240" fill="rgba(255,255,255,0.02)" stroke="{THEME["border"]}" stroke-width="1.5" rx="8" />
    <text x="93" y="30" text-anchor="middle" class="mono text" style="font-weight: bold; fill: {color};">{name}</text>
    <text x="93" y="50" text-anchor="middle" class="mono header">{tag}</text>
    
    <!-- Causal Oscilloscope -->
    <rect x="20" y="70" width="146" height="60" fill="#000" rx="4" />
    <path d="M 30 100 Q 65 50 100 100 T 170 100" stroke="{color}" fill="none" stroke-width="1.5" opacity="0.4">
        <animate attributeName="d" values="M 30 100 Q 65 50 100 100 T 170 100; M 30 100 Q 65 150 100 100 T 170 100; M 30 100 Q 65 50 100 100 T 170 100" dur="2.5s" repeatCount="indefinite" />
    </path>

    <!-- Project Data (Curated Source Truth) -->
    <text x="20" y="150" class="mono header" style="font-size: 8px;">SOURCE_TRUTH:</text>
    <text x="20" y="165" class="mono code" style="font-size: 9px;">{CURATED_TRUTH.get(name, "VERIFIED")[:22]}...</text>
    <text x="20" y="185" class="mono header" style="font-size: 8px;">INTEGRITY:</text>
    <text x="20" y="200" class="mono text" style="font-size: 9px; fill: {THEME['green']};">100% [VERIFIED]</text>
  </g>
"""
        svg += '</g>\n'
        return svg

    def _build_heatmap(self) -> str:
        svg = ""
        # 52 weeks x 7 days
        for col in range(52):
            for row in range(7):
                # Static representative pattern for the heatmap
                color = "rgba(0, 255, 102, 0.05)"
                if (col + row) % 7 == 0: color = "rgba(0, 255, 102, 0.4)"
                if (col * row) % 19 == 0: color = "rgba(0, 255, 102, 0.2)"
                svg += f'<rect x="{col*18}" y="{row*18}" width="14" height="14" rx="2" fill="{color}" />\n'
        return svg

    def _build_causal_probe(self) -> str:
        # Cardano Spline for the "Verification Laser"
        path = "M 25 500 Q 500 400 975 500"
        return f"""
<g id="causal-probe">
    <path d="{path}" class="probe" id="probePath" />
    <circle r="4" class="laser" filter="url(#phosphor)">
        <animateMotion dur="6s" repeatCount="indefinite">
            <mpath href="#probePath" />
        </animateMotion>
    </circle>
</g>
"""

    def _build_crt_overlay(self) -> str:
        return f'<rect width="100%" height="100%" class="scanline" />\n'

    def _build_footer(self) -> str:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f"""
<text x="10" y="{HEIGHT - 10}" class="mono header">NEXICODE_UNIX_WORKSTATION // AUTH: Z_JOUBERT // SESSION: {now}</text>
"""

if __name__ == "__main__":
    gen = WorkstationGenerator()
    svg_content = gen.generate_svg()
    
    with open("C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/schematic.svg", "w") as f:
        f.write(svg_content)
    print("NexiCode Unix Workstation SVG [v2.0] Generated Successfully.")
