import { Inject, Service } from 'typedi';
import { auth } from '../firebase/firebase';
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

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew({ name, email, password }: AddNewArgs) {
    const { id } = await this.repo.addNew({ name });
    auth.createUser({
      uid: id,
      displayName: name,
      email,
      password,
    });
  }
}
