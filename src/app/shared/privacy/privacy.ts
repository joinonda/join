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
  selector: 'app-privacy',
  standalone: true,
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  private location = inject(Location);

  onClose(): void {
    this.location.back();
  }
}
