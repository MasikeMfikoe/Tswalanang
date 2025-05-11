export default function TestDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Dashboard Page</h1>
      <p className="mt-2">If you can see this page, the routing system is working correctly.</p>
      <p className="mt-2">
        Try navigating to{" "}
        <a href="/dashboard" className="text-blue-500 underline">
          /dashboard
        </a>{" "}
        now.
      </p>
    </div>
  )
}
