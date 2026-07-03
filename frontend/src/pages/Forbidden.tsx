import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <ShieldOff className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        You don't have permission to view this page. This area is restricted to admins only.
      </p>
      <Button className="mt-6" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  );
}
