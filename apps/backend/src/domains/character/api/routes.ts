import type { FastifyPluginAsync } from 'fastify'

export const characterRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ data: [], total: 0 }))

  app.get('/:id', async (req) => {
    const { id } = req.params as { id: string }
    return { id }
  })

  app.post('/', async (req, reply) => {
    return reply.status(201).send({ message: 'character created' })
  })

  app.patch('/:id', async (req) => {
    const { id } = req.params as { id: string }
    return { id, updated: true }
  })
}
