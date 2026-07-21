import type { FastifyPluginAsync } from 'fastify'

export const questRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ data: [], total: 0 }))

  app.get('/:id', async (req) => {
    const { id } = req.params as { id: string }
    return { id }
  })

  app.post('/', async (_req, reply) => {
    return reply.status(201).send({ message: 'quest created' })
  })

  app.post('/:id/start', async (req) => {
    const { id } = req.params as { id: string }
    return { id, status: 'in_progress' }
  })

  app.post('/:id/complete', async (req) => {
    const { id } = req.params as { id: string }
    return { id, status: 'completed' }
  })
}
