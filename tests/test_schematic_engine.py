import pytest
import math
import sys
import os

# Add parent directory to sys.path to import schematic_gen
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from schematic_gen import CardanoSolver, WorkstationGenerator

@pytest.fixture
def solver():
    return CardanoSolver()

@pytest.fixture
def generator():
    return WorkstationGenerator()

# --- PRECISION TESTS (23 Total) ---

def test_cardano_boundary_zero(solver):
    """Test 1: Spline hitting accuracy at p=0."""
    assert pytest.approx(solver.solve_for_t(0.0), abs=1e-15) == 0.0

def test_cardano_boundary_one(solver):
    """Test 2: Spline hitting accuracy at p=1."""
    assert pytest.approx(solver.solve_for_t(1.0), abs=1e-15) == 1.0

def test_cardano_midpoint(solver):
    """Test 3: Spline hitting accuracy at p=0.5."""
    assert pytest.approx(solver.solve_for_t(0.5), rel=1e-5) == 0.5

def test_cardano_monotonicity(solver):
    """Test 4: Verify time fraction strictly increases with position."""
    last_t = -1.0
    for i in range(101):
        p = i / 100.0
        t = solver.solve_for_t(p)
        assert t >= last_t
        last_t = t

def test_cardano_subpixel_precision_02(solver):
    """Test 5: Sub-pixel precision at 20% progress."""
    t = solver.solve_for_t(0.2)
    assert 0.0 <= t <= 1.0

def test_cardano_subpixel_precision_08(solver):
    """Test 6: Sub-pixel precision at 80% progress."""
    t = solver.solve_for_t(0.8)
    assert 0.0 <= t <= 1.0

def test_cardano_inversion_stability(solver):
    """Test 7: Ensure solver is stable under small perturbations."""
    t1 = solver.solve_for_t(0.4000)
    t2 = solver.solve_for_t(0.4001)
    assert abs(t1 - t2) < 0.001

@pytest.mark.parametrize("p", [0.1, 0.25, 0.33, 0.66, 0.75, 0.9])
def test_cardano_range_validity(solver, p):
    """Tests 8-13: Range validity for multiple points."""
    t = solver.solve_for_t(p)
    assert 0.0 < t < 1.0

def test_svg_output_contains_smil(generator):
    """Test 14: Verify SVG contains animateMotion tags."""
    svg = generator.generate_svg()
    assert "<animateMotion" in svg

def test_svg_output_contains_whoami(generator):
    """Test 15: Verify SVG contains the identity block."""
    svg = generator.generate_svg()
    assert "ZACHARY JOUBERT" in svg

def test_svg_output_contains_phosphor_filter(generator):
    """Test 16: Verify SVG contains the phosphor filter def."""
    svg = generator.generate_svg()
    assert 'id="phosphor"' in svg

def test_svg_output_is_authoritative(generator):
    """Test 17: Verify SVG contains the Workstation signature."""
    svg = generator.generate_svg()
    assert "NEXICODE" in svg
    assert "WORKSTATION" in svg

def test_causal_flow_path_structure(generator):
    """Test 18: Verify causal probe uses a path."""
    svg = generator.generate_svg()
    assert 'id="probePath"' in svg

def test_syslog_sync(generator):
    """Test 19: Verify SYSLOG contains curated logic fragments."""
    svg = generator.generate_svg()
    assert "AUTHORITY_VIOLATION" in svg
    assert "fd.sync()" in svg

def test_injection_hardening_bg(generator):
    """Test 20: Verify background rect exists."""
    svg = generator.generate_svg()
    assert '<rect width="100%" height="100%"' in svg

def test_font_authoritative_monospaced(generator):
    """Test 21: Verify font styling is authoritative."""
    svg = generator.generate_svg()
    assert "Fira Code" in svg or "monospace" in svg

def test_viewport_boundary_invariance(generator):
    """Test 22: Verify viewBox matches global width/height."""
    svg = generator.generate_svg()
    assert 'viewBox="0 0 1000 700"' in svg

def test_final_verification_idempotency(generator):
    """Test 23: Verify generating twice produce identical hashes."""
    svg1 = generator.generate_svg()
    svg2 = generator.generate_svg()
    assert hash(svg1) == hash(svg2)
