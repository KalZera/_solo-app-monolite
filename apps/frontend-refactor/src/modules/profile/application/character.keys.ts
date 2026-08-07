export const characterKeys = {
  all: ['character'] as const,
  profile: () => [...characterKeys.all, 'profile'] as const,
}
