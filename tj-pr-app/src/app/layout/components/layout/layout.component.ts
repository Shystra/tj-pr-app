import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { MatTabsModule } from '@angular/material/tabs';
import { OverviewComponent } from '../../../features/overview/overview.component';
import { ControlComponent } from '../../../features/control/control.component';
import { MonitoringComponent } from '../../../features/monitoring/monitoring.component';
import { AnalysticComponent } from '../../../features/analystic/analystic.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    TranslateModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    RouterModule,
    HeaderComponent,
    MatTabsModule,
    OverviewComponent,
    ControlComponent,
    MonitoringComponent,
    AnalysticComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutComponent {


  constructor(

  ) {
  }

}
