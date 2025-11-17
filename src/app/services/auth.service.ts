import { inject, Injectable, signal, runInInjectionContext, Injector } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';

/** Type representing the authentication state: guest, firebase, or null. */
type AuthState = 'guest' | 'firebase' | null;

/**
 * Service for managing user authentication.
 * Handles Firebase authentication, guest mode, and user state management.
 * Persists authentication state in localStorage and syncs with Firebase auth state.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Firebase Auth instance for authentication operations. */
  private auth = inject(Auth);
  /** Router service for navigation after sign out. */
  private router = inject(Router);
  /** Injector for running Firebase operations in injection context. */
  private injector = inject(Injector);
  /** Signal containing the current Firebase user or null. */
  private currentUser = signal<User | null>(null);
  /** Signal containing the current authentication state. */
  private authState = signal<AuthState>(null);
  /** LocalStorage key for persisting authentication state. */
  private readonly STORAGE_KEY = 'join_auth_state';

  /**
   * Initializes the service by loading saved auth state and setting up Firebase listener.
   */
  constructor() {
    this.loadSavedAuthState();
    this.setupAuthStateListener();
  }

  /** Loads the saved authentication state from localStorage and restores guest mode if applicable. */
  private loadSavedAuthState(): void {
    const savedState = localStorage.getItem(this.STORAGE_KEY) as AuthState;
    if (savedState === 'guest') {
      this.authState.set('guest');
    }
  }

  /** Sets up Firebase authentication state change listener to sync user state. */
  private setupAuthStateListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.handleUserLoggedIn(user);
      } else {
        this.handleUserLoggedOut();
      }
    });
  }

  /**
   * Handles when a user is logged in via Firebase.
   * @param user - The Firebase user object.
   */
  private handleUserLoggedIn(user: User): void {
    this.currentUser.set(user);
    this.authState.set('firebase');
    localStorage.setItem(this.STORAGE_KEY, 'firebase');
  }

  /** Handles when a user is logged out, preserving guest mode if active. */
  private handleUserLoggedOut(): void {
    if (this.authState() === 'guest') {
      return;
    }
    this.clearAuthState();
  }

  /** Clears all authentication state and removes it from localStorage. */
  private clearAuthState(): void {
    this.currentUser.set(null);
    this.authState.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Creates a new user account with email and password.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns Promise resolving to the user credential.
   */
  signUp(email: string, password: string) {
    return runInInjectionContext(this.injector, () => {
      return createUserWithEmailAndPassword(this.auth, email, password);
    });
  }

  /**
   * Signs in an existing user with email and password.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns Promise resolving to the user credential.
   */
  signIn(email: string, password: string) {
    return runInInjectionContext(this.injector, () => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  /** Sets the authentication state to guest mode and persists it in localStorage. */
  loginAsGuest() {
    this.authState.set('guest');
    localStorage.setItem(this.STORAGE_KEY, 'guest');
  }

  /**
   * Signs out the current user (Firebase or guest).
   * Clears all authentication data and navigates to the login page.
   */
  async signOut() {
    await this.signOutFirebaseIfNeeded();
    this.clearAllAuthData();
    this.navigateToLogin();
  }

  /** Signs out from Firebase if the user is authenticated via Firebase. */
  private async signOutFirebaseIfNeeded(): Promise<void> {
    if (this.authState() === 'firebase') {
      await runInInjectionContext(this.injector, async () => {
        await signOut(this.auth);
      });
    }
  }

  /** Clears all authentication data including session storage. */
  private clearAllAuthData(): void {
    this.clearAuthState();
    sessionStorage.removeItem('greetingShown');
  }

  /** Navigates to the login page. */
  private navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Checks if a user is currently logged in (Firebase or guest).
   * @returns True if user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.authState() !== null;
  }

  /**
   * Checks if the current user is a guest.
   * @returns True if user is in guest mode, false otherwise.
   */
  isGuest(): boolean {
    return this.authState() === 'guest';
  }

  /**
   * Gets the current Firebase user object.
   * @returns The Firebase user object or null if not authenticated via Firebase.
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Gets the user's initials for display purposes.
   * Returns 'GU' for guests, extracts from display name or email for Firebase users.
   * @returns Uppercase initials string (e.g., "JD" for "John Doe", "GU" for guest, "UU" for unknown).
   */
  getUserInitials(): string {
    if (this.isGuest()) {
      return 'GU';
    }
    return this.getUserInitialsFromUser();
  }

  /**
   * Gets initials from the current Firebase user.
   * Prioritizes display name, falls back to email.
   * @returns User initials or 'UU' if user data is unavailable.
   */
  private getUserInitialsFromUser(): string {
    const user = this.currentUser();
    if (!user) return 'UU';

    if (user.displayName) {
      return this.getInitialsFromDisplayName(user.displayName);
    }
    if (user.email) {
      return this.getInitialsFromEmail(user.email);
    }
    return 'UU';
  }

  /**
   * Extracts initials from a display name string.
   * Handles full names (first + last initial) or single names (first 2 chars).
   * @param displayName - The display name to extract initials from.
   * @returns Uppercase initials or 'UU' if name is invalid.
   */
  private getInitialsFromDisplayName(displayName: string): string {
    const nameParts = displayName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return this.getInitialsFromFullName(nameParts);
    }
    if (nameParts.length === 1 && nameParts[0].length >= 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return 'UU';
  }

  /**
   * Extracts initials from a full name (first and last name).
   * @param nameParts - Array of name parts split by whitespace.
   * @returns Uppercase string with first letter of first and last name.
   */
  private getInitialsFromFullName(nameParts: string[]): string {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  /**
   * Extracts initials from an email address.
   * Uses the first two characters before the @ symbol.
   * @param email - The email address to extract from.
   * @returns Uppercase string with first two characters of email username.
   */
  private getInitialsFromEmail(email: string): string {
    return email.substring(0, 2).toUpperCase();
  }
}
