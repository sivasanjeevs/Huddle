const { google } = require('googleapis');
const stream = require('stream');

class DriveService {
  constructor() {
    this.drive = null;
    this._initialize();
  }

  _initialize() {
    try {
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        console.warn("[DriveService] Missing GOOGLE_SERVICE_ACCOUNT_JSON in .env. Drive integration is disabled.");
        return;
      }
      
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.split('\\n').join('\n');
      }
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      
      this.drive = google.drive({ version: 'v3', auth });
      console.log("[DriveService] Successfully initialized Google Drive API.");
    } catch (error) {
      console.error("[DriveService] Failed to initialize Google Drive API:", error);
    }
  }

  /**
   * Creates a new folder in Google Drive for an event
   * @param {string} eventName 
   * @returns {Promise<string>} folderId
   */
  async createEventFolder(eventName) {
    if (!this.drive) return null;

    try {
      const fileMetadata = {
        name: `Huddle Event: ${eventName}`,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
        fileMetadata.parents = [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID];
      }
      
      const folder = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });
      
      console.log(`[DriveService] Created folder for event: ${eventName} (${folder.data.id})`);
      return { id: folder.data.id, link: folder.data.webViewLink };
    } catch (error) {
      console.error("[DriveService] Error creating folder:", error);
      return null;
    }
  }

  /**
   * Deletes a file from Google Drive
   * @param {string} fileId 
   */
  async deletePhoto(fileId) {
    if (!this.drive || !fileId) return;
    try {
      await this.drive.files.delete({ fileId });
      console.log(`[DriveService] Deleted file ${fileId}`);
    } catch (error) {
      console.error("[DriveService] Error deleting photo:", error);
    }
  }

  /**
   * Uploads a file buffer to a specific Google Drive folder
   * @param {string} folderId 
   * @param {Buffer} fileBuffer 
   * @param {string} mimeType 
   * @param {string} userName
   * @returns {Promise<{fileId: string, webViewLink: string}>}
   */
  async uploadPhoto(folderId, fileBuffer, mimeType, filename, userId, userName) {
    if (!this.drive) return null;

    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const fileMetadata = {
        name: filename,
        parents: [folderId],
        appProperties: {
          userId: userId || 'unknown',
          userName: userName || 'Unknown User'
        }
      };
      
      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });
      
      return {
        fileId: file.data.id,
        webViewLink: file.data.webViewLink
      };
    } catch (error) {
      console.error("[DriveService] Error uploading photo:", error);
      return null;
    }
  }

  /**
   * Shares a folder with a specific user email
   * @param {string} folderId 
   * @param {string} email 
   */
  async shareFolderWithUser(folderId, email) {
    if (!this.drive || !folderId || !email) return;

    try {
      await this.drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: email,
        },
        sendNotificationEmail: true,
      });
      console.log(`[DriveService] Shared folder ${folderId} with ${email}`);
    } catch (error) {
      console.error(`[DriveService] Error sharing folder with ${email}:`, error);
    }
  }
  /**
   * Gets a stream for a file from Google Drive
   * @param {string} fileId 
   * @returns {Promise<stream.Readable>}
   */
  
  /**
   * Lists files in a specific Google Drive folder
   * @param {string} folderId 
   * @returns {Promise<Array>}
   */
  async listFiles(folderId) {
    if (!this.drive || !folderId) return [];
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, webViewLink, thumbnailLink, appProperties, properties)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      return response.data.files || [];
    } catch (error) {
      console.error("[DriveService] Error listing files:", error);
      return [];
    }
  }

  async getFileStream(fileId) {
    if (!this.drive || !fileId) return null;
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return response.data;
    } catch (error) {
      console.error(`[DriveService] Error getting file stream for ${fileId}:`, error);
      return null;
    }
  }
}

module.exports = new DriveService();
