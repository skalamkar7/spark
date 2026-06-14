'use client'

import { useState } from 'react'
import { approveUser, rejectUser } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Check, X, Mail, Phone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

interface AdminDashboardClientProps {
  pendingUsers: User[]
  approvedUsers: User[]
  rejectedUsers: any[]
  adminEmail: string
}

export function AdminDashboardClient({
  pendingUsers,
  approvedUsers,
  rejectedUsers,
  adminEmail,
}: AdminDashboardClientProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      await approveUser(selectedUser.id, adminEmail)
      setActionDialog(null)
      setSelectedUser(null)
      // Refresh page
      window.location.reload()
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      await rejectUser(selectedUser.id, adminEmail, rejectionReason)
      setActionDialog(null)
      setSelectedUser(null)
      setRejectionReason('')
      // Refresh page
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage agent sign-ups and approvals
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Users */}
          <TabsContent value="pending" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <p>No pending approvals</p>
              </Card>
            ) : (
              pendingUsers.map(u => (
                <Card key={u.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {u.name || u.email}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {u.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Registered: {u.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedUser(u)
                          setActionDialog('approve')
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(u)
                          setActionDialog('reject')
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved Users */}
          <TabsContent value="approved" className="space-y-4">
            {approvedUsers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <p>No approved users yet</p>
              </Card>
            ) : (
              approvedUsers.map(u => (
                <Card key={u.id} className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">Approved</Badge>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {u.name || u.email}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {u.email}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rejected Users */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedUsers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <p>No rejected users</p>
              </Card>
            ) : (
              rejectedUsers.map(record => (
                <Card key={record.id} className="p-6 bg-red-50 border-red-200">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-red-600">Rejected</Badge>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        <strong>User ID:</strong> {record.userId}
                      </p>
                      {record.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Reason:</strong> {record.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Rejected: {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      {actionDialog === 'approve' && selectedUser && (
        <Dialog open onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve User</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve {selectedUser.email}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {actionDialog === 'reject' && selectedUser && (
        <Dialog open onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject User</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {selectedUser.email}
              </DialogDescription>
            </DialogHeader>
            <div>
              <Textarea
                placeholder="Reason for rejection (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
