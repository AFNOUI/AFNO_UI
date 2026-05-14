import { z } from "zod";

import type { FormConfig, ReactHookFormZodSchema } from "../../forms/types/types";

export const formConfig: FormConfig = {
  id: "async-infinite-form",
  title: "Remote Data Form",
  description: "All async and infinite field types using JSONPlaceholder & DummyJSON APIs",
  submitLabel: "Submit",
  showReset: true,
  layout: "single",
  sections: [
    {
      id: "async-section",
      title: "Async Fields (fetch all on mount)",
      columns: 2,
      fields: [
        {
          type: "asyncselect",
          name: "asyncUser",
          label: "User (Async Select)",
          required: true,
          options: [],
          apiConfig: {
            url: "https://jsonplaceholder.typicode.com/users",
            method: "GET" as const,
            responseMapping: { dataPath: "", labelKey: "name", valueKey: "id" },
          },
        },
        {
          type: "asynccombobox",
          name: "asyncPost",
          label: "Post (Async Combobox)",
          options: [],
          searchPlaceholder: "Search posts...",
          emptyMessage: "No posts found",
          apiConfig: {
            url: "https://jsonplaceholder.typicode.com/posts",
            method: "GET" as const,
            responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
          },
        },
        {
          type: "asyncmultiselect",
          name: "asyncAlbums",
          label: "Albums (Async Multi Select)",
          options: [],
          maxItems: 3,
          apiConfig: {
            url: "https://jsonplaceholder.typicode.com/albums",
            method: "GET" as const,
            responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
          },
        },
        {
          type: "asyncmulticombobox",
          name: "asyncTodos",
          label: "Todos (Async Multi Combobox)",
          options: [],
          maxItems: 5,
          searchPlaceholder: "Search todos...",
          emptyMessage: "No todos found",
          apiConfig: {
            url: "https://jsonplaceholder.typicode.com/todos",
            method: "GET" as const,
            responseMapping: { dataPath: "", labelKey: "title", valueKey: "id" },
          },
        },
      ],
    },
    {
      id: "infinite-section",
      title: "Infinite Scroll Fields (paginated loading)",
      columns: 2,
      fields: [
        {
          type: "infiniteselect",
          name: "infProduct",
          label: "Product (Infinite Select)",
          options: [],
          apiConfig: {
            url: "https://dummyjson.com/products/search",
            method: "GET" as const,
            responseMapping: { dataPath: "products", labelKey: "title", valueKey: "id" },
            searchParam: "q",
            pageParam: "skip",
            pageSizeParam: "limit",
            pageSize: 10,
            hasMorePath: "total",
            offsetBased: true,
          },
        },
        {
          type: "infinitecombobox",
          name: "infRecipe",
          label: "Recipe (Infinite Combobox)",
          options: [],
          searchPlaceholder: "Search recipes...",
          emptyMessage: "No recipes found",
          apiConfig: {
            url: "https://dummyjson.com/recipes/search",
            method: "GET" as const,
            responseMapping: { dataPath: "recipes", labelKey: "name", valueKey: "id" },
            searchParam: "q",
            pageParam: "skip",
            pageSizeParam: "limit",
            pageSize: 10,
            hasMorePath: "total",
            offsetBased: true,
          },
        },
        {
          type: "infinitemultiselect",
          name: "infUsers",
          label: "Users (Infinite Multi Select)",
          options: [],
          maxItems: 5,
          apiConfig: {
            url: "https://dummyjson.com/users/search",
            method: "GET" as const,
            responseMapping: { dataPath: "users", labelKey: "firstName", valueKey: "id" },
            searchParam: "q",
            pageParam: "skip",
            pageSizeParam: "limit",
            pageSize: 10,
            hasMorePath: "total",
            offsetBased: true,
          },
        },
        {
          type: "infinitemulticombobox",
          name: "infPosts",
          label: "Posts (Infinite Multi Combobox)",
          options: [],
          maxItems: 5,
          searchPlaceholder: "Search posts...",
          emptyMessage: "No posts found",
          apiConfig: {
            url: "https://dummyjson.com/posts/search",
            method: "GET" as const,
            responseMapping: { dataPath: "posts", labelKey: "title", valueKey: "id" },
            searchParam: "q",
            pageParam: "skip",
            pageSizeParam: "limit",
            pageSize: 10,
            hasMorePath: "total",
            offsetBased: true,
          },
        },
      ],
    },
  ],
};

export const schema: ReactHookFormZodSchema = z.object({
  asyncUser: z.any().refine((v) => v !== undefined && v !== "", "User is required"),
  asyncPost: z.any().optional(),
  asyncAlbums: z.array(z.any()).optional(),
  asyncTodos: z.array(z.any()).optional(),
  infProduct: z.any().optional(),
  infRecipe: z.any().optional(),
  infUsers: z.array(z.any()).optional(),
  infPosts: z.array(z.any()).optional(),
});

export const configCode = JSON.stringify(formConfig, null, 2);
const schemaCode = `z.object({
  asyncUser: z.any().refine((v) => v !== undefined && v !== "", "User is required"),
  asyncPost: z.any().optional(),
  asyncAlbums: z.array(z.any()).optional(),
  asyncTodos: z.array(z.any()).optional(),
  infProduct: z.any().optional(),
  infRecipe: z.any().optional(),
  infUsers: z.array(z.any()).optional(),
  infPosts: z.array(z.any()).optional(),
});`;

export const exportedSchemaCode = `import { z } from "zod";

export const formSchema = ${schemaCode};

export type FormValues = z.infer<typeof formSchema>;
`;

export const data = {
  title: "Async & Infinite",
  description: "Async + infinite-scroll fields (JSONPlaceholder & DummyJSON).",
};
