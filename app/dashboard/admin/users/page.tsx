"use client"

import { UserManagementTable } from "@/components/user-management-table"

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User management</h1>
        <p className="text-muted-foreground">Manage all platform users in one place</p>
      </div>

      <UserManagementTable />
    </div>
  )
}
