import { Field, ObjectType } from 'type-graphql';
import { Schedule } from '../schedule/types';
import { Identifiable } from '../types/identifiable';
import { Interval } from '../types/interval';
import { User } from '../user/types';

@ObjectType()
export class Meeting extends Identifiable {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  owner?: User;
  ownerId?: string;

  @Field(() => [Interval])
  intervals: Interval[];

  @Field(() => [Schedule])
  schedules: Schedule[];
}

export class MeetingEntry extends Identifiable {
  name: string;
  slug: string;
  ownerId?: string;
  intervals: Interval[];
}
