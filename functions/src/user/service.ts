import { Service } from 'typedi';
import { NewUserInput, User } from './types';

@Service()
export class UserService {
  async findById(id: string) {
    return {
      id,
      name: 'Bryan Lee',
    } as User;
  }

  async addNew({ data }: AddNewParams) {
    return {
      id: '0',
      name: 'New User',
    } as User;
  }
}

interface AddNewParams {
  data: NewUserInput;
}
