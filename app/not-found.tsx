import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-50">404</CardTitle>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Page Not Found</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" passHref>
            <Button className="w-full">Go to Homepage</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
