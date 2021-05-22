import { Field, InputType, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Interval {
  @Field(() => Int)
  beg: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class IntervalInput {
  @Field(() => Int)
  beg: number;

  @Field(() => Int)
  end: number;
}
