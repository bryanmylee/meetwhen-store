import { Length } from 'class-validator';
import { Inject, Service } from 'typedi';
import { UserRepo } from './repo';

class AddNewArgs {
  @Length(1, 30)
  name: string;
  
  @Length(4, 30)
  password: string;
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
