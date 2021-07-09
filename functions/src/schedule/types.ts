import { ArgsType, Field, Int, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { CollectionQueryArgs } from '../types/collection-query-args';
import { Identifiable } from '../types/identifiable';
import { Interval } from '../types/interval';
import { BegOrEnd } from '../types/beg-or-end';
import { TimeOrder } from '../types/time-order';
import { User } from '../user/types';

@ArgsType()
export class ScheduleCollectionQueryArgs extends CollectionQueryArgs {
  @Field(() => BegOrEnd, { nullable: true })
  key?: BegOrEnd;

  @Field(() => Int, { nullable: true })
  before?: number;

  @Field(() => Int, { nullable: true })
  after?: number;

  @Field(() => TimeOrder, { nullable: true })
  order?: TimeOrder;
}

@ObjectType()
export class Schedule extends Identifiable {
  @Field(() => Meeting)
  meeting: Meeting;
  meetingId: string;

  @Field(() => User)
  user: User;
  userId: string;

  @Field(() => [Interval])
  intervals: Interval[];

  @Field(() => Interval)
  total: Interval;
}

export class ScheduleEntry extends Identifiable {
  meetingId: string;
  userId: string;
  intervals: Interval[];
  total: Interval;
}
