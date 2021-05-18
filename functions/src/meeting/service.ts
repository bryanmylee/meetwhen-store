import { HttpsError } from 'firebase-functions/lib/providers/https';
import { nanoid } from 'nanoid';
import { Inject, Service } from 'typedi';
import { MeetingRepo } from './repo';

const MAX_ATTEMPTS = 5;

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

  async findBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }

  private async generateSlug() {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const slug = nanoid(12); // ~1000 years before 1% collision at 1000 events per hour
      try {
        await this.findBySlug(slug);
      } catch (error) {
        if ((error as HttpsError).code === 'not-found') {
          return slug;
        }
      }
    }
    throw new HttpsError('internal', 'could not generate new slug');
  }

  async addNew(newMeeting: AddNewArgs) {
    return this.repo.addNew({ ...newMeeting, slug: await this.generateSlug() });
  }

  async edit(id: string, editArgs: EditArgs) {
    return this.repo.edit(id, editArgs);
  }
}
