"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface UserWithPassword extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      // Check localStorage for current user session
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('currentUser')
        }
      }
    }
    setIsLoading(false)
  }, [])

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // 检查是否在客户端
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return { success: false, error: 'Feature not available during server rendering' }
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Get existing users from localStorage
      const existingUsers = localStorage.getItem('registeredUsers')
      const users: UserWithPassword[] = existingUsers ? JSON.parse(existingUsers) : []
      
      // Check if user already exists
      const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (userExists) {
        setIsLoading(false)
        return { success: false, error: 'An account with this email already exists' }
      }
      
      // Create new user
      const newUser: UserWithPassword = {
        id: Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        name,
        password // In real app, this would be hashed
      }
      
      // Save to users database
      users.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'Failed to create account. Please try again.' }
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // 检查是否在客户端
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return { success: false, error: 'Feature not available during server rendering' }
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Get registered users from localStorage
      const existingUsers = localStorage.getItem('registeredUsers')
      const users: UserWithPassword[] = existingUsers ? JSON.parse(existingUsers) : []
      
      // Find user by email and password
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      )
      
      if (!foundUser) {
        setIsLoading(false)
        return { success: false, error: 'Invalid email or password' }
      }
      
      // Set current user (without password for security)
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 