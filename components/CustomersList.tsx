"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Customer {
  id: number
  name: string
  email: string
  totalOrders: number
  vatNumber?: string
  importersCode?: string
  contactPerson?: string
  phone?: string
}

export function CustomersList({ initialCustomers }: { initialCustomers: Customer[] }) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddNewCustomer = () => {
    router.push("/customers/new")
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="w-64"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleAddNewCustomer}>Add New Customer</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>VAT Number</TableHead>
            <TableHead>Importer's Code</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.vatNumber || "Not provided"}</TableCell>
              <TableCell>{customer.importersCode || "Not provided"}</TableCell>
              <TableCell>{customer.totalOrders}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => router.push(`/customers/${customer.id}`)}>
                  View Profile
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
