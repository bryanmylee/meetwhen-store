import { Length } from 'class-validator';
import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { UserService } from './service';
import { User } from './types';

@InputType()
class AddUserArgs implements Partial<User> {
  @Field()
  @Length(3, 30)
  name: string;

  @Field()
  email: string;

  @Field()
  @Length(6, 30)
  password: string;
}

@Service()
@Resolver(User)
export class UserResolver {
  @Inject()
  private userService: UserService;

  @Query((returns) => User)
  async user(@Arg('id') id: string) {
    return this.userService.findById(id);
  }

  @Mutation((returns) => User)
  async addUser(@Arg('data') data: AddUserArgs) {
    return this.userService.addNew(data);
  }
}
