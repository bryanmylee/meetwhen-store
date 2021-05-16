import { Inject, Service } from 'typedi';
import { UserRepo } from './repo';

class AddNewArgs {
  name: string;
}

@Service()
export class UserService {
  @Inject()
  private repo: UserRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew(newUser: AddNewArgs) {
    return this.repo.addNew(newUser);
  }
}
