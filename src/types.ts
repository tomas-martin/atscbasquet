export type Step = 'fiesta' | 'entradas' | 'datos' | 'pago' | 'confirmacion' | 'entradas_datos'

export type PaymentMethod = 'mercadopago' | 'naranja_x' | 'transferencia'
export type OrderStatus = 'pendiente' | 'pagado' | 'rechazado' | 'cancelado'

export type AttendeeRole = 'jugador' | 'acompanante' | 'menor'

export type DinnerBranch = 'femenino'

export const DINNER_BRANCH_CONFIG: Record<DinnerBranch, {
  title: string
  subtitle: string
  defaultDate: string
  shortDate: string
  tag: string
  badgeColor: string
  categoriesDesc: string
}> = {
  femenino: {
    title: 'Cena Básquet Femenino',
    subtitle: 'Formativa Femenina y Primera División Femenina',
    defaultDate: 'Sábado 19 de Diciembre de 2026 (19/12) · 21:00 hs',
    shortDate: 'Sábado 19/12 · 21:00 hs',
    tag: 'Rama Femenina',
    badgeColor: '#00d2b4',
    categoriesDesc: 'Formativa Femenina y Primera División Femenina'
  }
}

export const CATEGORIES = [
  'Mosquitos',
  'Pre-Mini',
  'Mini',
  'U13',
  'U15',
  'U17',
  'U19',
  'Primera División',
  'Maxibásquet',
  'Cuerpo Técnico / Dirigente'
] as const

export type Category = (typeof CATEGORIES)[number]

export interface AttendeeDetail {
  name: string
  role: AttendeeRole
  category: Category
}

export interface BuyerDetails {
  fullName: string
  dni: string
  email: string
  phone: string
  dinnerBranch?: DinnerBranch
  attendees?: string[]
  attendeeDetails?: AttendeeDetail[]
}

export interface CreateOrderRequest {
  buyer: BuyerDetails
  quantity: number
  paymentMethod: PaymentMethod
}

export interface IssuedTicket {
  ticketNumber: string
  attendeeName: string
  qrToken: string
  orderId: string
  eventName: string
  date: string
  venue: string
  dinnerBranch?: DinnerBranch
  isPlayer?: boolean
  role?: AttendeeRole
  category?: Category
}

export interface OrderConfirmation {
  orderId: string
  buyer: BuyerDetails
  dinnerBranch?: DinnerBranch
  quantity: number
  totalArs: number
  paymentMethod: PaymentMethod
  tickets: IssuedTicket[]
  emailSent: boolean
  emailError?: string
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'Mercado Pago',
  naranja_x: 'Naranja X',
  transferencia: 'Transferencia bancaria',
}

