import { Inject, Service } from 'typedi';
import { MeetingRepo } from './repo';
import { NewMeetingInput } from './types';

@Service()
export class MeetingService {
  @Inject()
  private repo: MeetingRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew(newMeeting: NewMeetingInput) {
    return this.repo.addNew(newMeeting);
  }
}
