import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Inject, Service } from 'typedi';
import { PasswordService } from '../password/service';
import { UserRepo } from './repo';

class AddNewArgs {
  name: string;
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
    const hash = await this.passwordService.generateHash(password);
    return this.repo.addNew({ name, email, hash });
  }
}
