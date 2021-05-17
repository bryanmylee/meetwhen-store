import { Length } from 'class-validator';
import { Response } from 'express';
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { AuthService } from '../auth/service';
import { User } from '../user/types';

@InputType()
class LoginArgs implements Partial<User> {
  @Field()
  email: string;

  @Field()
  @Length(6, 30)
  password: string;
}

@Service()
@Resolver()
export class AuthResolver {
  @Inject()
  private authService: AuthService;
  
  @Mutation((returns) => User)
  async login(@Arg('data') data: LoginArgs, @Ctx('res') res: Response) {
    try {
      const { idToken } = await this.authService.login(data);
      res.setHeader('cache-control', 'private');
      res.cookie('__session', idToken, {
        httpOnly: true,
      });
      res.send();
    } catch (error) {
      res.send(error);
    }
  }
}
