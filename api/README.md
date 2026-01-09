# ClickUp API Reference

Complete endpoint documentation for ClickUp API v2 and v3.

## Base URLs

| Version | Base URL |
|---------|----------|
| **v2** | `https://api.clickup.com/api/v2` |
| **v3** | `https://api.clickup.com/api/v3` |

## Authentication

### Personal API Token
- Tokens begin with `pk_`
- **Never expire**
- Header: `Authorization: {personal_token}`

**Generate token:**
1. ClickUp → Avatar → Settings → Apps
2. Under "API Token", click Generate
3. Copy token

### OAuth 2.0
- Grant type: Authorization Code
- Authorization URL: `https://app.clickup.com/api`
- Token URL: `https://api.clickup.com/api/v2/oauth/token`

**Flow:**
1. Redirect to `https://app.clickup.com/api?client_id={client_id}&redirect_uri={redirect_uri}`
2. User authorizes, returns with `code`
3. Exchange code for token via POST `/oauth/token`
4. Use token: `Authorization: Bearer {access_token}`

[Authentication Docs](https://developer.clickup.com/docs/authentication)

---

## API v2 Endpoints

### Authorization

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/oauth/token` | Exchange code for access token | [Link](https://developer.clickup.com/reference/getaccesstoken) |
| GET | `/user` | Get authenticated user details | [Link](https://developer.clickup.com/reference/getauthorizeduser) |

### Workspaces (Teams)

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team` | List authorized workspaces | [Link](https://developer.clickup.com/reference/getauthorizedteams) |
| GET | `/team/{team_id}/seat` | View workspace seat availability | [Link](https://developer.clickup.com/reference/getworkspaceseats) |
| GET | `/team/{team_id}/plan` | Get workspace subscription details | [Link](https://developer.clickup.com/reference/getworkspaceplan) |

### Spaces

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/space` | List spaces in workspace | [Link](https://developer.clickup.com/reference/getspaces) |
| POST | `/team/{team_id}/space` | Create space | [Link](https://developer.clickup.com/reference/createspace) |
| GET | `/space/{space_id}` | Get space details | [Link](https://developer.clickup.com/reference/getspace) |
| PUT | `/space/{space_id}` | Update space | [Link](https://developer.clickup.com/reference/updatespace) |
| DELETE | `/space/{space_id}` | Delete space | [Link](https://developer.clickup.com/reference/deletespace) |

### Folders

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/space/{space_id}/folder` | List folders in space | [Link](https://developer.clickup.com/reference/getfolders) |
| POST | `/space/{space_id}/folder` | Create folder | [Link](https://developer.clickup.com/reference/createfolder) |
| GET | `/folder/{folder_id}` | Get folder details | [Link](https://developer.clickup.com/reference/getfolder) |
| PUT | `/folder/{folder_id}` | Update folder | [Link](https://developer.clickup.com/reference/updatefolder) |
| DELETE | `/folder/{folder_id}` | Delete folder | [Link](https://developer.clickup.com/reference/deletefolder) |
| POST | `/folder/{folder_id}/from-template` | Create folder from template | [Link](https://developer.clickup.com/reference/createfolderfromtemplate) |

### Lists

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/folder/{folder_id}/list` | List lists in folder | [Link](https://developer.clickup.com/reference/getlists) |
| POST | `/folder/{folder_id}/list` | Create list in folder | [Link](https://developer.clickup.com/reference/createlist) |
| GET | `/space/{space_id}/list` | List folderless lists in space | [Link](https://developer.clickup.com/reference/getfolderlesslists) |
| POST | `/space/{space_id}/list` | Create folderless list | [Link](https://developer.clickup.com/reference/createfolderlesslist) |
| GET | `/list/{list_id}` | Get list details | [Link](https://developer.clickup.com/reference/getlist) |
| PUT | `/list/{list_id}` | Update list | [Link](https://developer.clickup.com/reference/updatelist) |
| DELETE | `/list/{list_id}` | Delete list | [Link](https://developer.clickup.com/reference/deletelist) |
| POST | `/list/{list_id}/task/{task_id}` | Add task to additional list | [Link](https://developer.clickup.com/reference/addtasktolist) |
| DELETE | `/list/{list_id}/task/{task_id}` | Remove task from list | [Link](https://developer.clickup.com/reference/removetaskfromlist) |
| POST | `/folder/{folder_id}/list_template/{template_id}` | Create list from template | [Link](https://developer.clickup.com/reference/createfolderlistfromtemplate) |
| POST | `/space/{space_id}/list_template/{template_id}` | Create folderless list from template | [Link](https://developer.clickup.com/reference/createspacelistfromtemplate) |

### Tasks

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/list/{list_id}/task` | Get tasks in list (100 per page) | [Link](https://developer.clickup.com/reference/gettasks) |
| POST | `/list/{list_id}/task` | Create task | [Link](https://developer.clickup.com/reference/createtask) |
| GET | `/task/{task_id}` | Get task details | [Link](https://developer.clickup.com/reference/gettask) |
| PUT | `/task/{task_id}` | Update task | [Link](https://developer.clickup.com/reference/updatetask) |
| DELETE | `/task/{task_id}` | Delete task | [Link](https://developer.clickup.com/reference/deletetask) |
| GET | `/team/{team_id}/task` | Get filtered tasks across workspace | [Link](https://developer.clickup.com/reference/getfilteredteamtasks) |
| POST | `/task/{task_id}/merge` | Merge tasks | [Link](https://developer.clickup.com/reference/mergetasks) |
| GET | `/task/{task_id}/time_in_status` | Get task time in each status | [Link](https://developer.clickup.com/reference/gettaskstimeinstatus) |
| GET | `/task/bulk_time_in_status/task_ids` | Bulk task status time | [Link](https://developer.clickup.com/reference/getbulktaskstimeinstatus) |
| POST | `/task/{task_id}/from-template` | Create task from template | [Link](https://developer.clickup.com/reference/createtaskfromtemplate) |

### Task Checklists

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/task/{task_id}/checklist` | Create checklist | [Link](https://developer.clickup.com/reference/createchecklist) |
| PUT | `/checklist/{checklist_id}` | Update checklist | [Link](https://developer.clickup.com/reference/editchecklist) |
| DELETE | `/checklist/{checklist_id}` | Delete checklist | [Link](https://developer.clickup.com/reference/deletechecklist) |
| POST | `/checklist/{checklist_id}/item` | Create checklist item | [Link](https://developer.clickup.com/reference/createchecklistitem) |
| PUT | `/checklist/{checklist_id}/item/{item_id}` | Update checklist item | [Link](https://developer.clickup.com/reference/editchecklistitem) |
| DELETE | `/checklist/{checklist_id}/item/{item_id}` | Delete checklist item | [Link](https://developer.clickup.com/reference/deletechecklistitem) |

### Task Relationships

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/task/{task_id}/dependency` | Add task dependency | [Link](https://developer.clickup.com/reference/adddependency) |
| DELETE | `/task/{task_id}/dependency` | Remove dependency | [Link](https://developer.clickup.com/reference/deletedependency) |
| POST | `/task/{task_id}/link/{links_to}` | Link tasks | [Link](https://developer.clickup.com/reference/addtasklink) |
| DELETE | `/task/{task_id}/link/{links_to}` | Unlink tasks | [Link](https://developer.clickup.com/reference/deletetasklink) |

### Comments

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/task/{task_id}/comment` | Get task comments | [Link](https://developer.clickup.com/reference/gettaskcomments) |
| POST | `/task/{task_id}/comment` | Create task comment | [Link](https://developer.clickup.com/reference/createtaskcomment) |
| GET | `/view/{view_id}/comment` | Get chat view comments | [Link](https://developer.clickup.com/reference/getchatviewcomments) |
| POST | `/view/{view_id}/comment` | Create chat view comment | [Link](https://developer.clickup.com/reference/createchatviewcomment) |
| GET | `/list/{list_id}/comment` | Get list comments | [Link](https://developer.clickup.com/reference/getlistcomments) |
| POST | `/list/{list_id}/comment` | Create list comment | [Link](https://developer.clickup.com/reference/createlistcomment) |
| PUT | `/comment/{comment_id}` | Update comment | [Link](https://developer.clickup.com/reference/updatecomment) |
| DELETE | `/comment/{comment_id}` | Delete comment | [Link](https://developer.clickup.com/reference/deletecomment) |
| GET | `/comment/{comment_id}/reply` | Get threaded comments | [Link](https://developer.clickup.com/reference/getthreadedcomments) |
| POST | `/comment/{comment_id}/reply` | Create threaded comment | [Link](https://developer.clickup.com/reference/createthreadedcomment) |

### Custom Fields

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/list/{list_id}/field` | Get list custom fields | [Link](https://developer.clickup.com/reference/getaccessiblecustomfields) |
| POST | `/task/{task_id}/field/{field_id}` | Set custom field value | [Link](https://developer.clickup.com/reference/setcustomfieldvalue) |
| DELETE | `/task/{task_id}/field/{field_id}` | Remove custom field value | [Link](https://developer.clickup.com/reference/removecustomfieldvalue) |

### Custom Task Types

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/custom_item` | Get custom task types | [Link](https://developer.clickup.com/reference/getcustomitems) |

### Attachments

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/task/{task_id}/attachment` | Create task attachment | [Link](https://developer.clickup.com/reference/createtaskattachment) |

### Tags

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/space/{space_id}/tag` | Get space tags | [Link](https://developer.clickup.com/reference/getspacetags) |
| POST | `/space/{space_id}/tag` | Create space tag | [Link](https://developer.clickup.com/reference/createspacetag) |
| PUT | `/space/{space_id}/tag/{tag_name}` | Update tag | [Link](https://developer.clickup.com/reference/editspacetag) |
| DELETE | `/space/{space_id}/tag/{tag_name}` | Delete tag | [Link](https://developer.clickup.com/reference/deletespacetag) |
| POST | `/task/{task_id}/tag/{tag_name}` | Add tag to task | [Link](https://developer.clickup.com/reference/addtagtotask) |
| DELETE | `/task/{task_id}/tag/{tag_name}` | Remove tag from task | [Link](https://developer.clickup.com/reference/removetagfromtask) |

### Time Tracking

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/time_entries` | Get time entries by date range | [Link](https://developer.clickup.com/reference/gettimeentrieswithinadaterange) |
| POST | `/team/{team_id}/time_entries` | Create time entry | [Link](https://developer.clickup.com/reference/createatimeentry) |
| GET | `/team/{team_id}/time_entries/{timer_id}` | Get time entry | [Link](https://developer.clickup.com/reference/getsingulartimeentry) |
| PUT | `/team/{team_id}/time_entries/{timer_id}` | Update time entry | [Link](https://developer.clickup.com/reference/updateatimeentry) |
| DELETE | `/team/{team_id}/time_entries/{timer_id}` | Delete time entry | [Link](https://developer.clickup.com/reference/deleteatimeentry) |
| GET | `/team/{team_id}/time_entries/{timer_id}/history` | Get time entry history | [Link](https://developer.clickup.com/reference/gettimeentryhistory) |
| GET | `/team/{team_id}/time_entries/current` | Get running time entry | [Link](https://developer.clickup.com/reference/getrunningtimeentry) |
| POST | `/team/{team_id}/time_entries/start` | Start timer | [Link](https://developer.clickup.com/reference/startatimeentry) |
| POST | `/team/{team_id}/time_entries/stop` | Stop timer | [Link](https://developer.clickup.com/reference/stopatimeentry) |
| GET | `/team/{team_id}/time_entries/tags` | Get time entry tags | [Link](https://developer.clickup.com/reference/getalltagsfromtimeentries) |
| POST | `/team/{team_id}/time_entries/tags` | Add tags to time entries | [Link](https://developer.clickup.com/reference/addtagsfromtimeentries) |
| PUT | `/team/{team_id}/time_entries/tags` | Rename time entry tag | [Link](https://developer.clickup.com/reference/changetagnamesfromtimeentries) |
| DELETE | `/team/{team_id}/time_entries/tags` | Remove tags from time entries | [Link](https://developer.clickup.com/reference/removetagsfromtimeentries) |

### Time Tracking (Legacy)

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/task/{task_id}/time` | Get tracked time | [Link](https://developer.clickup.com/reference/gettrackedtime) |
| POST | `/task/{task_id}/time` | Track time | [Link](https://developer.clickup.com/reference/tracktime) |
| PUT | `/task/{task_id}/time/{interval_id}` | Update tracked time | [Link](https://developer.clickup.com/reference/edittimetracked) |
| DELETE | `/task/{task_id}/time/{interval_id}` | Delete tracked time | [Link](https://developer.clickup.com/reference/deletetimetracked) |

### Goals

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/goal` | Get goals | [Link](https://developer.clickup.com/reference/getgoals) |
| POST | `/team/{team_id}/goal` | Create goal | [Link](https://developer.clickup.com/reference/creategoal) |
| GET | `/goal/{goal_id}` | Get goal | [Link](https://developer.clickup.com/reference/getgoal) |
| PUT | `/goal/{goal_id}` | Update goal | [Link](https://developer.clickup.com/reference/updategoal) |
| DELETE | `/goal/{goal_id}` | Delete goal | [Link](https://developer.clickup.com/reference/deletegoal) |
| POST | `/goal/{goal_id}/key_result` | Create key result | [Link](https://developer.clickup.com/reference/createkeyresult) |
| PUT | `/key_result/{key_result_id}` | Update key result | [Link](https://developer.clickup.com/reference/editkeyresult) |
| DELETE | `/key_result/{key_result_id}` | Delete key result | [Link](https://developer.clickup.com/reference/deletekeyresult) |

### Views

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/view` | Get workspace views | [Link](https://developer.clickup.com/reference/getteamviews) |
| POST | `/team/{team_id}/view` | Create workspace view | [Link](https://developer.clickup.com/reference/createteamview) |
| GET | `/space/{space_id}/view` | Get space views | [Link](https://developer.clickup.com/reference/getspaceviews) |
| POST | `/space/{space_id}/view` | Create space view | [Link](https://developer.clickup.com/reference/createspaceview) |
| GET | `/folder/{folder_id}/view` | Get folder views | [Link](https://developer.clickup.com/reference/getfolderviews) |
| POST | `/folder/{folder_id}/view` | Create folder view | [Link](https://developer.clickup.com/reference/createfolderview) |
| GET | `/list/{list_id}/view` | Get list views | [Link](https://developer.clickup.com/reference/getlistviews) |
| POST | `/list/{list_id}/view` | Create list view | [Link](https://developer.clickup.com/reference/createlistview) |
| GET | `/view/{view_id}` | Get view details | [Link](https://developer.clickup.com/reference/getview) |
| PUT | `/view/{view_id}` | Update view | [Link](https://developer.clickup.com/reference/updateview) |
| DELETE | `/view/{view_id}` | Delete view | [Link](https://developer.clickup.com/reference/deleteview) |
| GET | `/view/{view_id}/task` | Get tasks in view | [Link](https://developer.clickup.com/reference/getviewtasks) |

### Users

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/team/{team_id}/user` | Invite user to workspace | [Link](https://developer.clickup.com/reference/inviteusertoworkspace) |
| GET | `/team/{team_id}/user/{user_id}` | Get user | [Link](https://developer.clickup.com/reference/getuser) |
| PUT | `/team/{team_id}/user/{user_id}` | Update user role | [Link](https://developer.clickup.com/reference/edituseronworkspace) |
| DELETE | `/team/{team_id}/user/{user_id}` | Remove user from workspace | [Link](https://developer.clickup.com/reference/removeuserfromworkspace) |

### User Groups

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/group` | Get user groups | [Link](https://developer.clickup.com/reference/getteams1) |
| POST | `/team/{team_id}/group` | Create user group | [Link](https://developer.clickup.com/reference/createusergroup) |
| PUT | `/group/{group_id}` | Update user group | [Link](https://developer.clickup.com/reference/updateteam) |
| DELETE | `/group/{group_id}` | Delete user group | [Link](https://developer.clickup.com/reference/deleteteam) |

### Guests

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/team/{team_id}/guest` | Invite guest to workspace | [Link](https://developer.clickup.com/reference/inviteguesttoworkspace) |
| GET | `/team/{team_id}/guest/{guest_id}` | Get guest | [Link](https://developer.clickup.com/reference/getguest) |
| PUT | `/team/{team_id}/guest/{guest_id}` | Update guest role | [Link](https://developer.clickup.com/reference/editguestonworkspace) |
| DELETE | `/team/{team_id}/guest/{guest_id}` | Remove guest from workspace | [Link](https://developer.clickup.com/reference/removeguestfromworkspace) |
| POST | `/task/{task_id}/guest/{guest_id}` | Add guest to task | [Link](https://developer.clickup.com/reference/addguesttotask) |
| DELETE | `/task/{task_id}/guest/{guest_id}` | Remove guest from task | [Link](https://developer.clickup.com/reference/removeguestfromtask) |
| POST | `/list/{list_id}/guest/{guest_id}` | Add guest to list | [Link](https://developer.clickup.com/reference/addguesttolist) |
| DELETE | `/list/{list_id}/guest/{guest_id}` | Remove guest from list | [Link](https://developer.clickup.com/reference/removeguestfromlist) |
| POST | `/folder/{folder_id}/guest/{guest_id}` | Add guest to folder | [Link](https://developer.clickup.com/reference/addguesttofolder) |
| DELETE | `/folder/{folder_id}/guest/{guest_id}` | Remove guest from folder | [Link](https://developer.clickup.com/reference/removeguestfromfolder) |

### Members

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/task/{task_id}/member` | Get task members | [Link](https://developer.clickup.com/reference/gettaskmembers) |
| GET | `/list/{list_id}/member` | Get list members | [Link](https://developer.clickup.com/reference/getlistmembers) |

### Roles

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/customroles` | Get custom roles | [Link](https://developer.clickup.com/reference/getcustomroles) |

### Templates

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/taskTemplate` | Get task templates | [Link](https://developer.clickup.com/reference/gettasktemplates) |

### Webhooks

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/webhook` | Get webhooks | [Link](https://developer.clickup.com/reference/getwebhooks) |
| POST | `/team/{team_id}/webhook` | Create webhook | [Link](https://developer.clickup.com/reference/createwebhook) |
| PUT | `/webhook/{webhook_id}` | Update webhook | [Link](https://developer.clickup.com/reference/updatewebhook) |
| DELETE | `/webhook/{webhook_id}` | Delete webhook | [Link](https://developer.clickup.com/reference/deletewebhook) |

**Note:** ClickUp uses dynamic IP addressing for webhooks (no dedicated IP).

### Shared Hierarchy

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/team/{team_id}/shared` | Get shared hierarchy | [Link](https://developer.clickup.com/reference/sharedhierarchy) |

---

## API v3 Endpoints

### Access Control

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| PATCH | `/object/{object_id}/acl` | Update resource access permissions | [Link](https://developer.clickup.com/reference/publicpatchacl) |

### Audit Logs

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| POST | `/team/{team_id}/audit-logs` | Get workspace audit logs | [Link](https://developer.clickup.com/reference/queryauditlog) |

### Chat Channels

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/channels` | List chat channels | [Link](https://developer.clickup.com/reference/getchatchannels) |
| POST | `/channels` | Create chat channel | [Link](https://developer.clickup.com/reference/createchatchannel) |
| POST | `/locations/{location_id}/channels` | Create channel in location | [Link](https://developer.clickup.com/reference/createlocationchatchannel) |
| POST | `/direct-messages` | Create direct message channel | [Link](https://developer.clickup.com/reference/createdirectmessagechatchannel) |
| GET | `/channels/{channel_id}` | Get channel details | [Link](https://developer.clickup.com/reference/getchatchannel) |
| PATCH | `/channels/{channel_id}` | Update channel | [Link](https://developer.clickup.com/reference/updatechatchannel) |
| DELETE | `/channels/{channel_id}` | Delete channel | [Link](https://developer.clickup.com/reference/deletechatchannel) |
| GET | `/channels/{channel_id}/followers` | Get channel followers | [Link](https://developer.clickup.com/reference/getchatchannelfollowers) |
| GET | `/channels/{channel_id}/members` | Get channel members | [Link](https://developer.clickup.com/reference/getchatchannelmembers) |

### Chat Messages

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/channels/{channel_id}/messages` | Get channel messages | [Link](https://developer.clickup.com/reference/getChatmessages) |
| POST | `/channels/{channel_id}/messages` | Send message | [Link](https://developer.clickup.com/reference/createchatmessage) |
| PATCH | `/channels/{channel_id}/messages/{message_id}` | Update message | [Link](https://developer.clickup.com/reference/patchchatmessage) |
| DELETE | `/channels/{channel_id}/messages/{message_id}` | Delete message | [Link](https://developer.clickup.com/reference/deletechatmessage) |
| GET | `/channels/{channel_id}/messages/{message_id}/reactions` | Get message reactions | [Link](https://developer.clickup.com/reference/getchatmessagereactions) |
| POST | `/workspaces/{workspace_id}/chat/messages/{message_id}/reactions` | Add reaction | [Link](https://developer.clickup.com/reference/createchatreaction) |
| DELETE | `/workspaces/{workspace_id}/chat/messages/{message_id}/reactions/{reaction}` | Remove reaction | [Link](https://developer.clickup.com/reference/deletechatreaction) |
| GET | `/channels/{channel_id}/messages/{message_id}/replies` | Get message replies | [Link](https://developer.clickup.com/reference/getchatmessagereplies) |
| POST | `/channels/{channel_id}/messages/{message_id}/replies` | Reply to message | [Link](https://developer.clickup.com/reference/createreplymessage) |
| GET | `/channels/{channel_id}/messages/{message_id}/tagged-users` | Get mentioned users | [Link](https://developer.clickup.com/reference/getchatmessagetaggedusers) |
| GET | `/workspaces/{workspace_id}/comments/types/{comment_type}/subtypes` | Get message subtypes | [Link](https://developer.clickup.com/reference/getsubtypes) |

### Docs

| Method | Endpoint | Description | Docs |
|--------|----------|-------------|------|
| GET | `/workspaces/{workspace_id}/docs` | Search workspace docs | [Link](https://developer.clickup.com/reference/searchdocspublic) |
| POST | `/workspaces/{workspace_id}/docs` | Create doc | [Link](https://developer.clickup.com/reference/createdocpublic) |
| GET | `/workspaces/{workspace_id}/docs/{doc_id}` | Get doc | [Link](https://developer.clickup.com/reference/getdocpublic) |
| GET | `/workspaces/{workspace_id}/docs/{doc_id}/page_listing` | Get doc page listing | [Link](https://developer.clickup.com/reference/getdocpagelistingpublic) |
| GET | `/workspaces/{workspace_id}/docs/{doc_id}/pages` | Get doc pages | [Link](https://developer.clickup.com/reference/getdocpagespublic) |
| POST | `/workspaces/{workspace_id}/docs/{doc_id}/pages` | Create doc page | [Link](https://developer.clickup.com/reference/createpagepublic) |
| GET | `/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}` | Get doc page | [Link](https://developer.clickup.com/reference/getpagepublic) |
| PUT | `/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}` | Update doc page | [Link](https://developer.clickup.com/reference/editpagepublic) |

---

## Common Parameters

### Pagination
- Most list endpoints return max 100 items per page
- Use `page` parameter for pagination (0-indexed)

### Task Query Parameters
- `include_closed`: Include closed tasks
- `subtasks`: Include subtasks
- `assignees[]`: Filter by assignee IDs
- `statuses[]`: Filter by status names
- `due_date_gt`: Due date greater than (Unix ms)
- `due_date_lt`: Due date less than (Unix ms)
- `date_created_gt`: Created after (Unix ms)
- `date_created_lt`: Created before (Unix ms)
- `date_updated_gt`: Updated after (Unix ms)
- `date_updated_lt`: Updated before (Unix ms)
- `include_timl`: Include tasks in multiple lists

### Time Values
- All timestamps in **milliseconds** (Unix epoch)
- `time_spent` field returned in milliseconds

---

## Rate Limits

ClickUp implements rate limiting. Check response headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error |

---

## Resources

- [ClickUp API Reference](https://developer.clickup.com/reference)
- [Authentication Guide](https://developer.clickup.com/docs/authentication)
- [Try the API](https://developer.clickup.com/docs/trytheapi)
- [Webhooks Guide](https://developer.clickup.com/docs/webhooks)
