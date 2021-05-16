import { Length } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class User extends Identifiable {
  @Field()
  name: string;
}

export class UserEntry extends Identifiable {
  name: string;
}

@InputType()
export class NewUserInput implements Partial<User> {
  @Field()
  @Length(1, 30)
  name: string;
}
