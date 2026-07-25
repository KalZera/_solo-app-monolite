export interface DomainEvent {
  readonly eventId: string
  readonly eventType: string
  readonly occurredAt: Date
  readonly aggregateId: string
}

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>

class EventBus {
  private handlers = new Map<string, EventHandler<DomainEvent>[]>()
  private globalHandlers: EventHandler<DomainEvent>[] = []

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler as EventHandler<DomainEvent>])
  }

  // Fires for every event regardless of type — used for cross-cutting concerns like event persistence.
  subscribeToAll(handler: EventHandler<DomainEvent>): void {
    this.globalHandlers.push(handler)
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? []
    await Promise.all([...handlers, ...this.globalHandlers].map((h) => h(event)))
  }
}

export const eventBus = new EventBus()
