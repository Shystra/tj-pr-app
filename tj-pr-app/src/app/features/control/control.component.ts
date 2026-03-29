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
import { PrivilegeGroupInfo } from '../../core/models/hik-privilege-group.model';

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
  privilegeGroups: PrivilegeGroupInfo[] = [];
  isLoading = false;
  isLoadingCna = false;
  isLoadingOrgs = false;
  isLoadingGroups = false;

  constructor(
    private fb: FormBuilder,
    private hikService: HikCentralService,
    private cnaService: CnaService
  ) { }

  get isPermanente(): boolean {
    return this.form.get('tipoAcesso')?.value === 'PERMANENTE';
  }

  get hoje(): string {
    return new Date().toISOString().slice(0, 16);
  }

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
      tipoAcesso: ['PERMANENTE', Validators.required],
      beginTime: [''],
      endTime: ['']
    });

    this.ouvirTipoAcesso();
    this.loadOrganizations();
    this.loadPrivilegeGroups();
  }

  private ouvirTipoAcesso() {
    this.form.get('tipoAcesso')?.valueChanges.subscribe(valor => {
      const beginControl = this.form.get('beginTime');
      const endControl = this.form.get('endTime');

      if (valor === 'TEMPORARIO') {
        beginControl?.setValidators(Validators.required);
        endControl?.setValidators(Validators.required);
      } else {
        beginControl?.clearValidators();
        endControl?.clearValidators();
        beginControl?.setValue('');
        endControl?.setValue('');
      }

      beginControl?.updateValueAndValidity();
      endControl?.updateValueAndValidity();
    });
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

  loadPrivilegeGroups() {
    this.isLoadingGroups = true;
    this.hikService.listarGruposPrivilegio({ pageNo: 1, pageSize: 50, type: 1 }).subscribe({
      next: (res) => {
        this.privilegeGroups = res.list ?? [];
        this.isLoadingGroups = false;
      },
      error: () => {
        this.isLoadingGroups = false;
      }
    });
  }

  onGroupChange(groupId: string, checked: boolean) {
    const current: string[] = this.form.get('faceGroupIndexCode')?.value ?? [];

    const updated = checked
      ? [...current, groupId]
      : current.filter(id => id !== groupId);

    this.form.patchValue({ faceGroupIndexCode: updated });
  }

  isGroupSelected(groupId: string): boolean {
    const current: string[] = this.form.get('faceGroupIndexCode')?.value ?? [];
    return current.includes(groupId);
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

  private resolverDatas(): { beginTime: string; endTime: string } {
    if (this.isPermanente) {
      return {
        beginTime: new Date().toISOString(),
        endTime: new Date('2099-12-31T23:59:59').toISOString()
      };
    }

    return {
      beginTime: new Date(this.form.value.beginTime).toISOString(),
      endTime: new Date(this.form.value.endTime).toISOString()
    };
  }

  registrar() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { beginTime, endTime } = this.resolverDatas();

    const payload = {
      ...this.form.value,
      beginTime,
      endTime
    };

    this.hikService.cadastrarPessoa(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset({ tipoPessoa: 'VISITANTE', tipoAcesso: 'PERMANENTE' });
        this.fotoPreview = null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
