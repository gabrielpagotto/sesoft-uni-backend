export function validateUsername(username: string): string | null {
    if (!/^[a-zA-Z0-9_]/.test(username)) {
        return 'Username must start with an alphanumeric character or underscore.';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return 'Username can only contain alphanumeric characters, underscores, and hyphens.';
    }
    if (username.length > 15) {
        return "Username can't be longer than 15 characters.";
    }
    return null;
}
