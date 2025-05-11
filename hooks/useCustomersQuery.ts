"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi } from "@/lib/api/customersApi"
import type { Customer, RateItem } from "@/types/models"
import { useToast } from "@/components/ui/use-toast"

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: any) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  orders: (customerId: string) => [...customerKeys.detail(customerId), "orders"] as const,
  rateCard: (customerId: string) => [...customerKeys.detail(customerId), "rate-card"] as const,
}

// Get all customers
export function useCustomers(params?: {
  page?: number
  pageSize?: number
  search?: string
}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.getCustomers(params),
  })
}

// Get a single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: !!id,
  })
}

// Get customer orders
export function useCustomerOrders(
  customerId: string,
  params?: {
    page?: number
    pageSize?: number
    status?: string
  },
) {
  return useQuery({
    queryKey: customerKeys.orders(customerId),
    queryFn: () => customersApi.getCustomerOrders(customerId, params),
    enabled: !!customerId,
  })
}

// Get customer rate card
export function useCustomerRateCard(customerId: string) {
  return useQuery({
    queryKey: customerKeys.rateCard(customerId),
    queryFn: () => customersApi.getCustomerRateCard(customerId),
    enabled: !!customerId,
  })
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (customerData: Partial<Customer>) => customersApi.createCustomer(customerData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast({
        title: "Success",
        description: `Customer ${data.data.name} created successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      })
    },
  })
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, customerData }: { id: string; customerData: Partial<Customer> }) =>
      customersApi.updateCustomer(id, customerData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast({
        title: "Success",
        description: `Customer ${data.data.name} updated successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      })
    },
  })
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      })
    },
  })
}

// Update customer rate card mutation
export function useUpdateCustomerRateCard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ customerId, rateItems }: { customerId: string; rateItems: RateItem[] }) =>
      customersApi.updateCustomerRateCard(customerId, rateItems),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.rateCard(variables.customerId) })
      toast({
        title: "Success",
        description: "Rate card updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update rate card",
        variant: "destructive",
      })
    },
  })
}
