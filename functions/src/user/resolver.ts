import { Response } from 'express';
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { MeetingService } from '../meeting/service';
import { Meeting, MeetingCollectionQueryArgs, MeetingEntry } from '../meeting/types';
import { ScheduleService } from '../schedule/service';
import { Schedule, ScheduleCollectionQueryArgs, ScheduleEntry } from '../schedule/types';
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
class AddGuestUserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  meetingId: string;
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
    return principal as User;
  }

  @FieldResolver(() => [Meeting])
  async meetings(
    @Root() user: User,
    @Args() args?: MeetingCollectionQueryArgs
  ): Promise<MeetingEntry[]> {
    return this.meetingService.findAllByOwnerId(user.id, args);
  }

  @FieldResolver(() => [Schedule])
  async schedules(
    @Root() user: User,
    @Args() args?: ScheduleCollectionQueryArgs
  ): Promise<ScheduleEntry[]> {
    return this.scheduleService.findAllByUserId(user.id, args);
  }

  @Mutation(() => User)
  async addUser(@Arg('data') data: AddUserInput, @Ctx('res') res: Response): Promise<User> {
    await this.userService.addNew(data);
    return this.login(data, res);
  }

  @Mutation(() => User)
  async addGuestUser(
    @Arg('data') data: AddGuestUserInput,
    @Ctx('res') res: Response
  ): Promise<User> {
    const user = await this.userService.addNewGuest(data);
    return this.login({ email: user.email, password: data.password }, res);
  }

  @Mutation(() => User)
  @Authorized()
  async editUser(
    @Arg('data') data: EditUserInput,
    @Ctx('principal') principal: Principal
  ): Promise<User> {
    return (await this.userService.edit({ id: principal!.id, ...data })) as User;
  }

  @Mutation(() => User)
  async login(@Arg('data') data: LoginInput, @Ctx('res') res: Response): Promise<User> {
    const { token, ...user } = await this.userService.login(data);
    res.setHeader('__token', token);
    return user as User;
  }

  @Mutation(() => User)
  async loginGuest(@Arg('data') data: LoginGuestInput, @Ctx('res') res: Response): Promise<User> {
    const { token, ...user } = await this.userService.loginGuest(data);
    res.setHeader('__token', token);
    return user as User;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx('res') res: Response): Promise<boolean> {
    return this.userService.logout(res);
  }
}
