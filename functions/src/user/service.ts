import { Inject, Service } from 'typedi';
import { UserRepo } from './repo';
import { NewUserInput } from './types';

@Service()
export class UserService {
  @Inject()
  private repo: UserRepo;

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async addNew(newUser: NewUserInput) {
    return this.repo.addNew(newUser);
  }
}
