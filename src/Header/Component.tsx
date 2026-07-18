import { HeaderClient } from './Component.client'
import { getCachedGlobalSafe } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobalSafe('header', 1)()

  return <HeaderClient data={headerData} />
}
