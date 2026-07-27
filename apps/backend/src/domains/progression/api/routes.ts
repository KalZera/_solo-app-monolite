import type { FastifyPluginAsync } from 'fastify'

export const progressionRoutes: FastifyPluginAsync = async (app) => {
  app.get('/character/:characterId', async (req) => {
    const { characterId } = req.params as { characterId: string }
    return { characterId, level: 1, experience: 0, nextLevelXp: 100 }
  })

  app.post('/character/:characterId/xp', async (req) => {
    const { characterId } = req.params as { characterId: string }
    const { amount } = req.body as { amount: number }
    return { characterId, gained: amount, newTotal: amount }
  })
}
