import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { database, Repo } from '../database';
import { ScheduleEntry } from './types';

@Service()
export class ScheduleRepo extends Repo<ScheduleEntry> {
  constructor() {
    super(database.collection('schedule'));
  }

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs) {
    const results = await this.repo
      .where('meetingId', '==', meetingId)
      .where('userId', '==', userId)
      .get();
    if (results.docs.length > 1) {
      throw new HttpsError(
        'internal',
        `schedule(meetingId=${meetingId}, userId=${userId}) not unique`
      );
    } else if (results.docs.length === 0) {
      throw new HttpsError(
        'not-found',
        `schedule(meetingId=${meetingId}, userId=${userId}) not found`
      );
    }
    const doc = results.docs[0];
    return { ...doc.data(), id: doc.id };
  }
}

export class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}
