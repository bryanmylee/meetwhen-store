import {
  Args,
  ArgsType,
  Field,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { ScheduleService } from './service';
import { Schedule } from './types';

@ArgsType()
class GetScheduleArgs {
  @Field()
  meetingId: string;

  @Field()
  userId: string;
}

@Service()
@Resolver(Schedule)
export class ScheduleResolver implements ResolverInterface<Schedule> {
  @Inject()
  private scheduleService: ScheduleService;

  @Query((returns) => Schedule)
  async schedule(@Args() { meetingId, userId }: GetScheduleArgs) {
    return this.scheduleService.findByMeetingUser({ meetingId, userId });
  }

  @FieldResolver()
  intervals(@Root() { intervals }: Schedule) {
    return intervals;
  }
}
