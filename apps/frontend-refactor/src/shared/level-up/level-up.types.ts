export interface LevelUpStatChange {
  /** Backend attribute key (e.g. "strength"); translated via `character.stats.*`. */
  key: string
  from: number
  to: number
}

export interface LevelUpEvent {
  fromLevel: number
  toLevel: number
  stats: LevelUpStatChange[]
}
