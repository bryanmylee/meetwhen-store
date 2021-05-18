import { Inject, Service } from 'typedi';
import { ScheduleRepo } from './repo';
import { Interval } from './types';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

class JoinMeetingArgs {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}

@Service()
export class ScheduleService {
  @Inject()
  private scheduleRepo: ScheduleRepo;

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs) {
    return this.scheduleRepo.findByMeetingUser({ meetingId, userId });
  }

  async findAllWithMeetingId(meetingId: string) {
    return this.scheduleRepo.findAllWithMeetingId(meetingId);
  }

  async joinMeeting({ meetingId, userId, intervals }: JoinMeetingArgs) {
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }
}
