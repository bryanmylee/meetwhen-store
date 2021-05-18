import { Length } from 'class-validator';
import { Response } from 'express';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
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
  @Length(3, 30)
  name: string;

  @Field()
  email: string;

  @Field()
  @Length(6, 30)
  password: string;
}

@InputType()
class LoginInput implements Partial<User> {
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
  private meetingService: MeetingService;

  @Inject()
  private scheduleService: ScheduleService;

  @Query(() => User)
  async user(@Arg('id') id: string): Promise<User> {
    return (await this.userService.findById(id)) as User;
  }

  @Query(() => User)
  @Authorized()
  async me(@Ctx('principal') principal: Principal): Promise<User> {
    return {
      name: principal!.name,
      id: principal!.uid,
      email: principal!.email,
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
  async login(@Arg('data') data: LoginInput, @Ctx('res') res: Response): Promise<User> {
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

  @Mutation(() => Boolean)
  async logout(@Ctx('res') res: Response): Promise<boolean> {
    res.setHeader('cache-control', 'private');
    res.clearCookie('__session');
    return true;
  }
}
