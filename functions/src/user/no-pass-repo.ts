import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Service } from 'typedi';
import { Repo } from '../firebase/repo';
import { getGuestEmail } from './service';
import { UserShallow } from './types';

class AddNewArgs {
  meetingId: string;
  username: string;
}

interface DocData {
  guestOf: string;
  name: string;
}

@Service()
export class NoPassUserRepo extends Repo<UserShallow> {
  constructor() {
    super('no-pass-user');
  }

  async findById(id: string): Promise<UserShallow> {
    const { guestOf, name } = await super.findById(id);
    return {
      id,
      name,
      email: getGuestEmail(guestOf!, name),
      guestOf,
      hasPassword: false,
    };
  }

  async meetingIdUsernameExists(meetingId: string, username: string): Promise<boolean> {
    const results = await this.repo
      .where('guestOf', '==', meetingId)
      .where('name', '==', username)
      .get();
    return results.docs.length > 0;
  }

  async findByMeetingIdUsername(meetingId: string, username: string): Promise<UserShallow> {
    const results = await this.repo
      .where('guestOf', '==', meetingId)
      .where('name', '==', username)
      .get();
    if (results.docs.length > 1) {
      throw new HttpsError(
        'internal',
        `no-pass-user(meetingId=${meetingId}, username=${username}) not unique`,
        {
          id: 'not-unique',
        }
      );
    }
    if (results.docs.length === 0) {
      throw new HttpsError(
        'not-found',
        `no-pass-user(meetingId=${meetingId},username=${username}) not found`,
        {
          id: 'not-found',
        }
      );
    }
    const doc = results.docs[0];
    const { name, guestOf } = doc.data() as DocData;
    return {
      id: doc.id,
      email: getGuestEmail(guestOf, name),
      guestOf,
      name,
      hasPassword: false,
    } as UserShallow;
  }

  async addNewGuest({ meetingId, username }: AddNewArgs): Promise<UserShallow> {
    if (await this.meetingIdUsernameExists(meetingId, username)) {
      throw new HttpsError(
        'already-exists',
        `no-pass-user(meetingId=${meetingId},username=${username}) already exists`,
        {
          id: 'already-exists',
        }
      );
    }
    const newRef = this.repo.doc();
    const entry: DocData = {
      name: username,
      guestOf: meetingId,
    };
    await newRef.set(entry);
    return {
      id: newRef.id,
      name: username,
      guestOf: meetingId,
      email: getGuestEmail(meetingId, username),
      hasPassword: false,
    } as UserShallow;
  }
}
