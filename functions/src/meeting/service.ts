import { Inject, Service } from 'typedi';
import { MeetingRepo } from './repo';

class AddNewArgs {
  name: string;
  ownerId?: string;
}

@Service()
export class MeetingService {
  @Inject()
  private repo: MeetingRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew(newMeeting: AddNewArgs) {
    return this.repo.addNew(newMeeting);
  }
}
