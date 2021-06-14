import { Inject, Service } from 'typedi';
import { MeetingService } from '../meeting/service';
import { Meeting } from '../meeting/types';
import { IntervalInput } from '../types/interval';
import { UserService } from '../user/service';
import { UserShallow } from '../user/types';
import { ScheduleRepo } from './repo';
import { ScheduleEntry } from './types';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

class ScheduleArgs {
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

interface AddGuestScheduleReturned {
  user: UserShallow;
  meeting: Omit<Meeting, 'schedules'>;
  scheduleEntry: ScheduleEntry;
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

  async addSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }

  async addGuestSchedule({
    meetingId,
    intervals,
    username,
    password,
  }: AddGuestScheduleArgs): Promise<AddGuestScheduleReturned> {
    // check if meeting exists
    const meeting = await this.meetingService.findById(meetingId);
    const guestUser = await this.userService.addNewGuest({
      username,
      password,
      meetingId,
    });
    const scheduleEntry = await this.scheduleRepo.addSchedule({
      meetingId,
      userId: guestUser.id,
      intervals,
    });
    return {
      user: guestUser,
      meeting,
      scheduleEntry,
    };
  }

  async editSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.editSchedule({ meetingId, userId, intervals });
  }
}
