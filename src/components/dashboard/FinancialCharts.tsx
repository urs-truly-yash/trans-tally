import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, Transaction } from '@/lib/supabase'

export const FinancialCharts = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [timeRange])

  const fetchTransactions = async () => {
    setLoading(true)
    
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))
    
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .gte('date', daysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (data) {
      setTransactions(data)
    }
    
    setLoading(false)
  }

  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === 'expense')
    const categoryMap = new Map()

    expenses.forEach(transaction => {
      const categoryName = transaction.categories?.name || 'Uncategorized'
      const categoryColor = transaction.categories?.color || '#gray'
      
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          ...categoryMap.get(categoryName),
          value: categoryMap.get(categoryName).value + transaction.amount
        })
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          value: transaction.amount,
          color: categoryColor
        })
      }
    })

    return Array.from(categoryMap.values())
  }

  const getDailyTrends = () => {
    const dailyMap = new Map()

    transactions.forEach(transaction => {
      const date = transaction.date
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, income: 0, expenses: 0 })
      }
      
      const dayData = dailyMap.get(date)
      if (transaction.type === 'income') {
        dayData.income += transaction.amount
      } else {
        dayData.expenses += transaction.amount
      }
    })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  const getMonthlyComparison = () => {
    const monthlyMap = new Map()

    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { month, income: 0, expenses: 0 })
      }
      
      const monthData = monthlyMap.get(month)
      if (transaction.type === 'income') {
        monthData.income += transaction.amount
      } else {
        monthData.expenses += transaction.amount
      }
    })

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))
  }

  const expensesByCategory = getExpensesByCategory()
  const dailyTrends = getDailyTrends()
  const monthlyComparison = getMonthlyComparison()

  if (loading) {
    return <div className="text-center py-8">Loading charts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Financial Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends</CardTitle>
            <CardDescription>Income vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>Income and expenses by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}