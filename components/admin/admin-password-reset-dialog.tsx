'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { adminResetUserPassword } from '@/app/actions/password-management'
import { CheckCircle, AlertCircle, Mail } from 'lucide-react'

interface AdminPasswordResetDialogProps {
  userId: string
  userEmail: string
  userName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AdminPasswordResetDialog({
  userId,
  userEmail,
  userName,
  isOpen,
  onOpenChange,
  onSuccess,
}: AdminPasswordResetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')

  const handleReset = async () => {
    setError('')
    setLoading(true)

    try {
      const result = await adminResetUserPassword(userId, reason || undefined)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setReason('')
          onOpenChange(false)
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Generate a temporary password and send it to the user
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Password Reset Sent</h3>
              <p className="text-sm text-gray-600">
                A temporary password has been sent to <strong>{userEmail}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 bg-blue-50 p-3 rounded-md">
              <div className="flex gap-2">
                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Temporary Password</p>
                  <p className="text-blue-800">
                    A 12-character temporary password will be generated and sent to {userName} at {userEmail}.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reset (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., User forgot password, Security review, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="min-h-20"
              />
              <p className="text-xs text-gray-500">
                This will be logged in the password change history for audit purposes.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The user will be forced to change their password on the next login.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
