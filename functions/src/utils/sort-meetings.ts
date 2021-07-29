import { BegOrEnd, getKeyPaths } from '../types/beg-or-end';
import { TimeOrder } from '../types/time-order';
import { Meeting, MeetingCollectionQueryArgs, MeetingEntry } from '../meeting/types';

export type MergableMeeting = Pick<Meeting, 'id' | 'total'>;

export const sortMeetings = <T extends MeetingEntry>(
  meetings: T[],
  { order, key }: MeetingCollectionQueryArgs = {}
): void => {
  if (order === undefined) {
    return;
  }
  meetings.sort(getCompareFn({ order, key }));
};

export const getCompareFn = <T extends MergableMeeting>({
  order,
  key = BegOrEnd.BEG,
}: MeetingCollectionQueryArgs = {}): ((a: T, b: T) => number) => {
  if (order === TimeOrder.EARLIEST) {
    return (a: T, b: T) => compareWithKey(a, b, key);
  }
  return (a: T, b: T) => compareWithKey(b, a, key);
};

const compareWithKey = <T extends MergableMeeting>(a: T, b: T, key: BegOrEnd) => {
  const { primaryKey, altKey } = getKeyPaths(key);
  if (a.total[primaryKey] === b.total[primaryKey]) {
    return a.total[altKey] - b.total[altKey];
  }
  return a.total[primaryKey] - b.total[primaryKey];
};
