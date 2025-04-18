"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, Calendar, Settings, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">EventPlannerAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-4">Menu</h2>
                    <nav className="flex flex-col space-y-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
