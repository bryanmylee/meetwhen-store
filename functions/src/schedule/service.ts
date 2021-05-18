import { Inject, Service } from 'typedi';
import { MeetingService } from '../meeting/service';
import { ScheduleRepo } from './repo';
import { Interval, ScheduleEntry } from './types';

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

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs): Promise<ScheduleEntry> {
    return this.scheduleRepo.findByMeetingUser({ meetingId, userId });
  }

  async findAllWithMeetingId(meetingId: string): Promise<ScheduleEntry[]> {
    return this.scheduleRepo.findAllWithMeetingId(meetingId);
  }

  async findAllWithUserId(userId: string): Promise<ScheduleEntry[]> {
    return this.scheduleRepo.findAllWithUserId(userId);
  }

  async joinMeeting({ meetingId, userId, intervals }: JoinMeetingArgs): Promise<ScheduleEntry> {
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }
}
