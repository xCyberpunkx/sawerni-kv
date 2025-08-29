"use client"

import { UserManagementTable } from "@/components/user-management-table"

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">أدر جميع مستخدمي المنصة من مكان واحد</p>
      </div>

      <UserManagementTable />
    </div>
  )
}
