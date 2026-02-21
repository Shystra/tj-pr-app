import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OverviewComponent {


}
