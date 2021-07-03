import { Field, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { Schedule } from '../schedule/types';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class UserShallow extends Identifiable {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  guestOf: string | null = null;
}

@ObjectType()
export class User extends UserShallow {
  @Field(() => [Meeting])
  meetings: Meeting[];

  @Field(() => [Schedule])
  schedules: Schedule[];
}

export interface UserCustomAttributes {
  guestOf: string | null;
}

export class UserEntry extends Identifiable {}
