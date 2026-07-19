"use client";

import CategoryClient from "./_components/CategoryClient";

// Client-driven category page. CategoryProvider (inside CategoryClient) fetches
// products via the client Firebase SDK — avoids slow Admin facet queries on
// first load.
export default function CategoryPage() {
  return <CategoryClient />;
}
