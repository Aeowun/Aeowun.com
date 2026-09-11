# AEOWUN // 2026

> Independent software that keeps you in control.

AEOWUN is an independent software project building local-first tools and systems around control, verification, and understandable software behavior.

This repository contains the public AEOWUN website and its documentation.

## What Is AEOWUN?

AEOWUN is not a finished commercial platform or a single application.

It is a collection of related software projects with different statuses. The common idea is that software should keep you in control: it should make its boundaries visible, preserve operator authority, and avoid claiming that work is complete without evidence.

## Projects

### AEOPIN

Status: Shipped

AEOPIN is a Windows capture and retrieval tool. The current public release is v1.2.3.

- Windows 10 and 11
- Local capture and retrieval
- Authority installer with payload integrity verification
- SHA-256 validation
- Atomic update and recovery flow

Repository: https://github.com/Aeowun/Aeopin

### CheckMaker

Status: Shipped

CheckMaker is a small Markdown checkbox editor for Windows.

Its purpose is deliberately narrow: change the checkbox that needs changing without rewriting the surrounding document. It detects external file drift before writing so an old view does not silently overwrite newer work.

Repository: https://github.com/Aeowun/Checkmaker

### AEOWUN IDE

Status: Active development

AEOWUN IDE is a project-centered development environment. Its work includes filesystem integration, Monaco, persistent workspace state, search, terminal functionality, semantic rebuilding, Python type coverage, pytest infrastructure, and watchdog race-condition hardening.

It is not presented as a finished commercial IDE product.

Repository: https://github.com/Aeowun/AeowunV2

### MAGY

Status: Active / alpha

MAGY is a local-first AI engineering system built around a runtime boundary between reasoning and execution.

The core principle is:

> Reasoning is not authority.

MAGY can use intelligent systems to propose work, but restricted actions are subject to an execution boundary and operator approval. Verification is part of the workflow; a model's statement that a task is complete is not treated as proof.

The public GitHub repository is currently described as an emergency backup. The website documents the current local architecture and development direction.

Repository: https://github.com/Aeowun/Magy

### AEIN

Status: Experimental

AEIN explores controlled machine operation and auditable actions over local systems.

It is experimental and is not a downloadable shipped product.

### ZERO

Status: Research

ZERO is research into structure, constraints, and behavior around intelligent systems.

The public repository contains research code. It is not a finished product or consumer download.

Repository: https://github.com/Aeowun/AeowunZero-1B

## Design Principles

### Human Authority

A model or automated tool may propose an action. The operator remains responsible for deciding when restricted work is allowed.

### Local First

AEOWUN favors software that can remain useful on the machine where it runs rather than making cloud dependence part of the product's identity.

### Evidence Over Claims

A completion message is not evidence of completion. Verification should come from the system that was actually changed or executed.

### Fail Closed

Where integrity matters, failure should stop the operation rather than silently continuing with an unverified state.

### Small, Understandable Changes

Software should avoid unnecessary changes. CheckMaker is one example: a checkbox change should not require rewriting an entire Markdown document.

### Honest Status

Shipped software, active development, experiments, and research are different categories. AEOWUN labels them separately rather than presenting every repository as a finished product.

## Repository Map

text
AEOWUN
│
├── PRODUCTS
│   ├── AEOPIN
│   └── CHECKMAKER
│
├── SYSTEMS
│   ├── AEOWUN IDE
│   └── MAGY
│
├── EXPERIMENTAL
│   └── AEIN
│
└── RESEARCH
    └── ZERO


The website also contains project documentation, engineering notes, security information, support material, tests, and other development work.

## Public Repositories

| Repository | Role | Status |
|---|---|---|
| Aeopin | Windows capture and retrieval tool | Shipped |
| Checkmaker | Markdown checkbox editor | Shipped |
| AeowunV2 | IDE-related development tree | Active |
| Magy | Local AI engineering system | Active / alpha |
| AeowunZero-1B | ZERO research code | Research |
| Aeopin_Support | AEOPIN support and issue tracking | Support |
| Aeowun.com | This website | Website |
| devTool_xO0 | Experimental toolkit | Experimental |

## Development Philosophy

AEOWUN is being built in public, but public does not mean finished.

The working progression is:

text
UNDERSTAND
    ↓
BUILD
    ↓
VERIFY
    ↓
USE
    ↓
RETAIN HUMAN CONTROL


Failures, limitations, experiments, and unfinished work are part of the engineering record rather than something to hide behind product language.

## Current Release

The current AEOPIN release is v1.2.3.

For the verified Windows Authority installer, use the corresponding GitHub release:

https://github.com/Aeowun/Aeopin/releases/tag/v1.2.3

Experimental repositories and active development trees should not be treated as equivalent to the shipped AEOPIN release.

## Website

The project website is:

https://aeowun.com/

Relevant sections include:

- Project: https://aeowun.com/aeowun/
- AEOPIN: https://aeowun.com/aeopin/
- CheckMaker: https://aeowun.com/checkmaker/
- IDE: https://aeowun.com/ide/
- MAGY: https://aeowun.com/magy/
- Engineering: https://aeowun.com/engineering/
- Security / Trust: https://aeowun.com/security/
- Research: https://aeowun.com/research/

## License

Licensing is defined by each individual repository. Check the repository you are using for its authoritative license and release terms.

---

AEOWUN // 2026

Independent software. Local systems. Verifiable behavior. Human control.
