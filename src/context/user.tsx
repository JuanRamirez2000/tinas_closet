'use client'

import { createContext, useContext } from 'react'

interface UserContextValue {
  loggedInUserId: string
  viewingUserId: string
  viewingClosetName: string
}

const UserContext = createContext<UserContextValue>({
  loggedInUserId: '',
  viewingUserId: '',
  viewingClosetName: '',
})

export const UserProvider = UserContext.Provider
export const useLoggedInUserId = () => useContext(UserContext).loggedInUserId
export const useViewingUserId  = () => useContext(UserContext).viewingUserId
export const useViewingClosetName = () => useContext(UserContext).viewingClosetName
