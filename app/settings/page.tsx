import { DashboardHeader } from "@/components/dashboard-header"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

          <SettingsForm />
        </div>
      </main>
    </div>
  )
}
