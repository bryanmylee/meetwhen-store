import { HttpsError } from 'firebase-functions/lib/providers/https';
import { nanoid } from 'nanoid';
import { Inject, Service } from 'typedi';
import { IntervalInput } from '../types/interval';
import { MeetingRepo } from './repo';
import { MeetingCollectionQueryArgs, MeetingEntry } from './types';

const MAX_ATTEMPTS = 5;

class AddNewArgs {
  name: string;
  emoji?: string;
  ownerId?: string;
  intervals: IntervalInput[];
}

class EditArgs {
  name?: string;
  emoji?: string;
}

@Service()
export class MeetingService {
  @Inject()
  private repo: MeetingRepo;

  async findById(id: string): Promise<MeetingEntry> {
    return this.repo.findById(id);
  }

  async populate(ids: string[]): Promise<MeetingEntry[]> {
    return this.repo.populate(ids);
  }

  async findBySlug(slug: string): Promise<MeetingEntry> {
    return this.repo.findBySlug(slug);
  }

  async findAllByOwnerId(
    ownerId: string,
    args?: MeetingCollectionQueryArgs
  ): Promise<MeetingEntry[]> {
    return this.repo.findAllByOwnerId(ownerId, args);
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
    throw new HttpsError('internal', 'could not generate new slug', {
      id: 'slug-failure',
    });
  }

  async addNew(newMeeting: AddNewArgs): Promise<MeetingEntry> {
    return this.repo.addNew({
      ...newMeeting,
      emoji: newMeeting.emoji ?? '📘',
      slug: await this.generateSlug(),
    });
  }

  async edit(id: string, editArgs: EditArgs): Promise<MeetingEntry> {
    return this.repo.edit(id, editArgs);
  }
}
