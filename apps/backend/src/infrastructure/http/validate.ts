import { z } from 'zod'
import { ValidationError } from '../../shared/errors/app-error'

// Parses request input (body/params/query) against a Zod schema at the HTTP boundary.
// On failure it throws a domain ValidationError (→ 400 via the error handler) with a
// readable, path-annotated message. Unknown keys are stripped by Zod's default behaviour,
// which is what closes mass-assignment (e.g. a client-supplied `rewardXp` never survives).
export function parseInput<S extends z.ZodTypeAny> (schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data)

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.')
        return path ? `${path}: ${issue.message}` : issue.message
      })
      .join('; ')
    throw new ValidationError(message)
  }

  return result.data
}
