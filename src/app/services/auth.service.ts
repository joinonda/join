import { inject, Injectable, signal, runInInjectionContext, Injector } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';

type AuthState = 'guest' | 'firebase' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private injector = inject(Injector);
  private currentUser = signal<User | null>(null);
  private authState = signal<AuthState>(null);
  private readonly STORAGE_KEY = 'join_auth_state';

  constructor() {
    const savedState = localStorage.getItem(this.STORAGE_KEY) as AuthState;
    if (savedState === 'guest') {
      this.authState.set('guest');
    }

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser.set(user);
        this.authState.set('firebase');
        localStorage.setItem(this.STORAGE_KEY, 'firebase');
      } else if (this.authState() === 'guest') {
        return;
      } else {
        this.currentUser.set(null);
        this.authState.set(null);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  signUp(email: string, password: string) {
    return runInInjectionContext(this.injector, () => {
      return createUserWithEmailAndPassword(this.auth, email, password);
    });
  }

  signIn(email: string, password: string) {
    return runInInjectionContext(this.injector, () => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  loginAsGuest() {
    this.authState.set('guest');
    localStorage.setItem(this.STORAGE_KEY, 'guest');
  }

  async signOut() {
    const state = this.authState();
    
    if (state === 'firebase') {
      await runInInjectionContext(this.injector, async () => {
        await signOut(this.auth);
      });
    }
    
    this.authState.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem('greetingShown');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authState() !== null;
  }

  isGuest(): boolean {
    return this.authState() === 'guest';
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  getUserInitials(): string {
    const state = this.authState();
    
    if (state === 'guest') {
      return 'GU';
    }

    const user = this.currentUser();
    if (!user) return 'UU';

    if (user.displayName) {
      const nameParts = user.displayName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        return (firstName[0] + lastName[0]).toUpperCase();
      }
      if (nameParts.length === 1 && nameParts[0].length >= 2) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return 'UU';
  }
}
