import type { BadgeTone } from '@/shared/components'

// Shared across the quest module's presentation components — any place that renders a
// quest rank (E..S) as a Badge should map it through this, instead of re-declaring it.
export const rankTone: Record<string, BadgeTone> = {
  E: 'muted',
  D: 'primary',
  C: 'success',
  B: 'warning',
  A: 'epic',
  S: 'legendary',
}
