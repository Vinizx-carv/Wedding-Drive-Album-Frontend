
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useQuery({
    queryKey: ['admin-session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      return data.session;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (session.isPending || session.isFetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Verificando sessão...
      </main>
    );
  }

  if (session.isError || !session.data) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
