import type { Identifiable } from '../types/identifiable';

/**
 * Create a record of items from an array of items. If an item has an equal `id`
 * to an existing item, it will be discarded. This maintains insertion order.
 * @param items Items to store in the record. Each item must have an `id` field.
 * @returns A record of items keyed by their `id`.
 */
export const recordById = <T extends Identifiable>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((item) => [item.id, item]));
