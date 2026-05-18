import { useCallback, useEffect, useState } from "react";
import { bulkImport, clearCollection, deleteItem, getAllItems, saveItem } from "../db";
import type { CollectionItem } from "../types";

export function useCollection() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setItems(await getAllItems());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    loading,
    refresh,
    save: async (item: CollectionItem) => {
      await saveItem(item);
      await refresh();
    },
    remove: async (id: string) => {
      await deleteItem(id);
      await refresh();
    },
    replaceAll: async (nextItems: CollectionItem[]) => {
      await clearCollection();
      await bulkImport(nextItems);
      await refresh();
    }
  };
}
