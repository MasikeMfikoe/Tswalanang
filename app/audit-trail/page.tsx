import { PageHeader } from "@/components/ui/page-header"
import { AuditTrailContent } from "@/components/AuditTrailContent"

export default function AuditTrailPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Audit Trail" description="View a detailed log of all system activities and user actions." />
      <AuditTrailContent />
    </div>
  )
}
