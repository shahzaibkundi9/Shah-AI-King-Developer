import api from "@/services/api";

export default async function fetcher(url: string) {
  const res = await api.get(url);
  return res.data;
}
