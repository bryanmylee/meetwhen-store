import { Inject, Service } from 'typedi';
import { ScheduleRepo } from './repo';

class FindByMeetingUserArgs {
  meetingId: string;
  userId: string;
}

@Service()
export class ScheduleService {
  @Inject()
  private scheduleRepo: ScheduleRepo;

  async findByMeetingUser({ meetingId, userId }: FindByMeetingUserArgs) {
    return this.scheduleRepo.findByMeetingUser({ meetingId, userId });
  }
}
