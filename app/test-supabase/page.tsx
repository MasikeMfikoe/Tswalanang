"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TestTube, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Terminal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestSupabasePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])
    const results: any[] = []

    try {
      // Test 1: Check Supabase connection
      results.push({ test: "Supabase Connection", status: "running", message: "Testing..." })
      setTestResults([...results])

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        results[0] = { test: "Supabase Connection", status: "failed", message: bucketsError.message }
        setTestResults([...results])
        return
      }

      results[0] = { test: "Supabase Connection", status: "passed", message: `Found ${buckets.length} buckets` }
      setTestResults([...results])

      // Test 2: Check documents bucket
      results.push({ test: "Documents Bucket", status: "running", message: "Checking..." })
      setTestResults([...results])

      const documentsBucket = buckets.find((bucket) => bucket.id === "documents")
      if (!documentsBucket) {
        results[1] = { test: "Documents Bucket", status: "failed", message: "Documents bucket not found" }
        setTestResults([...results])
        return
      }

      results[1] = { test: "Documents Bucket", status: "passed", message: "Documents bucket exists" }
      setTestResults([...results])

      // Test 3: Test file upload
      results.push({ test: "File Upload", status: "running", message: "Uploading test file..." })
      setTestResults([...results])

      const testFile = new Blob(["test content"], { type: "text/plain" })
      const testFileName = `test-${Date.now()}.txt`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(testFileName, testFile)

      if (uploadError) {
        results[2] = { test: "File Upload", status: "failed", message: uploadError.message }
        setTestResults([...results])
        return
      }

      results[2] = { test: "File Upload", status: "passed", message: "File uploaded successfully" }
      setTestResults([...results])

      // Test 4: Test database insert
      results.push({ test: "Database Insert", status: "running", message: "Inserting test record..." })
      setTestResults([...results])

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(testFileName)

      const testRecord = {
        name: "test-document.txt",
        type: "Test Document",
        url: urlData.publicUrl,
        order_id: "00000000-0000-0000-0000-000000000000", // Using a dummy UUID
      }

      const { data: dbData, error: dbError } = await supabase.from("uploaded_documents").insert([testRecord]).select()

      if (dbError) {
        results[3] = { test: "Database Insert", status: "failed", message: dbError.message }
        setTestResults([...results])

        // Clean up uploaded file
        await supabase.storage.from("documents").remove([testFileName])
        return
      }

      results[3] = { test: "Database Insert", status: "passed", message: "Database record created" }
      setTestResults([...results])

      // Test 5: Clean up
      results.push({ test: "Cleanup", status: "running", message: "Cleaning up test data..." })
      setTestResults([...results])

      // Delete test record
      if (dbData && dbData[0]) {
        await supabase.from("uploaded_documents").delete().eq("id", dbData[0].id)
      }

      // Delete test file
      await supabase.storage.from("documents").remove([testFileName])

      results[4] = { test: "Cleanup", status: "passed", message: "Test data cleaned up" }
      setTestResults([...results])

      toast({
        title: "All Tests Passed!",
        description: "Supabase is working correctly",
      })
    } catch (error: any) {
      console.error("Test error:", error)
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      default:
        return null
    }
  }

  const hasFailedDocumentsBucket = testResults.some(
    (result) => result.test === "Documents Bucket" && result.status === "failed",
  )

  const sqlCreateBucket = `-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'documents');`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard!",
    })
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Supabase Connection Test
          </CardTitle>
          <CardDescription>
            This test will verify that your Supabase connection is working properly for document uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runTests} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run Connection Tests
              </>
            )}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasFailedDocumentsBucket && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <XCircle className="h-5 w-5" />
                Documents Bucket Missing
              </div>
              <div className="text-sm text-yellow-700 mb-3">
                The documents bucket doesn't exist. You need to create it in your Supabase dashboard.
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dashboard">Dashboard Method</TabsTrigger>
                  <TabsTrigger value="sql">SQL Method</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="space-y-4 mt-2">
                  <div className="text-sm space-y-3">
                    <p>Follow these steps to create the bucket in Supabase Dashboard:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to your Supabase Dashboard</li>
                      <li>
                        Navigate to <strong>Storage</strong> in the left sidebar
                      </li>
                      <li>
                        Click <strong>New Bucket</strong>
                      </li>
                      <li>
                        Enter <strong>documents</strong> as the bucket name
                      </li>
                      <li>
                        Check <strong>Public bucket</strong> to make it public
                      </li>
                      <li>
                        Click <strong>Create bucket</strong>
                      </li>
                    </ol>
                    <Button
                      variant="outline"
                      className="mt-2 bg-transparent"
                      onClick={() => window.open("https://app.supabase.com", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Supabase Dashboard
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="sql" className="mt-2">
                  <div className="text-sm space-y-3">
                    <p>Run this SQL in your Supabase SQL Editor:</p>
                    <div className="relative">
                      <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">{sqlCreateBucket}</pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(sqlCreateBucket)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2 bg-transparent"
                      onClick={() => window.open("https://app.supabase.com", "_blank")}
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Open SQL Editor
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> This test will create and delete temporary files and database records to verify
            functionality.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
