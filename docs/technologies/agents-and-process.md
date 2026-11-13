# Agents and process

## What makes output predictable
Fixed stages that each leave a file (an agent can resume from files alone); formats are templates and topics are data; machine checks before any critic; a fresh critic agent for every render; a round budget (3 fix rounds, then stop and ask); humans decide only three things: script and facts, any paid spend, anything that leaves the machine.

| Stage | Leaves behind | Pass condition |
|---|---|---|
| Brief | `project.json` (client, format, aspect, length, destination) | schema valid |
| Facts | `FACTS.md` (every claim, source, date) | every claim sourced; none on the avoid list (`claims-lint`) |
| Treatment | `TREATMENT.md` | matches the format's headings |
| **Gate A** | `approved.json` | explicit yes to script and facts |
| Build | source + `build.sh` | runs clean from a fresh checkout |
| Measure | `qc/report.json`, contact sheet | `qc/CHECKLIST.md` |
| Critic | `qc/critic.md` (SHOW / FIX FIRST) | SHOW, or fixes then a re-check |
| **Gate B / C** | `approved.json` / `published.json` | explicit yes, per channel |

## Machine checks (`qc.sh`)
Duration within 0.5 s of the brief; aspect and pixel format; loudness near -14 LUFS, true peak at most -1.5 dBTP; no black frames; no hold over 0.6 s; caption read time; music about 17 to 19 dB under the voice; `claims-lint` against the client's avoid list; Whisper transcript diff of the final voice against the approved script (so a re-rolled take cannot slip in); shot count against the treatment; determinism lint (no `Math.random()` / `Date.now()` in scene code); a contact sheet at fixed moments in every format.

## Agents
One project = one git worktree and branch. **Builder** (one, pinned to a model; for new formats the stronger model needed fewer rounds), **critic** (fresh context, never sees the builder's reasoning, sees only files + brief), optional **asset worker** (an image/SVG agent: it cannot preview its own work, so the builder renders and reviews the board), **planner** (the human's session: briefs, facts, gates, merges). Mechanics: `orca worktree create` and orca terminals to start and read each agent; a `RUNBOOK.md` at the template root so the launch prompt is one line; `status.json` per project (`stage`, `round`, `last_check`, `blocked_on`). Merge back sources, kit and approval records; renders and caches stay out of git.

## Claude Code pieces we rely on
Skills per project (`.claude/skills/`), background shell commands for long renders (always write an explicit `DONE` sentinel to the log and wait on that), subagents for the independent critic (`qc/CRITIC-BRIEF.md`), and a `CLAUDE.md` + skill given to a client so their own Claude continues the work from a voice file (`templates/client-handover/`).

## Things that bite
Throwaway scratch folders hold libraries that later vanish (install once in a permanent folder); a virtualenv cannot be moved by copying; headless Chrome renders are heavy (at most 2 at a time, queue through one lock file); builders fix endlessly (3 rounds); waiting loops that match their own command line or grep for "error" in "No errors detected".
