import type { EventType, Direction } from '@/types/summary'

export function deriveEventType(
  moneyTypeNote?: string
): EventType {
  if (moneyTypeNote === 'DEBTOR_NEW') return 'DEBTOR_NEW'
  if (moneyTypeNote === 'CLEAR_DEBTOR') return 'CLEAR_DEBTOR'
  return 'WAYBILL'
}

export function deriveDirection(
  eventType: EventType
): Direction {
  switch (eventType) {
    case 'DEBTOR_NEW':
      return 'DEBT_NEW'
    case 'CLEAR_DEBTOR':
      return 'DEBT_CLEAR'
    default:
      return 'INCOME'
  }
}
