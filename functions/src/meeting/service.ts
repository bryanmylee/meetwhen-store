import { nanoid } from 'nanoid';
import { Inject, Service } from 'typedi';
import { MeetingRepo } from './repo';

class AddNewArgs {
  name: string;
  ownerId?: string;
}

class EditArgs {
  name?: string;
}

@Service()
export class MeetingService {
  @Inject()
  private repo: MeetingRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew(newMeeting: AddNewArgs) {
    return this.repo.addNew({
      ...newMeeting,
      slug: nanoid(12), // ~1000 years before 1% collision at 1000 events per hour
    });
  }
  
  async edit(id: string, editArgs: EditArgs) {
    return this.repo.edit(id, editArgs);
  }
}
