import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Inject, Service } from 'typedi';
import { PasswordService } from '../password/service';
import { UserRepo } from './repo';
import { UserEntry } from './types';

class AddNewArgs {
  name: string;
  email: string;
  password: string;
}

class LoginArgs {
  email: string;
  password: string;
}

@Service()
export class UserService {
  @Inject()
  private repo: UserRepo;

  @Inject()
  private passwordService: PasswordService;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew({ name, email, password }: AddNewArgs) {
    if (await this.repo.exists({ email })) {
      throw new HttpsError('already-exists', `user(email=${email} already exists)`);
    }
    const newHash = await this.passwordService.generateHash(password);
    const { hash, ...user } = await this.repo.addNew({ name, email, hash: newHash });
    return user as Omit<UserEntry, 'hash'>;
  }

  async login({ email, password }: LoginArgs) {
    const { hash, ...user } = await this.repo.findByEmail(email);
    if (!(await this.passwordService.verifyPassword(password, hash))) {
      throw new HttpsError('invalid-argument', `invalid password`);
    }
    return user as Omit<UserEntry, 'hash'>;
  }
}
