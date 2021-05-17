import { Length } from 'class-validator';
import { Response } from 'express';
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { TokenService } from '../token/service';
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

  @Inject()
  private tokenService: TokenService;

  @Query((returns) => User)
  async user(@Arg('id') id: string) {
    return this.userService.findById(id);
  }

  @Mutation((returns) => User)
  async addUser(@Arg('data') data: AddUserArgs, @Ctx('res') res: Response) {
    const newUser = await this.userService.addNew(data);
    const token = this.tokenService.createAccessToken(newUser.id);
    res.setHeader('cache-control', 'private');
    res.cookie('__session', token, { httpOnly: true });
  }
}
