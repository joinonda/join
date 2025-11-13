import {
  Component,
  Input,
  inject,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { Location } from '@angular/common';

@Component({
  selector: 'app-legalnotice',
  standalone: true,
  imports: [],
  templateUrl: './legalnotice.html',
  styleUrl: './legalnotice.scss',
})
export class Legalnotice {
  private location = inject(Location);

  onClose(): void {
    this.location.back();
  }
}
