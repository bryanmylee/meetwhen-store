import { Field, Int, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { Identifiable } from '../types/identifiable';
import { User } from '../user/types';

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
}

export class ScheduleEntry extends Identifiable {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}

@ObjectType()
export class Interval {
  @Field(() => Int)
  beg: number;

  @Field(() => Int)
  end: number;
}
