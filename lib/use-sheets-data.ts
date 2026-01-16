/**
 * React hook for fetching data from Google Sheets API
 * Use this in your components to replace mock data
 */

import { useState, useEffect } from 'react'

interface UseSheetsDataOptions {
  tab?: string
  sheetId?: string
  enabled?: boolean
}

export function useSheetsTasks(options: UseSheetsDataOptions = {}) {
  const { tab = 'Support', sheetId, enabled = true } = options
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams({ tab })
        if (sheetId) params.append('sheetId', sheetId)
        
        const response = await fetch(`/api/sheets/tasks?${params}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data || [])
        } else {
          setError(result.error || 'Failed to fetch tasks')
          // In development, set empty array to prevent breaking
          if (process.env.NODE_ENV === 'development') {
            setData([])
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks')
        if (process.env.NODE_ENV === 'development') {
          setData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tab, sheetId, enabled])

  return { data, loading, error }
}

export function useSheetsAllTabs(options: { sheetId?: string; enabled?: boolean } = {}) {
  const { sheetId, enabled = true } = options
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (sheetId) params.append('sheetId', sheetId)
        
        const response = await fetch(`/api/sheets/tabs?${params}`)
        const result = await response.json()

        if (result.success) {
          setData(result)
        } else {
          setError(result.error || 'Failed to fetch all tabs')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch all tabs')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sheetId, enabled])

  return { data, loading, error }
}

export function useSheetsReconciliation(options: UseSheetsDataOptions = {}) {
  const { tab = 'Support', sheetId, enabled = true } = options
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams({ tab })
        if (sheetId) params.append('sheetId', sheetId)
        
        const response = await fetch(`/api/sheets/reconciliation?${params}`)
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch reconciliation data')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reconciliation data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tab, sheetId, enabled])

  return { data, loading, error }
}
