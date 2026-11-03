import { RequestAuthError } from "@/server/auth/request-auth";

export class LearningConflictError extends RequestAuthError {
  readonly code = "LEARNING_SAVE_CONFLICT";
  constructor() {
    super("Seu percurso foi salvo em outra aba. Confira as duas versões antes de continuar.", 409);
    this.name = "LearningConflictError";
  }
}
