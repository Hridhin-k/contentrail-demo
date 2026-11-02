import { defineCollection } from "@contentrail/core";
import { z } from "zod";

export const articles = defineCollection({
  name: "articles",
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    published: z.boolean(),
    summary: z.string().min(1),
    body: z.string().min(1),
  }),
});
