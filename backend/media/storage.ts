import { Bucket, Remover } from "encore.dev/storage/objects";

export const mediaStorage = new Bucket("church-media", {
  public: true,
});

export const mediaStorageRemover = mediaStorage.ref<Remover>();
