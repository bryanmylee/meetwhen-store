import { CookieOptions, Response } from 'express';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { env } from '../env';
import { MeetingService } from '../meeting/service';
import { Meeting } from '../meeting/types';
import { ScheduleService } from '../schedule/service';
import { Schedule } from '../schedule/types';
import { Principal } from '../security/context';
import { UserService } from './service';
import { User } from './types';

@InputType()
class AddUserInput implements Partial<User> {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
class EditUserInput implements Partial<User> {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
class LoginInput implements Partial<User> {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
class LoginGuestInput {
  @Field(() => ID)
  meetingId: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class UserWithToken extends User {
  @Field()
  token: string;
}

const PROD_COOKIE_OPTS: CookieOptions = {
  secure: true,
  sameSite: 'none',
};

@Service()
@Resolver(User)
export class UserResolver {
  @Inject()
  private userService: UserService;

  @Inject()
  private meetingService: MeetingService;

  @Inject()
  private scheduleService: ScheduleService;

  @Query(() => User)
  async user(@Arg('id', () => ID) id: string): Promise<User> {
    return (await this.userService.findById(id)) as User;
  }

  @Query(() => User)
  @Authorized()
  async me(@Ctx('principal') principal: Principal): Promise<User> {
    const email = principal!.email!;
    if (email.endsWith('.guest')) {
      const match = email.match(/@(\w+).guest$/);
      return {
        name: principal!.name,
        id: principal!.uid,
        email: principal!.email,
        guestOf: match![1],
      } as User;
    }
    return {
      name: principal!.name,
      id: principal!.uid,
      email: principal!.email,
      guestOf: null,
    } as User;
  }

  @FieldResolver()
  async meetings(@Root() user: User): Promise<Meeting[]> {
    return (await this.meetingService.findAllByOwnerId(user.id)) as Meeting[];
  }

  @FieldResolver()
  async schedules(@Root() user: User): Promise<Schedule[]> {
    return (await this.scheduleService.findAllWithUserId(user.id)) as Schedule[];
  }

  @Mutation(() => User)
  async addUser(@Arg('data') data: AddUserInput, @Ctx('res') res: Response): Promise<User> {
    await this.userService.addNew(data);
    return this.login(data, res);
  }

  @Mutation(() => User)
  @Authorized()
  async editUser(
    @Arg('data') data: EditUserInput,
    @Ctx('principal') principal: Principal
  ): Promise<User> {
    return (await this.userService.edit({ id: principal!.uid, ...data })) as User;
  }

  @Mutation(() => User)
  async login(@Arg('data') data: LoginInput, @Ctx('res') res: Response): Promise<User> {
    const user = await this.userService.login(data);
    const token = await user.getIdToken();
    res.setHeader('cache-control', 'private');
    res.cookie('__session', token, {
      httpOnly: true,
      ...(env.env === 'production' ? PROD_COOKIE_OPTS : {}),
    });
    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
    } as User;
  }

  @Mutation(() => UserWithToken)
  async loginGuest(@Arg('data') data: LoginGuestInput): Promise<UserWithToken> {
    const user = await this.userService.loginGuest(data);
    const token = await user.getIdToken();
    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      token,
    } as UserWithToken;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx('res') res: Response): Promise<boolean> {
    res.setHeader('cache-control', 'private');
    res.clearCookie('__session');
    return true;
  }
}
