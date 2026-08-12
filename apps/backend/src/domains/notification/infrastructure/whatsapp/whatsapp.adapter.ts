import type { Notification } from '../../domain/notification'

export class WhatsappAdapter {
  async send (notification: Notification): Promise<void> {
    // TODO
    throw new Error('Not implemented')
  }
}
