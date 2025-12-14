import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function useSWRAuth(key: string) {
  return useSWR(key, fetcher);
}
