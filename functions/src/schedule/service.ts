import { Inject, Service } from 'typedi';
import { MeetingService } from '../meeting/service';
import { IntervalInput } from '../types/interval';
import { UserService } from '../user/service';
import { ScheduleRepo } from './repo';
import { ScheduleEntry } from './types';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

class AddScheduleArgs {
  meetingId: string;
  userId: string;
  intervals: IntervalInput[];
}

class AddGuestScheduleArgs {
  meetingId: string;
  intervals: IntervalInput[];
  username: string;
  password: string;
}

@Service()
export class ScheduleService {
  @Inject()
  private scheduleRepo: ScheduleRepo;

  @Inject()
  private meetingService: MeetingService;

  @Inject()
  private userService: UserService;

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs): Promise<ScheduleEntry> {
    return this.scheduleRepo.findByMeetingUser({ meetingId, userId });
  }

  async findAllWithMeetingId(meetingId: string): Promise<ScheduleEntry[]> {
    return this.scheduleRepo.findAllWithMeetingId(meetingId);
  }

  async findAllWithUserId(userId: string): Promise<ScheduleEntry[]> {
    return this.scheduleRepo.findAllWithUserId(userId);
  }

  async addSchedule({ meetingId, userId, intervals }: AddScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }

  async addGuestSchedule({
    meetingId,
    intervals,
    username,
    password,
  }: AddGuestScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    const guestUser = await this.userService.addNewGuest({
      username,
      password,
      meetingId,
    });
    return this.scheduleRepo.addSchedule({ meetingId, userId: guestUser.id, intervals });
  }
}
