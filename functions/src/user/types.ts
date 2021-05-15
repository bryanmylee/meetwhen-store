import { Length } from 'class-validator';
import { Field, ID, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;
}

@InputType()
export class NewUserInput {
  @Field()
  @Length(1, 30)
  name: string;
}
