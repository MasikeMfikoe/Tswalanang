import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
      </header>
      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage basic application settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input id="app-name" defaultValue="TSW Smartlog" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Africa/Johannesburg" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Enable Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure email notification settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" defaultValue="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" type="number" defaultValue={587} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" defaultValue="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input id="smtp-pass" type="password" defaultValue="password123" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-updates">Order Updates</Label>
              <Switch id="order-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delivery-alerts">Delivery Alerts</Label>
              <Switch id="delivery-alerts" defaultChecked />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Manage external API connections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gocomet-api-key">GoComet API Key</Label>
              <Input id="gocomet-api-key" defaultValue="sk_gocomet_12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searates-api-key">SeaRates API Key</Label>
              <Input id="searates-api-key" defaultValue="sk_searates_67890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maersk-api-key">Maersk API Key</Label>
              <Input id="maersk-api-key" defaultValue="sk_maersk_abcde" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Processing</CardTitle>
            <CardDescription>Configure settings for document OCR and processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ocr-endpoint">OCR Service Endpoint</Label>
              <Input id="ocr-endpoint" defaultValue="https://api.ocr.example.com/process" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-storage-path">Document Storage Path</Label>
              <Input id="document-storage-path" defaultValue="/uploads/documents" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-process-docs">Auto-process new documents</Label>
              <Switch id="auto-process-docs" defaultChecked />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>Perform system-level operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log-level">Logging Level</Label>
              <Input id="log-level" defaultValue="info" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-schedule">Database Backup Schedule</Label>
              <Input id="backup-schedule" defaultValue="daily at 2 AM" />
            </div>
            <Button variant="destructive">Clear Cache</Button>
            <Button variant="destructive">Run Database Migration</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom CSS/JS</CardTitle>
            <CardDescription>Add custom styles or scripts to your application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-css">Custom CSS</Label>
              <Textarea id="custom-css" rows={5} placeholder="/* Your custom CSS here */" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-js">Custom JavaScript</Label>
              <Textarea id="custom-js" rows={5} placeholder="// Your custom JavaScript here" />
            </div>
            <Button>Apply Customizations</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
