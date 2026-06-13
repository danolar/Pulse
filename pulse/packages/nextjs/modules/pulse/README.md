# Pulse verification modules

Composable signal sources for the weighted verification model.

## Layout

```
modules/pulse/
  registry.ts
  types.ts
  _template/
  world-id/
  onchain-activity/
  ...
```

## Add a module

1. Copy `_template/` → `<your-slug>/` and edit `module.ts`.
2. Register in `registry.ts`.
3. Set `setupKind`: `none` | `adapter` | `integration`.
4. Optional UI under `components/pulse/modules/`.

## Setup flow

1. **Package picker** — user toggles selectable modules (`enabledModuleIds` in store).
2. **World ID** — always required (`required: true`).
3. **Window config** — thresholds and attempts.
4. **Connect package** — one form row per enabled `adapter` module; integrations show as coming soon.

Toggling a module on creates/removes its adapter row automatically — no duplicate manual adapter list.
