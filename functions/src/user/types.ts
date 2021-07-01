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

@ObjectType()
export class UserWithToken extends User {
  token: string;
}

export class UserEntry extends Identifiable {}
