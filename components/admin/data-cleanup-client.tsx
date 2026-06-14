'use client'

import { useState } from 'react'
import { removeDummyData, markAsDummy } from '@/app/actions/data-management'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DataSummary {
  totalClients: number
  realClients: number
  dummyClients: number
  totalPolicies: number
  realPolicies: number
  dummyPolicies: number
}

interface DummyRecord {
  id: string
  userId: string
  tableName: string
  recordId: string
  isDummy: boolean
  createdAt: Date
}

interface DataCleanupClientProps {
  dataSummary: DataSummary
  dummyData: DummyRecord[]
  agentEmail: string
}

export function DataCleanupClient({
  dataSummary,
  dummyData,
  agentEmail,
}: DataCleanupClientProps) {
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const totalDummyRecords = dataSummary.dummyClients + dataSummary.dummyPolicies

  const handleRemoveDummyData = async () => {
    setLoading(true)
    try {
      const result = await removeDummyData()
      setSuccessMessage(`Successfully removed ${result.deleted} dummy records`)
      setConfirmDialog(false)
      // Refresh page after a delay
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Error removing dummy data:', error)
      alert('Failed to remove dummy data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </Card>
      )}

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clients Summary */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Clients</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Clients:</span>
              <span className="text-2xl font-bold text-gray-900">
                {dataSummary.totalClients}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Real Data:</span>
              <span className="text-lg font-semibold text-green-600">
                {dataSummary.realClients}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dummy Data:</span>
              <span className="text-lg font-semibold text-red-600">
                {dataSummary.dummyClients}
              </span>
            </div>
          </div>
        </Card>

        {/* Policies Summary */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Policies</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Policies:</span>
              <span className="text-2xl font-bold text-gray-900">
                {dataSummary.totalPolicies}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Real Data:</span>
              <span className="text-lg font-semibold text-green-600">
                {dataSummary.realPolicies}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dummy Data:</span>
              <span className="text-lg font-semibold text-red-600">
                {dataSummary.dummyPolicies}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Dummy Data Details */}
      {totalDummyRecords > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex gap-4 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                {totalDummyRecords} Dummy Records Found
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                These are test/mock records that were added during setup. You should remove them before other agents start using the application to ensure they work with clean, real data.
              </p>
              <div className="space-y-2 text-sm">
                {dummyData.length > 0 && (
                  <>
                    <p className="font-semibold text-yellow-900">Dummy records to be removed:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800">
                      {dummyData.slice(0, 10).map(record => (
                        <li key={record.id}>
                          {record.tableName}: {record.recordId.substring(0, 8)}...
                        </li>
                      ))}
                      {dummyData.length > 10 && (
                        <li>and {dummyData.length - 10} more...</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={() => setConfirmDialog(true)}
            className="w-full md:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove All Dummy Data
          </Button>
        </Card>
      )}

      {/* No Dummy Data Message */}
      {totalDummyRecords === 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Ready for Deployment</h3>
              <p className="text-sm text-green-800">
                No dummy data found. Your application is ready to be shared with other agents.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Information Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Data Isolation Guarantee</p>
            <p>
              Each agent only sees data they create. Even though all data is in the same database, the application filters data by user ID at the query level. This means Agent A cannot see Agent B&apos;s clients or policies.
            </p>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Remove Dummy Data
            </DialogTitle>
            <DialogDescription>
              This action will permanently delete {totalDummyRecords} dummy records. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveDummyData}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove Dummy Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
