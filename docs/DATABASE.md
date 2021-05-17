# Database design

## Entity-relationship diagram

The database can be roughly modelled as:

```
+------+                +---------+
|      | |o-- owner -o< |         |
| User |                | Meeting |
|      | >o--- in ---o< |         |
+------+       =        +---------+
               |
               =
          +----------+
          |          |
          | Schedule |
          |          |
          +----------+
```

## Logical design

<!-- prettier-ignore -->
```typescript
interface Database {
  user: {
    [id: string]: {
      name: string
      email: string
    }
  }
  meeting: {
    [id: string]: {
      name: string
      ownerId?: string   // references user.id
    }
  }
  schedule: {
    [id: string]: {
      meetingId: string  // references meeting.id
      userId: string     // references user.id
      intervals: {
        beg: number
        end: number
      }[]
    }
  }
}
```

### `User`

The `User` entity simply represents the attributes of a user.

`User` is indexed by the document `id` and the `username`.

### `Meeting`

The `Meeting` entity represents the details of a meeting.

A nullable foreign key to the `User` entity exists for identifying the optional owner of a meeting.

`Meeting` is indexed by the document `id` and the `url`.

### `Schedule`

Each `Schedule` represents an array of time intervals with a `beg` and `end` in seconds since Epoch.

Each `Schedule` entity uniquely belongs to one many-to-many relationship between `User` and `Meeting`. Therefore, we can store `Schedule` interval information on the many-to-many relationship entity.

`Schedule` is indexed by `meetingId` and `userId`.
