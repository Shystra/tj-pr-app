import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-analystic',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './analystic.component.html',
  styleUrl: './analystic.component.scss',
})
export class AnalysticComponent {


}
