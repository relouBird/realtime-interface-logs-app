// Définition des types d'événements (optionnel, mais recommandé)
export type SeoMetaOptions = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  forcePrefix?: boolean;
};

export const CRUD_ACTION = {
  CREATE: "create",
  UPDATE: "update",
  READ: "read",
} as const;

export type CRUD_ACTION = (typeof CRUD_ACTION)[keyof typeof CRUD_ACTION];
