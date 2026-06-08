// src/services/pb.ts
// Todo el acceso a PocketBase en la app pasa por esta instancia única
// para mantener el auth store consistente en toda la aplicación.
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
