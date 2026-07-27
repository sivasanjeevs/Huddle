# Implementation Plan: True Cloud-Only Storage for Huddle Photos

The goal is to strictly upload photos to Google Drive, completely eliminate local photo storage, and fetch the photos dynamically from Google Drive to display in the UI. 

> [!WARNING]
> **CRITICAL ROADBLOCK:** Because Google Drive strictly blocks Service Accounts from uploading files (Quota error), we **MUST** switch the backend from using a Service Account to using **OAuth 2.0 User Credentials** (or a Shared Drive). Otherwise, the code will work, but Google will permanently reject all uploads with a `403 Forbidden` error.

## Open Questions
1. **Credentials Upgrade:** Are you okay with switching from the `GOOGLE_SERVICE_ACCOUNT_JSON` to an OAuth 2.0 Refresh Token in your `.env` file? (It's a one-time setup that takes 3 minutes in the Google Cloud Console, and I can walk you through it). 
2. **Drive Folder Permissions:** When the server creates the event folder, should we set it so that "Anyone with the link" can view the photos? (This allows the UI to easily fetch and display the images without requiring users to log in to Google).

## Proposed Changes

### `huddle-chat-server/controllers/lobby.controller.js`
- **[MODIFY]** `uploadPhoto`: 
  - Change `multer` from `diskStorage` to `memoryStorage` so files are never written to the server's disk.
  - Upload the file buffer directly to Google Drive.
  - Remove the `prisma.lobbyPhoto.create` logic (no more database saving for photos).
- **[MODIFY]** `getPhotos`:
  - Completely remove the `prisma.lobbyPhoto.findMany` database query.
  - Call `driveService.listFiles(lobby.driveFolderId)` to fetch the list of files dynamically from Google Drive.
  - Return the live Drive links to the frontend.

### `huddle-chat-server/services/driveService.js`
- **[NEW]** Add a `listFiles(folderId)` method that queries the Google Drive API for all images inside the specific event folder.
- **[MODIFY]** Update `createEventFolder` to automatically make the newly created folder publicly viewable (so the UI can display the images).

## Verification Plan
1. You will fix your `.env` credentials (using OAuth 2.0 or a Shared Drive).
2. We will upload a photo via the UI.
3. We will verify that nothing is saved in the `uploads/` folder or the database.
4. We will verify the photo appears in the UI by fetching directly from Google Drive.
