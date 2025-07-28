import dynamic from "next/dynamic"

const OrderList = dynamic(() => import("@/components/OrderList"))

const OrdersPage = () => {
  return (
    <div>
      <h1>Orders</h1>
      <OrderList />
    </div>
  )
}

export default OrdersPage
