import 'server-only'

import { env } from '@/lib/env'

const VISITCLOUD_REGISTRATION_URL =
  'https://register.visitcloud.com/survey/1pjxqc9wntuo6'

export function extractActionCodeFromUrl(value: string): string {
  if (!value) {
    return ''
  }

  try {
    const url = new URL(value)

    return (
      url.searchParams.get('actioncode') ||
      url.searchParams.get('actionCode') ||
      url.searchParams.get('registration-code') ||
      ''
    ).trim()
  } catch {
    return ''
  }
}

export function buildVisitCloudRegistrationUrl(actionCode: string): string {
  const normalisedActionCode = actionCode.trim()

  if (!normalisedActionCode) {
    throw new Error(
      'Cannot build VisitCloud registration URL: MapYourShow Actioncode is missing.'
    )
  }

  const discountCode = env.ISE_REGISTRATION_DISCOUNT_CODE.trim()

  if (!discountCode) {
    throw new Error(
      'Cannot build VisitCloud registration URL: ISE_REGISTRATION_DISCOUNT_CODE is missing.'
    )
  }

  const url = new URL(VISITCLOUD_REGISTRATION_URL)
  url.searchParams.set('actioncode', normalisedActionCode)
  url.searchParams.set('registration-code', normalisedActionCode)
  url.searchParams.set('discount-code', discountCode)

  return url.toString()
}
