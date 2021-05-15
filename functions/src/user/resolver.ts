import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { UserService } from './service';
import { NewUserInput, User } from './types';

@Service()
@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => User)
  async user(@Arg('id') id: string) {
    return this.userService.findById(id);
  }

  @Mutation((returns) => User)
  async addUser(@Arg('data') data: NewUserInput) {
    return this.userService.addNew({ data });
  }
}
