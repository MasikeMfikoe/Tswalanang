import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Admin Settings" description="Manage application-wide settings and configurations." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic application behavior.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input id="appName" defaultValue="TSW Smartlog" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Input id="defaultCurrency" defaultValue="USD" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <Switch id="enableNotifications" defaultChecked />
            </div>
            <Button>Save General Settings</Button>
          </CardContent>
        </Card>

        {/* API Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Manage credentials for external services.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="searatesApiKey">SeaRates API Key</Label>
              <Input id="searatesApiKey" type="password" defaultValue="********************" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gocometApiKey">Gocomet API Key</Label>
              <Input id="gocometApiKey" type="password" defaultValue="********************" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maerskClientId">Maersk Client ID</Label>
              <Input id="maerskClientId" type="password" defaultValue="********************" />
            </div>
            <Button>Update API Keys</Button>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Settings related to user accounts and access.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="allowUserRegistration">Allow New User Registration</Label>
              <Switch id="allowUserRegistration" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultUserRole">Default New User Role</Label>
              <Input id="defaultUserRole" defaultValue="viewer" />
            </div>
            <Button>Save User Settings</Button>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>Configure how long data is stored.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderRetention">Order Data Retention (days)</Label>
              <Input id="orderRetention" type="number" defaultValue={365} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
              <Input id="auditLogRetention" type="number" defaultValue={90} />
            </div>
            <Button>Save Retention Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
