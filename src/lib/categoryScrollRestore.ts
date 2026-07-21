/** Only restore category scroll when returning from a product page. */

const RESTORE_KEY = "kathys:restoreCategoryScroll";

const UI_ONLY_PARAMS = new Set(["filter"]);

export const categoryDataCacheKey = (
  id: string,
  searchParams: URLSearchParams
) => {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (!UI_ONLY_PARAMS.has(key)) params.set(key, value);
  });
  params.sort();
  return `${id}?${params.toString()}`;
};

/** Call when navigating from a category listing to a product. */
export function markCategoryScrollRestore(cacheKey: string) {
  try {
    sessionStorage.setItem(RESTORE_KEY, cacheKey);
  } catch {
    /* ignore */
  }
}

/** Peek without clearing — safe under React Strict Mode double-mount. */
export function shouldRestoreCategoryScroll(cacheKey: string): boolean {
  try {
    return sessionStorage.getItem(RESTORE_KEY) === cacheKey;
  } catch {
    return false;
  }
}

/** Clear when restore finishes, or when entering from home / categories. */
export function clearCategoryScrollRestore() {
  try {
    sessionStorage.removeItem(RESTORE_KEY);
  } catch {
    /* ignore */
  }
}
