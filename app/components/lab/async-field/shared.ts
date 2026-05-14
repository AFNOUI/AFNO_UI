import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface Option {
  label: string;
  value: string;
}

export interface AsyncApiPreset {
  url: string;
  name: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

export const ASYNC_API_PRESETS: AsyncApiPreset[] = [
  { name: "Users", url: "https://jsonplaceholder.typicode.com/users", labelKey: "name", valueKey: "id", dataPath: "" },
  { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts", labelKey: "title", valueKey: "id", dataPath: "" },
  { name: "Todos", url: "https://jsonplaceholder.typicode.com/todos", labelKey: "title", valueKey: "id", dataPath: "" },
];

export function getPresetByName(name: string | undefined): AsyncApiPreset {
  if (!name) return ASYNC_API_PRESETS[0];
  return ASYNC_API_PRESETS.find((p) => p.name === name) ?? ASYNC_API_PRESETS[0];
}

export function useAsyncOptions(url: string, labelKey: string, valueKey: string, dataPath: string) {
  return useQuery({
    queryKey: ["async-preview", url, labelKey, valueKey, dataPath],
    queryFn: async () => {
      const { data } = await axios.get(url);
      const items = dataPath ? dataPath.split(".").reduce((o: unknown, k: string) => (o as Record<string, unknown>)?.[k], data as unknown) : data;
      return (Array.isArray(items) ? items : []).map((item: unknown) => {
        const rec = item as Record<string, unknown>;
        return {
          label: String(rec[labelKey] || ""),
          value: String(rec[valueKey] || ""),
        };
      }) as Option[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
