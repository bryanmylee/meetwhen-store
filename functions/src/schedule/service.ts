import { Inject, Service } from 'typedi';
import { MeetingService } from '../meeting/service';
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

  @Inject()
  private meetingService: MeetingService;

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs) {
    return this.scheduleRepo.findByMeetingUser({ meetingId, userId });
  }

  async findAllWithMeetingId(meetingId: string) {
    return this.scheduleRepo.findAllWithMeetingId(meetingId);
  }

  async findAllWithUserId(userId: string) {
    return this.scheduleRepo.findAllWithUserId(userId);
  }

  async joinMeeting({ meetingId, userId, intervals }: JoinMeetingArgs) {
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }
}
