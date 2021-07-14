import { HttpsError } from 'firebase-functions/lib/providers/https';
import { customAlphabet } from 'nanoid';
import { Inject, Service } from 'typedi';
import { IntervalInput } from '../types/interval';
import { MeetingRepo } from './repo';
import { MeetingCollectionQueryArgs, MeetingEntry } from './types';

// ~919 years before 1% collision at 1000 events per hour
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);
const MAX_SLUG_ATTEMPTS = 5;

class AddNewArgs {
  name: string;
  emoji?: string;
  color?: string;
  ownerId?: string;
  intervals: IntervalInput[];
}

class EditArgs {
  name?: string;
  emoji?: string;
  color?: string;
}

const DEFAULT_EMOJI = '📘';
const DEFAULT_COLOR = '#0aadff';

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
    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
      const slug = nanoid();
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
      emoji: newMeeting.emoji ?? DEFAULT_EMOJI,
      color: newMeeting.color ?? DEFAULT_COLOR,
      slug: await this.generateSlug(),
    });
  }

  async edit(id: string, editArgs: EditArgs): Promise<MeetingEntry> {
    return this.repo.edit(id, editArgs);
  }
}
