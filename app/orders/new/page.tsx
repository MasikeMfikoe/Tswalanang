import dynamic from "next/dynamic"

const OrderForm = dynamic(() => import("@/components/OrderForm"))

const NewOrderPage = () => {
  return (
    <div>
      <h1>Create New Order</h1>
      <OrderForm />
    </div>
  )
}

export default NewOrderPage
