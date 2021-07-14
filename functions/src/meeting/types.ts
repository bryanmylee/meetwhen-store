import { ArgsType, Field, Int, ObjectType } from 'type-graphql';
import { Schedule, ScheduleEntry } from '../schedule/types';
import { BegOrEnd } from '../types/beg-or-end';
import { CollectionQueryArgs } from '../types/collection-query-args';
import { Identifiable } from '../types/identifiable';
import { Interval } from '../types/interval';
import { TimeOrder } from '../types/time-order';
import { User, UserShallow } from '../user/types';

@ArgsType()
export class MeetingCollectionQueryArgs extends CollectionQueryArgs {
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
export class Meeting extends Identifiable {
  @Field()
  name: string;

  @Field()
  emoji: string;

  @Field()
  color: string;

  @Field()
  slug: string;

  @Field(() => User, { nullable: true })
  owner?: UserShallow;
  ownerId?: string;

  @Field(() => [Interval])
  intervals: Interval[];

  @Field(() => Interval)
  total: Interval;

  @Field(() => [Schedule])
  schedules: ScheduleEntry[];
}

export class MeetingEntry extends Identifiable {
  name: string;
  emoji: string;
  color: string;
  slug: string;
  ownerId?: string;
  intervals: Interval[];
  total: Interval;
  confirmed?: Interval;
}
