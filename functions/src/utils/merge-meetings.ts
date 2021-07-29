import { MeetingCollectionQueryArgs } from '../meeting/types';
import { recordById } from './record-by-id';
import { getCompareFn, MergableMeeting } from './sort-meetings';

export const getMergedMeetings = <T extends MergableMeeting>(
  a: T[],
  b: T[],
  { order, limit, key }: MeetingCollectionQueryArgs = {}
): T[] => {
  if (a.length === 0 || b.length === 0) {
    return [...a, ...b];
  }
  const mergeSorted = getMergeSorted(a, b, { order, key });
  const distinctMerged = getDistinct(mergeSorted);
  if (limit === undefined) {
    return distinctMerged;
  }
  return distinctMerged.slice(0, limit);
};

const getMergeSorted = <T extends MergableMeeting>(
  a: T[],
  b: T[],
  { order, key }: MeetingCollectionQueryArgs = {}
): T[] => {
  if (order === undefined) {
    return [...a, ...b];
  }
  const compareFn = getCompareFn({ order, key });
  const result: T[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (compareFn(a[i], b[j]) <= 0) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }
  while (i < a.length) {
    result.push(a[i++]);
  }
  while (j < b.length) {
    result.push(b[j++]);
  }
  return result;
};

const getDistinct = <T extends MergableMeeting>(meetings: T[]) =>
  Object.values(recordById(meetings));
