import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data, error } = useSWR("/auth/me", fetcher);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) router.push("/auth/login");
  }, [router]);

  return { user: data?.data, loading: !data && !error, error };
}
