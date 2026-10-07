# Alto — design

The design of Alto, a local-first, voice-first home assistant built as a research program on
machine interiority. Published at <https://sawyerstrong.github.io/alto-design/>.

This repository is a generated snapshot of the design pages: the nine pillars, the organ map, one
page per organ, and the glossary. It holds no code. The project's source, specs and working notes
are in a separate private repository. Citations to them in these pages link there, pinned to
commit `4df78067`, and open only for people signed in to GitHub with access to it.

Snapshot of source commit `4df7806` (2026-10-06). Do not edit `docs/` here: the next
export overwrites it.

## Build locally

```bash
pip install -r requirements.txt
mkdocs serve
```

`mkdocs build --strict` fails on a dead link or anchor, and that is the check CI runs.
