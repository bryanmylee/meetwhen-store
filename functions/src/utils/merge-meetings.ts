import { recordById } from './record-by-id';
import { TimeOrder } from '../types/time-order';
import { Meeting, MeetingCollectionQueryArgs } from '../meeting/types';

type MergableMeeting = Pick<Meeting, 'id' | 'total'>;

export const getMergedMeetings = <T extends MergableMeeting>(
  a: T[],
  b: T[],
  { order, limit }: MeetingCollectionQueryArgs = {}
): T[] => {
  if (a.length === 0 || b.length === 0) {
    return [...a, ...b];
  }
  const merged = getDistinct(getMergeSorted(a, b, { order }));
  if (limit === undefined) {
    return merged;
  }
  return merged.slice(0, limit);
};

const getMergeSorted = <T extends MergableMeeting>(
  a: T[],
  b: T[],
  { order }: MeetingCollectionQueryArgs = {}
): T[] => {
  const compareFn = order === TimeOrder.EARLIEST ? compareEarliest : compareLatest;
  if (order === undefined) {
    return [...a, ...b];
  }
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

const compareEarliest = <T extends MergableMeeting>(a: T, b: T) => {
  if (a.total.beg === b.total.beg) {
    return a.total.end - b.total.end;
  }
  return a.total.beg - b.total.beg;
};

const compareLatest = <T extends MergableMeeting>(a: T, b: T) => compareEarliest(b, a);

const getDistinct = <T extends MergableMeeting>(meetings: T[]) =>
  Object.values(recordById(meetings));
