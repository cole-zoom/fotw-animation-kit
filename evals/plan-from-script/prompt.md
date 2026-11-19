---
tags: [plan]
runs: 1
max_turns: 20
timeout_seconds: 400
allowed_tools: [Read, Glob, Grep, Skill]
---
Using this repo's lancedb-motion guide, plan (don't build) the explainer graphics for this 30-second section of a launch video. Return the plan as markdown in your reply, in the format the guide asks for.

Script:
1. "Most vector databases make you pick: fast search, or fresh data."
2. "LanceDB writes new rows straight into the table, and they're searchable right away."
3. "The index catches up in the background, without blocking writes."
4. "So a query always sees every row, indexed or not."
