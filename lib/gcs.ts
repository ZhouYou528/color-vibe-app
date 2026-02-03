import { Storage } from "@google-cloud/storage";

let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) {
    // Initialize Storage client
    // Supports multiple authentication methods:
    // 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON file)
    // 2. GCP_SERVICE_ACCOUNT_KEY env var (inline JSON string)
    // 3. Application Default Credentials (ADC) - if neither is set, uses gcloud auth
    //    This is the recommended approach when service account key creation is disabled
    let credentials;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Path to JSON file - SDK will read from env var automatically
      credentials = undefined;
    } else if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
      // Inline JSON string
      try {
        credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
      } catch (e) {
        console.error("Failed to parse GCP_SERVICE_ACCOUNT_KEY", e);
        // Fall back to ADC
        credentials = undefined;
      }
    } else {
      // No explicit credentials - use Application Default Credentials
      // This works with: gcloud auth application-default login
      credentials = undefined;
    }

    storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      // If credentials is undefined, SDK will use ADC automatically
      ...(credentials && { credentials }),
    });
  }
  return storage;
}

export async function uploadImage(
  userId: string,
  cardId: string,
  imageIndex: number,
  imageBuffer: Buffer,
  contentType: string = "image/webp"
): Promise<string> {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    throw new Error("GCS_BUCKET environment variable is not set");
  }

  const storage = getStorage();
  const bucket = storage.bucket(bucketName);

  // Path: users/{userId}/cards/{cardId}/{index}.webp
  const fileName = `users/${userId}/cards/${cardId}/${imageIndex}.webp`;

  const file = bucket.file(fileName);

  // Upload the file
  await file.save(imageBuffer, {
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000", // Cache for 1 year
    },
  });

  // Return public URL
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

export async function deleteCardImages(userId: string, cardId: string): Promise<void> {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    throw new Error("GCS_BUCKET environment variable is not set");
  }

  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const prefix = `users/${userId}/cards/${cardId}/`;

  // List all files with this prefix
  const [files] = await bucket.getFiles({ prefix });

  // Delete all files
  await Promise.all(files.map((file) => file.delete()));
}
