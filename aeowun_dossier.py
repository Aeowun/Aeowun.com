import os
from datetime import datetime

WIDTH = 1000
HEIGHT = 1500
THEME = {
    "bg": "#030305",
    "bg2": "#08060B",
    "border": "#2A2A35",
    "text": "#E4E0EC",
    "muted": "#776B9E",
    "accent": "#9A6FC1",
    "green": "#00FF66",
    "warn": "#FFD000",
    "font": "'Fira Code', 'Courier New', monospace"
}

# --- REAL DATA (pulled from CHANGELOG.md / main.rs, not invented) ---
RELEASES = [
    ("V2.0.8.0", "2026-08-23", "Quality & scalability audit -- 100% PEP 484 coverage, pytest harness, 5,000-node Affinity Engine benchmark"),
    ("V2.0.7.4", "2026-08-21", "Documentation repair -- normalized Work Order history"),
    ("V2.0.7.3", "2026-08-21", "Win11 DWM integration -- themed title bar, persisted window state"),
    ("V2.0.7.1", "2026-08-21", "Console/CLI output rewritten for direct engineering style"),
    ("V2.0.7.0", "2026-08-21", "launch.bat + run_aeowun.py established as the authoritative entry point"),
    ("V2.0.6.X", "2026-08-21", "REBUILD -- deterministic program-understanding subsystem, Leiden/CPM clustering, Semantic Wayfinding UI"),
    ("V2.0.6.2", "2026-08-21", "Structural project index (superseded same day by 006.X)"),
    ("V2.0.5.0", "2026-04-15", "Integrated terminal via xterm.js bridge"),
    ("V2.0.4.0", "2026-02-10", "Global regex search, command registry"),
    ("V2.0.3.5", "2026-01-20", "Fixed persistent-storage failure -- state now survives restarts"),
    ("V2.0.2.0", "2026-01-15", "Monaco Editor replaces plain textareas"),
    ("V2.0.1.0", "2026-01-15", "Filesystem bridge + multi-level project explorer"),
    ("V2.0.0.1", "2026-01-12", "3-panel IDE shell, atmospheric UI"),
    ("V2.0.0.0", "2026-01-11", "GENESIS -- rebuilt from a single-pane chat UI, seeded by the CS50 Rubber Duck project"),
]

MODULES = ["protocol", "workspace", "watcher", "supervisor", "error", "pty", "terminal"]
CRATES = ["tokio", "wry", "tao", "windows-rs", "serde_json", "uuid", "rfd"]

SNIPPET_A = {
    "title": "kernel/main.rs -- window theming",
    "lines": [
        (69, 'fn apply_dwm_attributes(hwnd: HWND) {'),
        (72, '    DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, ...);'),
        (77, '    let border_color = 0x00c16f9a; // #9a6fc1'),
        (78, '    DwmSetWindowAttribute(hwnd, DWMWA_BORDER_COLOR, &border_color ...);'),
        (79, '    let corner_pref = DWMWCP_ROUND.0;'),
        (80, '    DwmSetWindowAttribute(hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, ...);'),
        (81, '}'),
    ],
    "note": "the OS-native window border is set to the brand purple via a raw Win32 DWM call -- not a CSS accent color, the actual chrome."
}

SNIPPET_B = {
    "title": "kernel/main.rs -- worker bridge (Rust to Python)",
    "lines": [
        (92, 'let mut child = Command::new(&python_exe)'),
        (94, '    .current_dir(&project_root)'),
        (95, '    .stdin(Stdio::piped())'),
        (96, '    .stdout(Stdio::piped())'),
        (110, 'let mut reader = BufReader::new(stdout).lines();'),
        (116, '    if msg["type"] == "KernelRequest" {'),
        (121, '        let result = match action {'),
        (122, '            "read_file" => sv.workspace().read_file(path).await,'),
    ],
    "note": "the async Rust kernel owns the process and the UI; Python is a subordinate worker it spawns, pipes JSON to over stdin/stdout, and supervises."
}


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


class Dossier:
    def generate_svg(self) -> str:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">\n'
        svg += self._defs()
        svg += f'<rect width="100%" height="100%" fill="{THEME["bg"]}" />\n'
        svg += self._blueprint_grid()

        y = 0
        svg += self._header(); y = 190
        svg += self._architecture(y); y += 280
        svg += self._code_exhibit(y); y += 300
        svg += self._timeline(y); y += 46 + len(RELEASES) * 34 + 30
        svg += self._stack_strip(y); y += 90
        svg += self._crt_overlay()
        svg += self._footer()
        svg += '</svg>'
        return svg

    def _defs(self):
        return f"""
<defs>
  <filter id="phosphor" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.1" result="blur" />
    <feComposite in="SourceGraphic" in2="blur" operator="over" />
  </filter>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="{THEME['accent']}" stop-opacity="0.5" />
    <stop offset="100%" stop-color="{THEME['accent']}" stop-opacity="0" />
  </linearGradient>
  <style>
    .mono {{ font-family: {THEME["font"]}; }}
    .h1 {{ font-size: 40px; fill: {THEME["text"]}; font-weight: bold; letter-spacing: 2px; }}
    .h2 {{ font-size: 13px; fill: {THEME["muted"]}; letter-spacing: 2px; }}
    .label {{ font-size: 10px; fill: {THEME["muted"]}; letter-spacing: 1px; }}
    .code {{ font-size: 11px; fill: {THEME["green"]}; }}
    .lineno {{ font-size: 10px; fill: {THEME["muted"]}; }}
    .body {{ font-size: 11px; fill: {THEME["text"]}; }}
    .scanline {{ fill: url(#scanlinePattern); opacity: 0.05; pointer-events: none; }}
  </style>
  <pattern id="scanlinePattern" width="100%" height="4" patternUnits="userSpaceOnUse">
    <rect width="100%" height="1" fill="#FFFFFF" />
  </pattern>
</defs>
"""

    def _blueprint_grid(self):
        lines = ""
        for gx in range(0, WIDTH, 40):
            lines += f'<line x1="{gx}" y1="0" x2="{gx}" y2="{HEIGHT}" stroke="{THEME["border"]}" stroke-width="0.4" opacity="0.25" />\n'
        for gy in range(0, HEIGHT, 40):
            lines += f'<line x1="0" y1="{gy}" x2="{WIDTH}" y2="{gy}" stroke="{THEME["border"]}" stroke-width="0.4" opacity="0.25" />\n'
        return f'<g>{lines}</g>\n'

    def _header(self):
        return f"""
<g transform="translate(40,50)">
  <text class="mono label" style="fill:{THEME['green']};">// SOURCE_AUDIT :: NEXICODE</text>
  <text y="42" class="mono h1" filter="url(#phosphor)">AEOWUN V2</text>
  <text y="66" class="mono h2">SELF-SUPERVISING SOFTWARE-ENGINEERING SYSTEM</text>
  <text y="100" class="mono body" style="fill:{THEME['accent']}; font-size:12px;">
    Not an LLM bolted onto a program -- V2 (shell) + CodeGraph (deterministic structure)
  </text>
  <text y="118" class="mono body" style="fill:{THEME['accent']}; font-size:12px;">
    + Zero/HSAM (probabilistic reasoning) converging into one semantic machine.
  </text>
  <line x1="0" y1="140" x2="920" y2="140" stroke="{THEME['border']}" stroke-width="1" />
</g>
"""

    def _architecture(self, y):
        layers = [
            ("V2", "OPERATIONAL SHELL", "Rust kernel + webview. Owns the process, the window, the UI."),
            ("CODEGRAPH", "DETERMINISTIC STRUCTURE", "Affinity Engine: structural + lexical (TF-IDF) + organizational evidence, Leiden/CPM clustering."),
            ("ZERO / HSAM", "PROBABILISTIC REASONING", "Intent, reasoning, interaction -- absorbing hand-written orchestration over time."),
        ]
        w = (920 - 2*30) / 3
        svg = f'<g transform="translate(40,{y})">\n'
        svg += f'  <text class="mono label">ARCHITECTURE // THREE LAYERS CONVERGING</text>\n'
        for i, (name, tag, desc) in enumerate(layers):
            lx = i * (w + 30)
            svg += f'  <g transform="translate({lx},20)">\n'
            svg += f'    <rect width="{w}" height="150" fill="rgba(154,111,193,0.04)" stroke="{THEME["accent"]}" stroke-width="1" rx="4" />\n'
            svg += f'    <text x="14" y="26" class="mono body" style="font-size:13px; font-weight:bold; fill:{THEME["accent"]};">{name}</text>\n'
            svg += f'    <text x="14" y="42" class="mono label" style="font-size:8px;">{tag}</text>\n'
            words, lines, cur = desc.split(" "), [], ""
            for word in words:
                t = (cur + " " + word).strip()
                if len(t) > 27:
                    lines.append(cur); cur = word
                else:
                    cur = t
            if cur: lines.append(cur)
            for li, line in enumerate(lines):
                svg += f'    <text x="14" y="{70+li*15}" class="mono body" style="font-size:9.5px; opacity:0.8;">{line}</text>\n'
            svg += '  </g>\n'
            if i < 2:
                ax = lx + w
                svg += f'  <path d="M {ax} 95 L {ax+30} 95" stroke="{THEME["accent"]}" stroke-width="1.5" opacity="0.7" />\n'
                svg += f'  <path d="M {ax+22} 89 L {ax+30} 95 L {ax+22} 101" stroke="{THEME["accent"]}" stroke-width="1.5" fill="none" opacity="0.7" />\n'
        svg += '  <rect x="0" y="190" width="920" height="1" fill="{0}" opacity="0.3" />\n'.format(THEME['border'])
        svg += '</g>\n'
        return svg

    def _code_block(self, x, y, w, snippet):
        h = 40 + len(snippet["lines"]) * 17 + 40
        svg = f'<g transform="translate({x},{y})">\n'
        svg += f'  <rect width="{w}" height="{h}" fill="{THEME["bg2"]}" stroke="{THEME["border"]}" stroke-width="1" rx="4" />\n'
        svg += f'  <rect width="{w}" height="24" fill="{THEME["border"]}" opacity="0.35" rx="4 4 0 0" />\n'
        svg += f'  <circle cx="12" cy="12" r="4" fill="#FF5F56" opacity="0.7" /><circle cx="28" cy="12" r="4" fill="#FFBD2E" opacity="0.7" /><circle cx="44" cy="12" r="4" fill="#27C93F" opacity="0.7" />\n'
        title_esc = snippet["title"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        svg += f'  <text x="60" y="16" class="mono label">{title_esc}</text>\n'
        for i, (ln, code) in enumerate(snippet["lines"]):
            ly = 44 + i * 17
            code_esc = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            svg += f'  <text x="12" y="{ly}" class="mono lineno">{ln}</text>\n'
            svg += f'  <text x="46" y="{ly}" class="mono code">{code_esc}</text>\n'
        note_y = 44 + len(snippet["lines"]) * 17 + 20
        words, lines, cur = snippet["note"].split(" "), [], ""
        for word in words:
            t = (cur + " " + word).strip()
            if len(t) > 55:
                lines.append(cur); cur = word
            else:
                cur = t
        if cur: lines.append(cur)
        for li, line in enumerate(lines):
            line_esc = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            svg += f'  <text x="12" y="{note_y+li*13}" class="mono body" style="font-size:9px; opacity:0.55; font-style:italic;">// {line_esc}</text>\n'
        svg += '</g>\n'
        return svg, h

    def _code_exhibit(self, y):
        svg = f'<g transform="translate(40,{y})">\n'
        svg += f'  <text class="mono label">EXHIBITS // PULLED DIRECTLY FROM kernel/main.rs</text>\n'
        b1, h1 = self._code_block(0, 20, 445, SNIPPET_A)
        b2, h2 = self._code_block(475, 20, 445, SNIPPET_B)
        svg += b1 + b2
        svg += '</g>\n'
        return svg

    def _timeline(self, y):
        svg = f'<g transform="translate(40,{y})">\n'
        svg += f'  <text class="mono label">RELEASE HISTORY // {len(RELEASES)} TRACKED VERSIONS, 2026-01-11 -&gt; 2026-08-23</text>\n'
        svg += f'  <line x1="70" y1="20" x2="70" y2="{20+len(RELEASES)*34-14}" stroke="{THEME["border"]}" stroke-width="1.5" />\n'
        for i, (ver, date, note) in enumerate(RELEASES):
            ry = 26 + i * 34
            is_genesis = "GENESIS" in note
            is_rebuild = "REBUILD" in note
            dotcolor = THEME["warn"] if is_genesis else (THEME["accent"] if is_rebuild else THEME["green"])
            svg += f'  <circle cx="70" cy="{ry}" r="4" fill="{dotcolor}" />\n'
            svg += f'  <text x="0" y="{ry+4}" class="mono label" style="font-size:9px;">{date}</text>\n'
            svg += f'  <text x="90" y="{ry+4}" class="mono body" style="font-size:10.5px; font-weight:bold; fill:{dotcolor};">{ver}</text>\n'
            note_disp = note if len(note) <= 78 else note[:75] + "..."
            note_esc = note_disp.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            svg += f'  <text x="185" y="{ry+4}" class="mono body" style="font-size:9.5px; opacity:0.75;">{note_esc}</text>\n'
        svg += '</g>\n'
        return svg

    def _stack_strip(self, y):
        svg = f'<g transform="translate(40,{y})">\n'
        svg += f'  <text class="mono label">RUST KERNEL MODULES</text>\n'
        x = 0
        for m in MODULES:
            w = 16 + len(m) * 6.5
            svg += f'  <rect x="{x}" y="14" width="{w}" height="20" fill="rgba(0,255,102,0.08)" stroke="{THEME["green"]}" stroke-width="1" rx="3" />\n'
            svg += f'  <text x="{x+8}" y="28" class="mono code" style="font-size:10px;">{m}</text>\n'
            x += w + 8
        svg += f'  <text y="58" class="mono label">CRATES</text>\n'
        x = 0
        for c in CRATES:
            w = 16 + len(c) * 6.5
            svg += f'  <rect x="{x}" y="66" width="{w}" height="20" fill="rgba(154,111,193,0.08)" stroke="{THEME["accent"]}" stroke-width="1" rx="3" />\n'
            svg += f'  <text x="{x+8}" y="80" class="mono body" style="font-size:10px; fill:{THEME["accent"]};">{c}</text>\n'
            x += w + 8
        svg += '</g>\n'
        return svg

    def _crt_overlay(self):
        return f'<rect width="100%" height="100%" class="scanline" />\n'

    def _footer(self):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f'<text x="40" y="{HEIGHT-20}" class="mono label">NEXICODE // AUTH: Z_JOUBERT // SOURCE: main.rs + CHANGELOG.md // SESSION: {now}</text>\n'


if __name__ == "__main__":
    gen = Dossier()
    svg_content = gen.generate_svg()
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aeowun_dossier.svg")
    with open(out_path, "w") as f:
        f.write(svg_content)
    print(f"AEOWUN dossier generated -> {out_path}")
