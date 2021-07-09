import { Response } from 'express';
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

class ScheduleArgs {
  meetingId: string;
  userId: string;
  intervals: IntervalInput[];
}

class DeleteScheduleArgs {
  meetingId: string;
  userId: string;
  response: Response;
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
    return this.scheduleRepo.findAllByMeetingId(meetingId);
  }

  async findAllWithUserId(userId: string): Promise<ScheduleEntry[]> {
    return this.scheduleRepo.findAllByUserId(userId);
  }

  async addSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.addSchedule({ meetingId, userId, intervals });
  }

  async editSchedule({ meetingId, userId, intervals }: ScheduleArgs): Promise<ScheduleEntry> {
    // check if meeting exists
    await this.meetingService.findById(meetingId);
    return this.scheduleRepo.editSchedule({ meetingId, userId, intervals });
  }

  async deleteSchedule({ meetingId, userId, response }: DeleteScheduleArgs): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (user.guestOf !== null) {
      await this.userService.deleteById(user.id, response);
    }
    return this.scheduleRepo.deleteSchedule({ meetingId, userId });
  }
}
