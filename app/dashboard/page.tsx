import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to the home page which now shows the dashboard
  redirect("/")
}
