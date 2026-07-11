export interface DomainEvent {
  readonly eventId: string
  readonly eventType: string
  readonly occurredAt: Date
  readonly aggregateId: string
}

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>

class EventBus {
  private handlers = new Map<string, EventHandler<DomainEvent>[]>()

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler as EventHandler<DomainEvent>])
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? []
    await Promise.all(handlers.map((h) => h(event)))
  }
}

export const eventBus = new EventBus()
