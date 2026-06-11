'use client'

import { createContext, useContext } from 'react'

export const IsAdminContext = createContext(false)
export const useIsAdmin = () => useContext(IsAdminContext)
