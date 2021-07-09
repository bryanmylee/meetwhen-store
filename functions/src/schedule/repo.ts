import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { getTotalInterval, Interval } from '../types/interval';
import { TimeOrder } from '../types/time-order';
import { ScheduleCollectionQueryArgs, ScheduleEntry } from './types';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

class ScheduleArgs {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}

class DeleteScheduleArgs {
  meetingId: string;
  userId: string;
}

@Service()
export class ScheduleRepo extends Repo<ScheduleEntry> {
  constructor() {
    super('schedule');
  }

  private async findDocByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs) {
    const results = await this.repo
      .where('meetingId', '==', meetingId)
      .where('userId', '==', userId)
      .get();
    if (results.docs.length > 1) {
      throw new HttpsError(
        'internal',
        `schedule(meetingId=${meetingId}, userId=${userId}) not unique`,
        { id: 'not-unique' }
      );
    }
    if (results.docs.length === 0) {
      throw new HttpsError(
        'not-found',
        `schedule(meetingId=${meetingId}, userId=${userId}) not found`,
        { id: 'not-found' }
      );
    }
    return results.docs[0];
  }

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs): Promise<ScheduleEntry> {
    const doc = await this.findDocByMeetingUser({ meetingId, userId });
    return { ...doc.data(), id: doc.id } as ScheduleEntry;
  }

  async findAllByMeetingId(
    meetingId: string,
    { order, limit }: ScheduleCollectionQueryArgs = {}
  ): Promise<ScheduleEntry[]> {
    let query = this.repo.where('meetingId', '==', meetingId);
    if (order === TimeOrder.EARLIEST) {
      query = query.orderBy('total.beg', 'asc').orderBy('total.end', 'asc');
    } else if (order === TimeOrder.LATEST) {
      query = query.orderBy('total.end', 'desc').orderBy('total.beg', 'desc');
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    const results = await query.get();
    return results.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ScheduleEntry));
  }

  async findAllByUserId(
    userId: string,
    { order, limit }: ScheduleCollectionQueryArgs = {}
  ): Promise<ScheduleEntry[]> {
    let query = this.repo.where('userId', '==', userId);
    if (order === TimeOrder.EARLIEST) {
      query = query.orderBy('total.beg', 'asc').orderBy('total.end', 'asc');
    } else if (order === TimeOrder.LATEST) {
      query = query.orderBy('total.end', 'desc').orderBy('total.beg', 'desc');
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    const results = await query.get();
    return results.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ScheduleEntry));
  }

  async addSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    const results = await this.repo
      .where('meetingId', '==', meetingId)
      .where('userId', '==', userId)
      .get();
    if (results.docs.length >= 1) {
      throw new HttpsError('already-exists', `schedule(meetingId=${meetingId}) already joined`, {
        id: 'already-exists',
      });
    }
    const newRef = await this.repo.add({
      meetingId,
      userId,
      intervals: intervals.map(({ beg, end }) => ({ beg, end })),
      total: getTotalInterval(intervals),
    });
    return { meetingId, userId, intervals, id: newRef.id } as ScheduleEntry;
  }

  async editSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    const results = await this.repo
      .where('meetingId', '==', meetingId)
      .where('userId', '==', userId)
      .get();
    if (results.docs.length > 1) {
      throw new HttpsError('internal', `schedule(meetingId=${meetingId}) not unique`, {
        id: 'not-unique',
      });
    }
    if (results.docs.length === 0) {
      throw new HttpsError('not-found', `schedule(meetingId=${meetingId}) not found`, {
        id: 'not-found',
      });
    }
    const { ref } = results.docs[0];
    await ref.set(
      {
        intervals: intervals.map(({ beg, end }) => ({ beg, end })),
        total: getTotalInterval(intervals),
      },
      { merge: true }
    );
    return { meetingId, userId, intervals, id: ref.id } as ScheduleEntry;
  }

  async deleteSchedule({ meetingId, userId }: DeleteScheduleArgs): Promise<boolean> {
    const doc = await this.findDocByMeetingUser({ meetingId, userId });
    await doc.ref.delete();
    return true;
  }
}
