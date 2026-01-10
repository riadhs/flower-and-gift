export function setAdminToken(token) {
  localStorage.setItem("admin_token", token);
}

export function getAdminToken() {
  return localStorage.getItem("admin_token");
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

export function isAuthed() {
  return Boolean(getAdminToken());
}
