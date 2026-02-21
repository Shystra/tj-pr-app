import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslateModule,
    MatMenuModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  public readonly urlInstagram = 'https://www.instagram.com/bella_hairpt/';
  public readonly urlFacebook = 'https://www.facebook.com/profile.php?id=61556915005333';
  public readonly urlTikTok = 'https://www.tiktok.com/@leandro.oliveira4445';

  constructor(

  ) {
  }

  currentYear = new Date().getFullYear();

}
