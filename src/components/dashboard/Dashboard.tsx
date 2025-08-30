import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'
import { FinancialCharts } from './FinancialCharts'
import { ReceiptUpload } from './ReceiptUpload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Dashboard = () => {
  const { signOut, user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="receipts">Receipt Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Your spending patterns and income trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialCharts key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View and manage your income and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>
                  Record a new income or expense
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionForm onTransactionAdded={handleTransactionAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Upload</CardTitle>
                <CardDescription>
                  Upload receipts to automatically extract transaction data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptUpload onReceiptProcessed={handleTransactionAdded} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}