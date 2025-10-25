
/**
 * Interfaces para los cuerpos de las peticiones (requests) a la API.
 */

// --- Auth ---

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}
