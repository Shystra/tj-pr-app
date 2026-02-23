import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-control',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './control.component.html',
  styleUrl: './control.component.scss',
})
export class ControlComponent {

  form: FormGroup;
  fotoPreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      rg: [''],
      oab: [''],
      uf: [''],
      telefone: [''],
      email: [''],
      setor: [''],
      numeroCartao: ['', Validators.required],
      tipoCartao: [''],
      tipoMovimentacao: [''],
      loginRede: [''],
      numeroSeguranca: [''],
      destino: [''],
      observacoes: ['']
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }
}
