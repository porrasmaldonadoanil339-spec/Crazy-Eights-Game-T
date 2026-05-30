---
name: Ranked deferred star-loss on exit
description: Why a deferred ranked star loss must be committed on EVERY exit path, not just the result modal.
---

# Ranked deferred star-loss (Rescate Clasificatoria)

When a ranked match is lost and the player still has daily rescues left, the `-1`
star is NOT applied immediately — it is deferred so the player can watch a rewarded
ad to cancel it. A `rankedLossAppliedRef` guard makes the commit idempotent.

**Rule:** every screen-exit path in `app/game.tsx` must commit a still-pending
deferred loss before navigating away — `if (rankedRescueAvailable && !rankedRescued) applyDeferredRankedLoss();`

**Why:** the result modal (EndModal) Home/Restart buttons are not the only way out.
There is also `ExitConfirmModal` (hardware back / quit), and any future escape route.
If a path navigates away without committing, the player can dodge the star penalty
entirely. This was a real bug caught in review: the exit-confirm path skipped the commit.

**How to apply:** when adding any new navigation-away action on the game screen,
call the deferred-loss commit guard first, or it silently lets players bypass ranked
penalties.
