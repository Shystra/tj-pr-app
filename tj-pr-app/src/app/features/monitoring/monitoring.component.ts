import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface Activity {
  name: string;
  type: 'Entrada' | 'Saída';
  location: string;
  time: string;
  cardNumber: string;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss',
})
export class MonitoringComponent {

  activities: Activity[] = [
    {
      name: 'Pedro Oliveira',
      type: 'Entrada',
      location: '3º Andar - Presidência',
      time: 'Agora',
      cardNumber: '#1877'
    },
    {
      name: 'Maria Souza',
      type: 'Saída',
      location: '2º Andar - Administrativo',
      time: '5 min atrás',
      cardNumber: '#2214'
    },
    {
      name: 'João Pereira',
      type: 'Entrada',
      location: 'Térreo - Recepção',
      time: '12 min atrás',
      cardNumber: '#3321'
    }
  ];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

}
