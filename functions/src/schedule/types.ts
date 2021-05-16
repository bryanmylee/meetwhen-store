import { Field, Int, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class Schedule extends Identifiable {
  meetingId: string;

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
