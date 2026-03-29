import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { HikCentralService } from '../../core/service/hik-central.service';
import { CnaService } from '../../core/service/cna.service';
import { OnlyLettersInputDirective } from '../../shared/directives/only-letters.directive';
import { OrgInfo } from '../../core/models/hik-organization.model';
import { AccessType } from '../../core/models/hik-person.model';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    OnlyLettersInputDirective,
    NgxMaskDirective
  ],
  templateUrl: './control.component.html',
  styleUrl: './control.component.scss'
})
export class ControlComponent implements OnInit {

  form!: FormGroup;
  fotoPreview: string | null = null;
  organizations: OrgInfo[] = [];
  isLoading = false;
  isLoadingCna = false;
  isLoadingOrgs = false;

  constructor(
    private fb: FormBuilder,
    private hikService: HikCentralService,
    private cnaService: CnaService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      tipoPessoa: ['VISITANTE', Validators.required],
      cpf: [''],
      oab: [''],
      uf: [''],
      accessType: [AccessType.Visitor, Validators.required],
      personGivenName: ['', Validators.required],
      personFamilyName: ['', Validators.required],
      gender: [1],
      orgIndexCode: ['', Validators.required],
      phoneNo: [''],
      email: ['', Validators.email],
      remark: [''],
      faceData: [''],
      faceGroupIndexCode: [[]],
      beginTime: [''],
      endTime: ['']
    });

    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoadingOrgs = true;
    this.hikService.listarOrganizacoes(1, 50).subscribe({
      next: (res) => {
        this.organizations = res.list;
        this.isLoadingOrgs = false;
      },
      error: () => {
        this.isLoadingOrgs = false;
      }
    });
  }

  consultarCna() {
    const { uf, oab } = this.form.value;
    if (!uf || !oab) return;

    this.isLoadingCna = true;
    this.cnaService.consultarAdvogado(uf, oab).subscribe({
      next: (res) => {
        const partes = res.nome.split(' ');
        this.form.patchValue({
          personGivenName: partes[0],
          personFamilyName: partes.slice(1).join(' '),
          email: res.email ?? '',
          phoneNo: res.telefone ?? ''
        });
        this.isLoadingCna = false;
      },
      error: () => {
        this.isLoadingCna = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.form.patchValue({ faceData: base64 });
      this.fotoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  registrar() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.form.patchValue({
      beginTime: new Date().toISOString()
    });

    this.hikService.cadastrarPessoa(this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.fotoPreview = null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

}
