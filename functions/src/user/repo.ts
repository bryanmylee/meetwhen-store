import { Repo } from '../firebase/repo';
import { Service } from 'typedi';
import { UserShallow } from './types';
import { firebaseAdmin } from '../firebase/setup';
import { getGuestEmail } from './service';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

class AddNewGuestArgs {
  meetingId: string;
  username: string;
  password: string;
}

class EditArgs {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

@Service()
export class UserRepo extends Repo<UserShallow> {
  constructor() {
    super('no-pass-user');
  }

  async findById(id: string): Promise<UserShallow> {
    const record = await firebaseAdmin.auth().getUser(id);
    return {
      id: record.uid,
      email: record.email!,
      name: record.displayName!,
      guestOf: record.customClaims?.guestOf,
      hasPassword: true,
    };
  }

  async addNew({ name, email, password }: AddNewArgs): Promise<UserShallow> {
    const record = await firebaseAdmin.auth().createUser({
      displayName: name,
      email,
      password: password,
    });
    firebaseAdmin.auth().setCustomUserClaims(record.uid, {
      guestOf: null,
    });
    return {
      id: record.uid,
      email,
      name,
      guestOf: null,
      hasPassword: true,
    };
  }

  async addNewGuest({ username, password, meetingId }: AddNewGuestArgs): Promise<UserShallow> {
    const record = await firebaseAdmin.auth().createUser({
      displayName: username,
      email: getGuestEmail(meetingId, username),
      password: password,
    });
    firebaseAdmin.auth().setCustomUserClaims(record.uid, {
      guestOf: meetingId,
    });
    return {
      id: record.uid,
      email: record.email!,
      name: username,
      guestOf: meetingId,
      hasPassword: true,
    };
  }

  async edit({ id, email, name, password }: EditArgs): Promise<UserShallow> {
    const record = await firebaseAdmin.auth().updateUser(id, {
      email: email,
      displayName: name,
      password: password,
    });
    return {
      id: record.uid,
      email: record.email!,
      name: record.displayName!,
      guestOf: record.customClaims?.guestOf,
      hasPassword: true,
    };
  }

  async deleteById(id: string): Promise<void> {
    await firebaseAdmin.auth().deleteUser(id);
  }
}
