import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { MeetingEntry } from './types';

class AddNewArgs {
  name: string;
  slug: string;
  ownerId?: string;
}

class EditArgs {
  name?: string;
}


@Service()
export class MeetingRepo extends Repo<MeetingEntry> {
  constructor() {
    super('meeting');
  }

  async addNew(newMeeting: AddNewArgs) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newMeeting });
    return { ...newMeeting, id: newRef.id } as MeetingEntry;
  }
  
  async edit(id: string, editArgs: EditArgs) {
    await this.repo.doc(id).set({ ...editArgs }, { merge: true });
    return this.findById(id);
  }
}
