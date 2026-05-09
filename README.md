# ConCalc

A comprehensive construction material calculator with:

- **Material estimation calculators** (concrete, drywall, flooring, framing).
- **Local building code lookup** from an editable local JSON dataset.
- **Community-driven knowledge board** for DIY users through industry professionals.

## Run

```bash
python3 app.py
```

## Why local code lookup?

Building codes vary by state and municipality. This project stores a local baseline in `data/building_codes.json` so teams can version-control their known references and extend to counties/cities.

> Important: Always verify code compliance with local AHJ (Authority Having Jurisdiction).

## Roadmap for full platform

- User accounts with verified professional badges.
- Project folders with team permissions.
- Cost database integration for regional pricing.
- Plan upload parsing (PDF/CAD) and quantity takeoff.
- Moderation workflow and expert Q&A reputation system.
