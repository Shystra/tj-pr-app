import { Directive, HostListener } from '@angular/core';
import { STRING_EMPTY } from '../constants/string-consts';

@Directive({
  selector: '[onlyLettersInput]',
  standalone: true
})
export class OnlyLettersInputDirective {

  private regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]$/;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];

    if (allowedKeys.includes(event.key))
      return;

    if (!this.regex.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || STRING_EMPTY;
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(pasted)) {
      event.preventDefault();
    }
  }
}
