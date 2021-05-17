import { Length } from 'class-validator';
import { Response } from 'express';
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
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

@InputType()
class LoginArgs implements Partial<User> {
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
  async addUser(@Arg('data') data: AddUserArgs, @Ctx('res') res: Response) {
    await this.userService.addNew(data);
    return this.login(data, res);
  }

  @Mutation((returns) => User)
  async login(@Arg('data') data: LoginArgs, @Ctx('res') res: Response) {
    const user = await this.userService.login(data);
    const token = await user.getIdToken();
    res.setHeader('cache-control', 'private');
    res.cookie('__session', token, { httpOnly: true });
    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
    } as User;
  }
}
