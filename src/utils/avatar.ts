import { deleteFile, uploadFile } from "@/lib/minio";

// Stores a user's new avatar and returns its key. The upload is awaited, so
// a storage failure reaches the caller instead of the action reporting
// success. The old file is removed only after the new one is stored, and only
// when its key differs (a new image of the same type overwrites it); failing
// to remove it leaves a stray file but the change still stands.
export async function replaceAvatar(userId: number, oldKey: string | null, avatar: File) {
    const key = `user/${userId}/avatar.${avatar.type.split("/")[1]}`;
    await uploadFile(key, avatar);

    if (oldKey && oldKey !== key) {
        await deleteFile(oldKey).catch((error) => console.error("Error: ", error));
    }

    return key;
}
