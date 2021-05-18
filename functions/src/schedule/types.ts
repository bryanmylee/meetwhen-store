import { Field, Int, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { Identifiable } from '../types/identifiable';
import { User } from '../user/types';

@ObjectType()
export class Schedule extends Identifiable {
  @Field((type) => Meeting)
  meeting: Meeting;
  meetingId: string;

  @Field()
  user: User;
  userId: string;

  @Field((type) => [Interval])
  intervals: Interval[];
}

export class ScheduleEntry extends Identifiable {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}

@ObjectType()
export class Interval {
  @Field((type) => Int)
  beg: number;

  @Field((type) => Int)
  end: number;
}
