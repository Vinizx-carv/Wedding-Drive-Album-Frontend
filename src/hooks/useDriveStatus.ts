import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { API_URL } from "../services/api";

interface DriveStatus {
  connected: boolean;
}

export function useDriveStatus() {
  return useQuery({
    queryKey: ["google-drive-status"],
    queryFn: async (): Promise<DriveStatus> => {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;
      if (!data.session) throw new Error("Sessão expirada.");

      const response = await fetch(`${API_URL}/auth/google/status`, {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível consultar o Google Drive.");
      }

      return response.json();
    },
    refetchOnWindowFocus: true,
  });
}