# Role Rotation Design

## Goal

Replace the current dishwashing rotation with a general role-rotation system that lets a house admin define multiple roles, assign all participants fairly, and review the current cycle plus prior history.

## Product Direction

- This is a replacement of the existing dishwashing rotation feature, not a separate module.
- The system should support any household or team task setup, not just kitchen chores.
- The admin manages participants, role definitions, cycle start, and reset.
- Role assignment must be automatic and deterministic so the same inputs always produce the same cycle.
- Each new cycle should continue from the previous cycle rather than restarting from the first participant.

## Scope

### In Scope

- Define a participant list for the house rotation
- Define multiple roles with a required slot count for each role
- Automatically assign every participant to exactly one slot per cycle
- Rotate assignments across cycles so every participant eventually experiences every role
- Show the current cycle assignments
- Show previous cycle history
- Allow admins to start a new rotation cycle
- Allow admins to reset the rotation system

### Out of Scope

- Partial participation or optional slots
- Multiple independent rotations within the same house
- Manual per-cycle assignment by the admin
- Custom weighting, skips, or role preferences
- Recurring calendar scheduling beyond cycle history

## User Story

1. As a house admin, I can define the people and task roles for the house.
2. When I start a new cycle, the system automatically assigns everyone fairly.
3. As a house member, I can quickly see who is responsible for each task now and review prior cycles.

## Existing Flow Fit

- The current `dishwashingRotation` data in `House` should be replaced by a generalized rotation model.
- The existing dishwashing tab in the house details page should become the rotation tab.
- The current dishwashing hook and API calls should be renamed and adapted to the new role-rotation behavior.
- Existing house membership remains the source of truth for participants.

## Data Model

Store one rotation object on `House`.

### Suggested Shape

```javascript
roleRotation: {
  enabled: Boolean,
  participants: [ObjectId],
  roles: [
    {
      name: String,
      count: Number,
    },
  ],
  cycleIndex: Number,
  currentCycle: {
    cycleNumber: Number,
    startedAt: String,
    assignments: [
      {
        slotIndex: Number,
        roleName: String,
        participant: ObjectId,
      },
    ],
  },
  history: [
    {
      cycleNumber: Number,
      startedAt: String,
      assignments: [
        {
          slotIndex: Number,
          roleName: String,
          participant: ObjectId,
        },
      ],
    },
  ],
}
```

### Data Rules

- `participants.length` must equal the total number of role slots.
- Total role slots is the sum of all `roles[].count` values.
- Role names are unique within a rotation.
- Participant IDs must belong to the house member list.
- `cycleIndex` tracks the next participant offset for the next cycle.

## Rotation Behavior

### Cycle Creation

- Build a flattened list of slots from `roles` in admin-defined order.
- Build a participant order list from `participants`.
- For cycle `N`, rotate the participant order by `cycleIndex` positions.
- Assign the rotated participant list to the flattened role slots from top to bottom.
- Save the full assignment snapshot as `currentCycle`.

### Fairness Rule

- Each new cycle advances `cycleIndex` by 1.
- Because the participant count always matches the slot count, this creates a stable shift across cycles.
- Over repeated cycles, every participant will move through every role slot position in a predictable sequence.

### Reset

- Reset clears `currentCycle`, `history`, and `cycleIndex`.
- Reset does not remove house members.
- Reset also disables the rotation until the admin configures it again.

## UX Design

### Admin Controls

- Rename the current dishwashing tab to a general rotation tab.
- Provide controls for:
  - adding or removing participants from the rotation
  - adding, editing, or removing roles
  - changing role counts
  - starting a new cycle
  - resetting the rotation

### Display

- Show a clear current-cycle summary grouped by role.
- Show each participant and the role they currently have.
- Show previous cycles in a compact history list.
- Each history entry should show the cycle number, start date, and assignment breakdown.

### Empty and Invalid States

- If rotation is not configured, show a setup prompt.
- If participant count does not match total role slots, show a blocking validation message before starting a cycle.
- If there is no history yet, show an empty-state message instead of an empty table.

## Backend Design

### API Surface

Replace the dishwashing endpoints with a generalized rotation API under the house route namespace.

- `GET /api/houses/:id/rotation`
- `PUT /api/houses/:id/rotation`
- `DELETE /api/houses/:id/rotation`
- `POST /api/houses/:id/rotation/cycles`
- `POST /api/houses/:id/rotation/reset`

### Access Rules

- All read endpoints require house membership.
- All write endpoints require house admin privileges.

### Validation Rules

- Reject duplicate roles with the same name.
- Reject role counts below 1.
- Reject participant IDs that are not house members.
- Reject any configuration where total slots and participant count differ.
- Reject cycle creation if the rotation is not configured.

### Response Shape

Return a compact rotation payload containing:

- `enabled`
- `participants`
- `roles`
- `currentCycle`
- `history`
- `cycleIndex`

## Migration Note

- Existing `dishwashingRotation` data should be migrated into the new `roleRotation` shape so current houses do not lose their setup.
- The legacy dishwashing setup can map to one role named `Dishes` with count `1` until the admin edits it.
- After migration, the app should only read and write the new role-rotation field.

## Error Handling

- Return `404` if the house does not exist.
- Return `403` if the caller is not the house admin for mutation requests.
- Return `400` if role counts and participant count do not match.
- Return `400` if the rotation is not yet configured when starting a cycle.
- Return `400` if validation fails for role names or participant membership.

## Testing Strategy

- Verify the backend rejects mismatched role-slot and participant counts.
- Verify a new cycle produces a full assignment snapshot.
- Verify a second cycle shifts assignments from the first cycle.
- Verify history keeps previous cycles after starting a new one.
- Verify reset clears current cycle and history.
- Verify non-admin users cannot change rotation settings.

## Implementation Notes

- Keep the change localized to the house rotation flow.
- Do not introduce a separate scheduling engine or generic workflow abstraction.
- Preserve the app's existing Arabic-first UI tone and current house detail page patterns.
