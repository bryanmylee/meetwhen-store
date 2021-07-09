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

/**
 * Get the interval that covers the entire set of intervals.
 * @param intervals A sorted list of intervals.
 */
export const getTotalInterval = (intervals: Interval[]): Interval => ({
  beg: intervals[0].beg,
  end: intervals[intervals.length - 1].end,
});
