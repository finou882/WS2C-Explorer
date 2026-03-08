import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Items API
export const itemsApi = {
  list: (params?: {
    category?: string;
    search?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return fetchAPI<{ items: Item[] }>(`/items${query ? `?${query}` : ""}`);
  },

  getCategories: () => fetchAPI<{ categories: string[] }>("/items/categories"),

  get: (id: string) => fetchAPI<{ item: Item }>(`/items/${id}`),

  create: (data: CreateItemInput) =>
    fetchAPI<{ item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateItemInput) =>
    fetchAPI<{ item: Item }>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/items/${id}`, {
      method: "DELETE",
    }),
};
