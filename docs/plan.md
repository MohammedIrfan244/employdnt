# Personal Job Search Assistant
## Product Requirements & Module-Wise Development Blueprint

### 1. Product Overview

**Purpose:** Build a lightweight personal job-search assistant that makes applying for jobs easier, keeps applications organized, and encourages consistent progress without creating additional work.

The application should feel like a simple daily companion, not a corporate dashboard, complicated project manager, or fully automated job-hunting platform.

**Core principle:** The user manages applications. The software manages the organization.

### 2. Core Product Rules

- Minimal interface with straightforward navigation.
- Adding an application should take only a few seconds.
- Users manually manage application details and status changes.
- Dates, progress, reminders, and relevant email detection should be automated.
- Daily goals must encourage progress without restricting users.
- Applications must be separated into user-defined categories.
- No application success-rate statistics, rejection ratios, or response-rate dashboards.
- No unnecessary animations, gamification, or intrusive notifications.
- No automated application submissions or emails sent without user action.

---

# Module 1: Dashboard — Today

**Purpose:** Provide one simple screen showing daily progress and anything requiring attention.

### 1.1 Daily Application Goals

Display a separate progress bar for every active application category.

Example:

**Development**
`[████████░░] 8 / 10`

**Other Remote Jobs**
`[████░░░░░░] 4 / 10`

The bars should fill progressively as applications are recorded.

### 1.2 Progressive Goal System

Daily targets should increase as the user completes them.

| Milestone reached | Next target |
|---|---:|
| 10 applications | 15 |
| 15 applications | 20 |
| 20 applications | 30 |
| 30 applications | 40 |
| 40 applications | 50 |

The initial target is 10 applications per category per day.

When a target is reached:
1. Complete the current progress bar.
2. Increase the target to the next milestone.
3. Continue tracking applications without requiring a reset or additional action.

The milestone sequence should be configurable.

**Important behavior:**
- Reaching a target never blocks additional applications.
- Missing a target never triggers warnings or penalties.
- Users can change their initial targets.
- Progress resets for the next day, while lifetime application totals remain unchanged.
- Each category maintains its own daily progress.

### 1.3 Total Applications

Display the total number of applications submitted in each category.

Example:

- Development: 146 applications
- Other Remote Jobs: 83 applications
- Freelance: 24 applications

These are simple lifetime totals, not performance analytics.

### 1.4 Needs Attention

Display only items that require attention.

Examples:
- A follow-up is due.
- A recruiter has replied.
- An interview invitation needs review.
- An application requires an action.

Each item should link directly to its associated application or email.

### 1.5 Recent Applications

Show a small list of recently added applications.

Provide a quick action to open an application or add another one.

### 1.6 Quick Add

A prominent button opens the Add Application form.

The dashboard must remain uncluttered. Progress bars, attention items, and the quick-add action are the priorities.

---

# Module 2: Application Management

**Purpose:** Record and organize job applications with minimal effort.

### 2.1 Add Application

The default form requires only three fields:

1. Company name
2. Job role
3. Category

Optional fields can be expanded when needed.

These include:
- Job listing URL
- Recruiter name
- Contact email
- Contact details
- Salary
- Job description
- Notes
- Resume used

### 2.2 Automatic Initialization

When an application is created, the system automatically:

- Records the application date and time.
- Sets the initial status to `Applied`.
- Associates the application with its selected category.
- Updates that category's daily progress.
- Updates the category's lifetime application count.
- Schedules the appropriate follow-up reminder.
- Makes the application available for relevant email matching.

No additional confirmation should be required for these operations.

### 2.3 Application Details

Each application has a dedicated detail view containing:

- Company and role information
- Current status
- Application date
- Contact information
- Job description and listing URL
- Resume used
- Notes
- Related emails
- Application timeline
- Follow-up information

Keep optional information out of the default creation flow.

### 2.4 Application CRUD

Users can:
- Create applications.
- View application details.
- Edit application information.
- Delete applications.
- Change application status.
- Move applications between categories.

Changes should update the relevant views automatically.

Deletion must not accidentally delete the user's original emails or profile documents.

### 2.5 Application Statuses

Use a simple status system:

- Applied
- Follow-up Needed
- In Progress
- Interview
- Offer
- Rejected
- Withdrawn

The system can suggest status changes when it detects relevant emails, but the user should confirm them.

### 2.6 Application Timeline

Maintain a simple chronological history of important events.

Examples:
- Application created
- Status changed
- Follow-up reminder generated
- Email linked
- Interview date recorded

The timeline should be generated automatically wherever possible.

---

# Module 3: Follow-Up Management

**Purpose:** Ensure applications do not disappear from the user's attention after submission.

### 3.1 Automatic Follow-Up Scheduling

When an application is created, automatically schedule a follow-up reminder.

Suggested default: **7 days after the application date.**

The waiting period should be configurable.

If a relevant recruiter response arrives before the reminder is due, the system should reassess whether a follow-up is necessary.

### 3.2 Follow-Up Behavior

When the follow-up date arrives:

1. Surface the application in the Needs Attention section.
2. Mark it as requiring follow-up.
3. Offer an action to draft a follow-up email.
4. Allow the user to dismiss or postpone the reminder.

The application should not be silently changed to a different employment outcome.

If `Follow-up Needed` is used as a status, the system should make the transition visible and reversible.

### 3.3 Follow-Up Email Drafting

The application can generate a concise follow-up email using the company, role, and application date.

The user must review and send it.

No email should be sent automatically.

### 3.4 Follow-Up Controls

Users should be able to:
- Mark a follow-up as completed.
- Postpone a reminder.
- Disable follow-up reminders for an application.
- Change the default waiting period.

Avoid repeated notifications for the same unresolved reminder.

---

# Module 4: Email Integration

**Purpose:** Bring relevant recruitment emails into the application without requiring the user to switch between Gmail and the tracker.

### 4.1 Gmail Connection

Allow users to connect their Gmail account through Google OAuth.

Request only the permissions necessary for the email features being implemented.

### 4.2 Relevant Email Detection

Identify potentially relevant messages, including:

- Application acknowledgments
- Recruiter responses
- Interview invitations
- Rejection emails
- Requests for additional information
- Offer-related messages

Ignore unrelated personal and promotional emails.

### 4.3 Email Matching

Match detected emails to existing applications using available signals, such as:

- Company name
- Sender email address
- Role name
- Email subject
- Application context

If the match is uncertain, ask the user to confirm it.

Do not automatically associate an email with an application based on the company name alone when ambiguity exists.

### 4.4 Notifications

When a relevant email is detected, display a notification within the application.

Example:

**New email detected**

Company: Example Technologies  
Role: Full Stack Developer

Actions:
- View email
- Open application

Notifications should be limited to meaningful events.

### 4.5 Email and Status Updates

The system may suggest a status change based on email content.

Examples:
- Interview invitation → Suggest `Interview`
- Rejection → Suggest `Rejected`
- Request for additional information → Flag for attention

The user confirms the change.

An automated acknowledgment should not be interpreted as evidence of shortlisting or rejection.

### 4.6 Email Storage and Privacy

Store only the information required for the feature.

Prefer storing message identifiers, relevant metadata, and extracted recruitment events rather than copying entire mailboxes into the application database.

Users must be able to disconnect Gmail and understand what information is retained.

---

# Module 5: Categories

**Purpose:** Keep different job-search activities separate.

### 5.1 User-Defined Categories

Provide default categories such as:

- Development
- Other Remote Jobs
- Freelance

Users can create, rename, archive, and delete categories.

### 5.2 Category-Specific Data

Each category maintains its own:

- Application list
- Daily target
- Daily progress
- Lifetime application count
- Follow-up items

An application belongs to one primary category.

### 5.3 Category Management

Categories should be accessible from the application list and dashboard.

Archiving a category should preserve its application history and totals.

Deleting a category must require an explicit decision about what happens to its applications.

---

# Module 6: Profile and Documents

**Purpose:** Keep job-search materials organized and accessible.

### 6.1 Profile

Store reusable information such as:

- Full name
- Contact information
- Professional summary
- Skills
- Portfolio URL
- GitHub URL
- LinkedIn URL
- Preferred work arrangements
- Employment preferences

Users should not need to re-enter this information for every application.

### 6.2 Resume Management

Allow users to upload and manage multiple resume versions.

Each document should have:
- File name
- Optional description
- Upload date
- Optional category association

Users can associate a specific resume with an application.

The system must preserve the original files and avoid silently replacing documents.

### 6.3 Additional Documents

Support optional storage for cover letters and other job-search documents.

Keep this module straightforward. It is a document organizer, not a full document editor.

---

# Module 7: Resources

**Purpose:** Provide one location for useful job-search resources.

Users can save:
- Job boards
- Company career pages
- Interview preparation resources
- Technical references
- Recruiter profiles
- Other useful URLs

Each resource should contain a title and URL, with an optional description or category.

Avoid turning this into a complicated bookmarking or knowledge-management system.

---

# Module 8: Notifications and Reminders

**Purpose:** Bring important events to the user's attention without creating notification fatigue.

### Notification types

- Relevant email received
- Follow-up due
- Interview approaching
- Important application action required

### Behavior

- Notifications link directly to the relevant item.
- Users can mark notifications as read.
- Duplicate notifications should be avoided.
- Follow-up reminders should not repeat excessively.
- Users can configure notification preferences.

Start with in-app notifications. Browser or desktop notifications can be added later.

---

# Module 9: UI and Design System

**Purpose:** Make the application immediately understandable and comfortable to use every day.

### 9.1 Visual Direction

Use a clean white interface with green as the primary brand color.

Accent colors:
- **Green:** Primary actions, progress, completed goals
- **Blue:** Informational elements and links
- **Yellow:** Pending actions and reminders
- **Red:** Urgent attention or destructive actions
- **Black:** Primary text and strong contrast

Use CSS variables or a centralized theme configuration for colors.

Ensure text and controls meet accessible contrast requirements.

### 9.2 Layout

Keep the primary navigation limited to:

1. Today
2. Applications
3. Assistant
4. Profile

Categories should be accessible from the Applications section.

Resources and settings can be placed in secondary navigation.

### 9.3 Interaction Principles

- Quick-add forms should be short.
- Optional fields should remain collapsed by default.
- Important actions should be easy to locate.
- Application details should be accessible with minimal navigation.
- Use subtle transitions only where they improve clarity.
- Avoid unnecessary charts, decorative animations, and excessive cards.
- Do not use warning colors to shame users for missing targets.

### 9.4 Responsive Design

The interface must work on desktop and mobile screens.

Desktop should support keeping the application open beside job boards and email.

Mobile should prioritize quick application entry, progress, notifications, and follow-up actions.

---

# Module 10: Settings

Provide a compact settings section for:

- Category management
- Daily goal configuration
- Follow-up waiting period
- Gmail connection
- Notification preferences
- Profile and document management
- Account and data controls

Settings should not dominate the primary interface.

---

# Module 11: Core Data Model

The following entities form the initial data model.

### User
Stores account identity, preferences, and configuration.

### Category
Stores the category name, target settings, and archive state.

### Application
Stores company, role, category, application date, status, optional details, and follow-up configuration.

### ApplicationEvent
Stores the application's chronological activity.

### EmailConnection
Stores the Gmail connection reference and synchronization state.

### LinkedEmail
Stores the email identifiers, relevant metadata, matching confidence, and extracted event information associated with an application.

### Notification
Stores notification type, related application, creation date, and read state.

### Resume
Stores document metadata and file references.

### Resource
Stores saved links and their descriptions.

### DailyProgress
Stores the daily count for each category and the applicable goal milestone.

Daily progress should be calculated from valid application creation events or maintained transactionally. Editing an application must not accidentally count it as a new application.

---

# Module 12: Automation Boundaries

Automation should remove repetitive administration, not take control away from the user.

| Action | Behavior |
|---|---|
| Record application date | Automatic |
| Set initial status | Automatic |
| Update daily progress | Automatic |
| Update lifetime totals | Automatic |
| Schedule follow-up reminder | Automatic |
| Detect relevant emails | Automatic |
| Link uncertain email matches | Ask for confirmation |
| Suggest status changes | Ask for confirmation |
| Draft follow-up email | Generate automatically; user reviews |
| Send follow-up email | User action required |
| Add or edit application details | User action |
| Delete an application | User action |
| Change application status | User action, except explicitly confirmed workflows |

No job applications should be submitted automatically.

---

# Module 13: Recommended Development Order

Build the product in the following order.

### Phase 1 — Core Application
- Authentication
- Dashboard
- Categories
- Quick-add application form
- Application list and detail views
- CRUD operations
- Status management
- Daily progress bars
- Lifetime category totals

### Phase 2 — Follow-Up Assistant
- Automatic reminder scheduling
- Needs Attention section
- Follow-up actions
- Email draft generation
- Application timeline

### Phase 3 — Gmail Integration
- OAuth connection
- Relevant email detection
- Application matching
- In-app notifications
- Suggested status updates

### Phase 4 — Supporting Modules
- Profile
- Resume management
- Resource library
- Settings
- Notification preferences

### Phase 5 — Polish
- Responsive behavior
- Accessibility
- Error handling
- Background job reliability
- Privacy controls
- Performance improvements

The first usable release should focus on Phases 1 and 2. Gmail integration is important, but the core tracker must be useful even before a user connects their inbox.

---

# Final Product Definition

The application is a lightweight personal job-search assistant.

Users record applications, manage their statuses, and organize their job search by category. The software automatically tracks progress, schedules follow-ups, identifies relevant recruitment emails, and brings important actions to the user's attention.

The interface remains simple, with a white-and-green design, clear progress bars, minimal navigation, and no pressure-based gamification.

**The main measure of success is how little effort the user needs to spend maintaining the system while continuing their job search.**