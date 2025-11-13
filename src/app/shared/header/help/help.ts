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
  selector: 'app-help',
  standalone: true,
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  private location = inject(Location);

  onClose(): void {
    this.location.back();
  }
}
