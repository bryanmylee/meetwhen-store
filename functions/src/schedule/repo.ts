import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { ScheduleEntry } from './types';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

@Service()
export class ScheduleRepo extends Repo<ScheduleEntry> {
  constructor() {
    super('schedule');
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
    }
    if (results.docs.length === 0) {
      throw new HttpsError(
        'not-found',
        `schedule(meetingId=${meetingId}, userId=${userId}) not found`
      );
    }
    const doc = results.docs[0];
    return { ...doc.data(), id: doc.id } as ScheduleEntry;
  }
}
