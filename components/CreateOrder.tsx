"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Button, TextField, Typography, Container, Paper, Grid, CircularProgress } from "@mui/material"
import dynamic from "next/dynamic"

const OrderConfirmationDialog = dynamic(() => import("./OrderConfirmationDialog"))

const CreateOrder = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [orderData, setOrderData] = useState({
    customerName: "",
    orderDescription: "",
    quantity: 1,
  })
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (status === "loading") {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: "20px", marginTop: "20px", textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body1">Loading...</Typography>
        </Paper>
      </Container>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: "20px", marginTop: "20px", textAlign: "center" }}>
          <Typography variant="h6">Authentication Required</Typography>
          <Typography variant="body1">Please sign in to create an order.</Typography>
          <Button variant="contained" color="primary" onClick={() => router.push("/api/auth/signin")}>
            Sign In
          </Button>
        </Paper>
      </Container>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        setOpenConfirmation(true)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || "Failed to create order")
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false)
    router.push("/orders")
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customerName"
                value={orderData.customerName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Order Description"
                name="orderDescription"
                value={orderData.orderDescription}
                onChange={handleChange}
                required
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={orderData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Create Order"}
              </Button>
              {errorMessage && (
                <Typography color="error" style={{ marginTop: "10px" }}>
                  {errorMessage}
                </Typography>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
      <OrderConfirmationDialog open={openConfirmation} onClose={handleCloseConfirmation} />
    </Container>
  )
}

export default CreateOrder
