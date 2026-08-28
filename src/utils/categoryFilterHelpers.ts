export type CategoryFilterNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: CategoryFilterNode[];
};

export type FlatCategoryOption = {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
};

/** Build a parent→children map from a flat category list. */
export function buildChildrenMap(
  categories: FlatCategoryOption[]
): Map<number, number[]> {
  const ids = new Set(categories.map((c) => c.id));
  const byParent = new Map<number, number[]>();

  for (const category of categories) {
    const parentId = category.parentId ?? null;
    if (parentId == null || !ids.has(parentId)) continue;
    const list = byParent.get(parentId) || [];
    list.push(category.id);
    byParent.set(parentId, list);
  }

  return byParent;
}

/** All descendant IDs of a category (not including itself). */
export function getDescendantIds(
  categoryId: number,
  byParent: Map<number, number[]>
): number[] {
  const children = byParent.get(categoryId) || [];
  const result: number[] = [];
  for (const childId of children) {
    result.push(childId, ...getDescendantIds(childId, byParent));
  }
  return result;
}

/** Expand selected IDs so each parent includes all descendants. */
export function expandCategorySelection(
  selectedIds: number[],
  categories: FlatCategoryOption[]
): number[] {
  if (!selectedIds.length) return [];
  const byParent = buildChildrenMap(categories);
  const next = new Set<number>();
  for (const id of selectedIds) {
    next.add(id);
    for (const descendantId of getDescendantIds(id, byParent)) {
      next.add(descendantId);
    }
  }
  return Array.from(next);
}

/**
 * Parent check → select parent + all children.
 * Child check → select only that child (never the parent).
 * Unchecking a child also clears any selected ancestors.
 */
export function toggleCategorySelection(
  categoryId: number,
  selectedIds: number[],
  categories: FlatCategoryOption[]
): number[] {
  const byParent = buildChildrenMap(categories);
  const descendants = getDescendantIds(categoryId, byParent);
  const selected = new Set(selectedIds);

  if (descendants.length > 0) {
    const parentChecked = selected.has(categoryId);
    if (parentChecked) {
      selected.delete(categoryId);
      for (const id of descendants) selected.delete(id);
    } else {
      selected.add(categoryId);
      for (const id of descendants) selected.add(id);
    }
    return Array.from(selected);
  }

  if (selected.has(categoryId)) {
    selected.delete(categoryId);
  } else {
    selected.add(categoryId);
  }

  // Clear ancestors so parent stays unchecked when only a child is chosen
  const byId = new Map(categories.map((c) => [c.id, c]));
  let parentId = byId.get(categoryId)?.parentId ?? null;
  while (parentId != null) {
    selected.delete(parentId);
    parentId = byId.get(parentId)?.parentId ?? null;
  }

  return Array.from(selected);
}

/**
 * On `/category/[slug]`, show only parent → current → direct children.
 */
export function buildFocusedCategoryTree(
  categories: FlatCategoryOption[],
  currentSlug: string
): CategoryFilterNode[] {
  const slug = currentSlug.trim().toLowerCase();
  if (!slug || !categories.length) return [];

  const current = categories.find(
    (category) => category.slug.trim().toLowerCase() === slug
  );
  if (!current) return [];

  const toNode = (
    category: FlatCategoryOption,
    children: CategoryFilterNode[] = []
  ): CategoryFilterNode => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId ?? null,
    children,
  });

  const childNodes = categories
    .filter((category) => category.parentId === current.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => toNode(category));

  const currentNode = toNode(current, childNodes);
  const parent =
    current.parentId != null
      ? categories.find((category) => category.id === current.parentId)
      : undefined;

  if (!parent) return [currentNode];
  return [toNode(parent, [currentNode])];
}

/** Nest flat categories for hierarchical filter rendering. */
export function buildCategoryTree(
  categories: FlatCategoryOption[]
): CategoryFilterNode[] {
  const ids = new Set(categories.map((c) => c.id));
  const nodes = new Map<number, CategoryFilterNode>();

  for (const category of categories) {
    nodes.set(category.id, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? null,
      children: [],
    });
  }

  const roots: CategoryFilterNode[] = [];

  for (const category of categories) {
    const node = nodes.get(category.id)!;
    const parentId = category.parentId ?? null;
    if (parentId != null && ids.has(parentId) && nodes.has(parentId)) {
      nodes.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (list: CategoryFilterNode[]) => {
    list.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of list) sortRecursive(item.children);
  };
  sortRecursive(roots);

  return roots;
}

/** Count topmost selected categories (parent+children counts as 1). */
export function countTopLevelCategorySelections(
  selectedIds: number[],
  categories: FlatCategoryOption[]
): number {
  if (!selectedIds.length) return 0;
  const selected = new Set(selectedIds);
  const byId = new Map(categories.map((c) => [c.id, c]));

  return selectedIds.filter((id) => {
    const parentId = byId.get(id)?.parentId ?? null;
    return parentId == null || !selected.has(parentId);
  }).length;
}

/** Top-level selected category slugs for URL (parent selected → only parent slug). */
export function categoryIdsToTopLevelSlugs(
  selectedIds: number[],
  categories: FlatCategoryOption[]
): string[] {
  if (!selectedIds.length) return [];
  const selected = new Set(selectedIds);
  const byId = new Map(categories.map((c) => [c.id, c]));

  return selectedIds
    .filter((id) => {
      const parentId = byId.get(id)?.parentId ?? null;
      return parentId == null || !selected.has(parentId);
    })
    .map((id) => byId.get(id)?.slug)
    .filter((slug): slug is string => Boolean(slug?.trim()))
    .map((slug) => slug.trim().toLowerCase());
}

/** Resolve category slugs to expanded IDs (parent slug → parent + descendants). */
export function categorySlugsToExpandedIds(
  slugs: string[],
  categories: FlatCategoryOption[]
): number[] {
  if (!slugs.length || !categories.length) return [];
  const bySlug = new Map(
    categories.map((c) => [c.slug.trim().toLowerCase(), c.id])
  );
  const ids = slugs
    .map((slug) => bySlug.get(slug.trim().toLowerCase()))
    .filter((id): id is number => id != null);
  return expandCategorySelection(ids, categories);
}
