import { database, Repo } from '../database';
import { Service } from 'typedi';
import { Meeting, NewMeetingInput } from './types';

@Service()
export class MeetingRepo extends Repo<Meeting> {
  constructor() {
    super(database.collection('meeting'));
  }

  async addNew(newMeeting: NewMeetingInput) {
    const newRef = this.repo.doc();
    await newRef.set({ ...newMeeting });
    return { ...newMeeting, id: newRef.id } as Meeting;
  }
}
