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
interface Firestore {
  meeting: {
    [id: string]: {
      slug: string
      name: string
      ownerId?: string  // references user.id
      intervals: {      // represents selectable intervals
        beg: number
        end: number
      }[]
    }
  }
  schedule: {
    [id: string]: {
      meetingId: string // references meeting.id
      userId: string    // references user.id
      intervals: {      // represents user selections
        beg: number
        end: number
      }[]
    }
  }
}

interface Authentication {
  [id: string]: {
    id: string
    displayName: EncodedDisplayName
    email: string
  }
}

type EncodedDisplayName = string // ;-delimited [name, guestOf]
```

### `User`

The `User` entity simply represents the attributes of a user.

`User` is handled by Firebase Authentication, and can be indexed by `id`.

Special care needs to be taken to encode and decode the displayName field of the authentication entity as it stores both the name and the guestOf properties of `User`.

### `Meeting`

The `Meeting` entity represents the details of a meeting.

A nullable foreign key to the `User` entity exists for identifying the optional owner of a meeting.

`Meeting` is indexed by the document `id` the `slug`.

### `Schedule`

Each `Schedule` represents an array of time intervals with a `beg` and `end` in seconds since Epoch.

Each `Schedule` entity uniquely belongs to one many-to-many relationship between `User` and `Meeting`. Therefore, we can store `Schedule` interval information on the many-to-many relationship entity.

`Schedule` is indexed by `meetingId` and `userId`.
