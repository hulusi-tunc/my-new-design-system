import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CATEGORY_COOKIE,
  DEFAULT_CATEGORY,
  isValidCategory,
} from "@/lib/platforms";

export default async function CatalogIndexPage() {
  const cookieStore = await cookies();
  const saved = cookieStore.get(CATEGORY_COOKIE)?.value;
  const category = saved && isValidCategory(saved) ? saved : DEFAULT_CATEGORY;
  redirect(`/catalog/${category}`);
}
