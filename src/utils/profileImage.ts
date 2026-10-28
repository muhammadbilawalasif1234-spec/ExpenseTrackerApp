import * as FileSystem from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

export const persistProfileImage = async (
  asset: ImagePickerAsset,
): Promise<string> => {
  if (!asset.uri) {
    throw new Error("The selected image does not have a valid file URI.");
  }

  if (!FileSystem.documentDirectory) {
    throw new Error("Profile photo storage is unavailable on this device.");
  }

  const mimeExtension = asset.mimeType?.split("/")[1]?.replace("jpeg", "jpg");
  const suppliedExtension = asset.fileName?.includes(".")
    ? asset.fileName.split(".").pop()
    : undefined;
  const extension =
    (suppliedExtension || mimeExtension || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const destination = `${FileSystem.documentDirectory}profile-avatar-${Date.now()}.${extension}`;

  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
};
