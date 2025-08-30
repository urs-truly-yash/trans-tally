import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/auth/AuthForm'
import { Dashboard } from '@/components/dashboard/Dashboard'

const Index = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your financial tracker</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
};

export default Index;
