import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { getTotalInterval, IntervalInput } from '../types/interval';
import { getKeyPaths } from '../types/beg-or-end';
import { TimeOrder } from '../types/time-order';
import { MeetingCollectionQueryArgs, MeetingEntry } from './types';

class AddNewArgs {
  name: string;
  emoji: string;
  slug: string;
  ownerId?: string;
  intervals: IntervalInput[];
}

class EditArgs {
  name?: string;
  emoji?: string;
}

@Service()
export class MeetingRepo extends Repo<MeetingEntry> {
  constructor() {
    super('meeting');
  }

  async findBySlug(slug: string): Promise<MeetingEntry> {
    const results = await this.repo.where('slug', '==', slug).get();
    if (results.docs.length > 1) {
      throw new HttpsError('internal', `meeting(slug=${slug}) not unique`, {
        id: 'not-unique',
      });
    }
    if (results.docs.length === 0) {
      throw new HttpsError('not-found', `meeting(slug=${slug}) not found`, {
        id: 'not-found',
      });
    }
    const doc = results.docs[0];
    return { ...doc.data(), id: doc.id } as MeetingEntry;
  }

  async findAllByOwnerId(
    ownerId: string,
    { key, before, after, order, limit }: MeetingCollectionQueryArgs = {}
  ): Promise<MeetingEntry[]> {
    let query = this.repo.where('ownerId', '==', ownerId);
    const { primaryKey, altKey } = getKeyPaths(key);
    if (before !== undefined) {
      query = query.where('total.' + primaryKey, '<=', before);
    }
    if (after !== undefined) {
      query = query.where('total.' + primaryKey, '>=', after);
    }
    if (order === TimeOrder.EARLIEST) {
      query = query.orderBy('total.' + primaryKey, 'asc').orderBy('total.' + altKey, 'asc');
    } else if (order === TimeOrder.LATEST) {
      query = query.orderBy('total.' + primaryKey, 'desc').orderBy('total.' + altKey, 'desc');
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    const results = await query.get();
    return results.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as MeetingEntry[];
  }

  async addNew(newMeeting: AddNewArgs): Promise<MeetingEntry> {
    const newRef = this.repo.doc();
    const entry: Omit<MeetingEntry, 'id'> = {
      ...newMeeting,
      intervals: newMeeting.intervals.map(({ beg, end }) => ({ beg, end })),
      total: getTotalInterval(newMeeting.intervals),
    };
    await newRef.set(entry);
    return { ...newMeeting, id: newRef.id } as MeetingEntry;
  }

  async edit(id: string, editArgs: EditArgs): Promise<MeetingEntry> {
    await this.repo.doc(id).set({ ...editArgs }, { merge: true });
    return this.findById(id);
  }
}
