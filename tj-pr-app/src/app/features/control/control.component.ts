import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { HikCentralService } from '../../core/service/hik-central.service';
import { CnaService } from '../../core/service/cna.service';
import { OnlyLettersInputDirective } from '../../shared/directives/only-letters.directive';
import { OrgInfo } from '../../core/models/hik-organization.model';
import { AccessType, HikPersonRequest } from '../../core/models/hik-person.model';
import { PrivilegeGroupInfo } from '../../core/models/hik-privilege-group.model';
import { AdvogadoCnaResponse } from '../../core/models/cna.model';
import { FaceGroupInfo } from '../../core/models/hik-face-group.model';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [
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
  oabSemUf = false;
  cnaData: AdvogadoCnaResponse | null = null;
  selectedGroupId = '';
  faceGroups: FaceGroupInfo[] = [];
  isLoadingFaceGroups = false;

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
      oab: ['', Validators.required],
      uf: ['', Validators.required],
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
    this.loadFaceGroups();
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

        if (this.organizations.length > 0 && this.organizations[0].orgIndexCode) {
          this.form.patchValue({ orgIndexCode: this.organizations[0].orgIndexCode });
        }

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

        if (this.privilegeGroups.length > 0 && this.privilegeGroups[0].privilegeGroupId) {
          this.onGroupChange(this.privilegeGroups[0].privilegeGroupId);
        }

        this.isLoadingGroups = false;
      },
      error: () => {
        this.isLoadingGroups = false;
      }
    });
  }

  loadFaceGroups() {
    this.isLoadingFaceGroups = true;
    this.hikService.listarGruposFace({ pageNo: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.faceGroups = res.list ?? [];

        const allIndexCodes = this.faceGroups.map(g => g.indexCode).filter(Boolean);

        if (allIndexCodes.length > 0) {
          this.form.patchValue({ faceGroupIndexCode: allIndexCodes });
        }

        this.isLoadingFaceGroups = false;
      },
      error: () => {
        this.isLoadingFaceGroups = false;
      }
    });
  }

  onGroupChange(groupId: string) {
    this.selectedGroupId = groupId;
    this.form.patchValue({ faceGroupIndexCode: groupId ? [groupId] : [] });
  }

  isGroupSelected(groupId: string): boolean {
    const current: string[] = this.form.get('faceGroupIndexCode')?.value ?? [];
    return current.includes(groupId);
  }

  consultarCna() {
    const { uf, oab } = this.form.value;
    if (!uf || !oab)
      return;

    this.isLoadingCna = true;
    this.cnaService.consultarAdvogado(uf, oab).subscribe({
      next: (res) => {
        this.cnaData = res;

        const partes = res.nome.split(' ');
        const telefoneCompleto = res.ddd && res.telefone
          ? `${res.ddd}${res.telefone}`
          : res.telefone ?? '';

        this.form.patchValue({
          personGivenName: partes[0],
          personFamilyName: partes.slice(1).join(' '),
          email: res.email ?? '',
          phoneNo: telefoneCompleto,
          cpf: res.cpf ?? ''
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

  onOabFocus() {
    this.oabSemUf = !this.form.value.uf;
  }

  onFaceGroupChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions).map(opt => opt.value);
    this.form.patchValue({ faceGroupIndexCode: selected });
  }

  registrar() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { beginTime, endTime } = this.resolverDatas();
    const isAdvogado = this.form.value.tipoPessoa === 'ADVOGADO';

    const payload: HikPersonRequest = {
      accessType: this.form.value.accessType,
      personGivenName: this.form.value.personGivenName,
      personFamilyName: this.form.value.personFamilyName,
      gender: this.form.value.gender,
      orgIndexCode: this.form.value.orgIndexCode,
      privilegeGroupId: this.selectedGroupId,
      phoneNo: this.form.value.phoneNo,
      email: this.form.value.email,
      remark: this.form.value.remark,
      faceData: this.form.value.faceData,
      faceGroupIndexCode: this.form.value.faceGroupIndexCode,
      beginTime,
      endTime,
      advogadoInfo: isAdvogado ? this.cnaData : null
    };

    this.hikService.cadastrarPessoa(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.cnaData = null;
        this.selectedGroupId = '';
        this.form.reset({ tipoPessoa: 'VISITANTE', tipoAcesso: 'PERMANENTE' });
        this.fotoPreview = null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
