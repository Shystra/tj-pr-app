import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { HikCentralService } from '../../core/service/hik-central.service';
import { CnaService } from '../../core/service/cna.service';
import { OnlyLettersInputDirective } from '../../shared/directives/only-letters.directive';
import { OrgInfo } from '../../core/models/hik-organization.model';
import { AccessType, HikPersonRequest } from '../../core/models/hik-person.model';
import { PrivilegeGroupInfo } from '../../core/models/hik-privilege-group.model';
import { FaceGroupInfo } from '../../core/models/hik-face-group.model';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
    OnlyLettersInputDirective,
    NgxMaskDirective
  ],
  templateUrl: './control.component.html',
  styleUrl: './control.component.scss'
})
export class ControlComponent implements OnInit {

  form!: FormGroup;
  fotoPreview: string | null = null;
  privilegeGroups: PrivilegeGroupInfo[] = [];
  isLoading = false;
  isLoadingCna = false;
  isLoadingGroups = false;
  oabSemUf = false;
  selectedGroupId = '';
  faceGroups: FaceGroupInfo[] = [];
  isLoadingFaceGroups = false;

  // Organização — select com busca client-side
  allOrganizations: OrgInfo[] = [];
  isLoadingOrgs = false;
  orgFilter = '';
  showOrgDropdown = false;
  orgSelecionada: OrgInfo | null = null;
  private isClickingDropdown = false;

  constructor(
    private fb: FormBuilder,
    private hikService: HikCentralService,
    private cnaService: CnaService,
    private snackBar: MatSnackBar
  ) { }

  get isPermanente(): boolean {
    return this.form.get('tipoAcesso')?.value === 'PERMANENTE';
  }

  get hoje(): string {
    return new Date().toISOString().slice(0, 16);
  }

  get filteredOrgs(): OrgInfo[] {
    const q = this.orgFilter.toLowerCase().trim();
    if (!q) return this.allOrganizations;
    return this.allOrganizations.filter(o => o.orgName.toLowerCase().includes(q));
  }

  ngOnInit() {
    this.form = this.fb.group({
      cpf: [''],
      oab: ['', Validators.required],
      uf: ['', Validators.required],
      accessType: [AccessType.Visitor, Validators.required],
      personGivenName: ['', Validators.required],
      personFamilyName: ['', Validators.required],
      orgIndexCode: ['', Validators.required],
      ddd: [null],
      phoneNo: [''],
      email: ['', Validators.email],
      inscricao: [null],
      faceData: [''],
      faceGroupIndexCode: [[]],
      tipoAcesso: ['PERMANENTE', Validators.required],
      beginTime: [''],
      endTime: ['']
    });

    this.ouvirTipoAcesso();
    this.loadAllOrganizations();
    this.loadPrivilegeGroups();
    this.loadFaceGroups();
  }

  // ─── Organização ──────────────────────────────────────────────

  loadAllOrganizations() {
    this.isLoadingOrgs = true;
    this.hikService.listarOrganizacoes(1, 500, undefined, '0').subscribe({
      next: (res) => {
        this.allOrganizations = res.list ?? [];
        this.isLoadingOrgs = false;
      },
      error: () => {
        this.isLoadingOrgs = false;
      }
    });
  }

  abrirOrgDropdown() {
    if (!this.isLoadingOrgs) {
      this.showOrgDropdown = true;
    }
  }

  selecionarOrg(org: OrgInfo) {
    this.orgSelecionada = org;
    this.orgFilter = '';
    this.showOrgDropdown = false;
    this.form.patchValue({ orgIndexCode: org.orgIndexCode });
  }

  onDropdownPanelMousedown() {
    this.isClickingDropdown = true;
  }

  fecharOrgDropdown() {
    setTimeout(() => {
      if (!this.isClickingDropdown) {
        this.showOrgDropdown = false;
      }
      this.isClickingDropdown = false;
    }, 150);
  }

  limparOrg() {
    this.orgSelecionada = null;
    this.orgFilter = '';
    this.form.patchValue({ orgIndexCode: '' });
  }

  // ─── Tipo de acesso ───────────────────────────────────────────

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

  // ─── Grupos de privilégio ─────────────────────────────────────

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

  onGroupChange(groupId: string) {
    this.selectedGroupId = groupId;
  }

  // ─── Grupos de face ───────────────────────────────────────────

  loadFaceGroups() {
    this.isLoadingFaceGroups = true;
    this.hikService.listarGruposFace({ pageNo: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.faceGroups = res.list ?? [];
        this.isLoadingFaceGroups = false;
      },
      error: () => {
        this.isLoadingFaceGroups = false;
      }
    });
  }

  isFaceGroupSelected(indexCode: string): boolean {
    const current: string[] = this.form.get('faceGroupIndexCode')?.value ?? [];
    return current.includes(indexCode);
  }

  toggleFaceGroup(indexCode: string) {
    const current: string[] = this.form.get('faceGroupIndexCode')?.value ?? [];
    const updated = current.includes(indexCode)
      ? current.filter(c => c !== indexCode)
      : [...current, indexCode];
    this.form.patchValue({ faceGroupIndexCode: updated });
  }

  // ─── CNA ──────────────────────────────────────────────────────

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
          ddd: res.ddd ?? null,
          phoneNo: res.telefone ?? '',
          cpf: res.cpf ?? '',
          inscricao: res.inscricao ?? null
        });

        if (res.numeroSeguranca) {
          this.cnaService.buscarImagem(res.numeroSeguranca).subscribe({
            next: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                this.fotoPreview = dataUrl;
                this.form.patchValue({ faceData: dataUrl.split(',')[1] });
              };
              reader.readAsDataURL(blob);
              this.isLoadingCna = false;
            },
            error: () => {
              this.isLoadingCna = false;
            }
          });
        } else {
          this.isLoadingCna = false;
        }
      },
      error: () => {
        this.isLoadingCna = false;
      }
    });
  }

  onOabFocus() {
    this.oabSemUf = !this.form.value.uf;
  }

  // ─── Foto ─────────────────────────────────────────────────────

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

  // ─── Datas com fuso horário local ─────────────────────────────

  private toLocalISOString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const hh = pad(Math.floor(abs / 60));
    const mm = pad(abs % 60);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hh}:${mm}`;
  }

  private resolverDatas(): { beginTime: string; endTime: string } {
    if (this.isPermanente) {
      const inicio = new Date();
      const fim = new Date(inicio);
      fim.setFullYear(fim.getFullYear() + 10);

      this.snackBar.open('Acesso permanente limitado a 10 anos pelo sistema.', 'Ok', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snack-info']
      });

      return {
        beginTime: this.toLocalISOString(inicio),
        endTime: this.toLocalISOString(fim)
      };
    }

    return {
      beginTime: this.toLocalISOString(new Date(this.form.value.beginTime)),
      endTime: this.toLocalISOString(new Date(this.form.value.endTime))
    };
  }

  // ─── Registrar ────────────────────────────────────────────────

  registrar() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { beginTime, endTime } = this.resolverDatas();

    const payload: HikPersonRequest = {
      accessType: this.form.value.accessType,
      personGivenName: this.form.value.personGivenName,
      personFamilyName: this.form.value.personFamilyName,
      orgIndexCode: this.form.value.orgIndexCode,
      privilegeGroupId: this.selectedGroupId,
      phoneNo: this.form.value.phoneNo,
      email: this.form.value.email,
      cpf: this.form.value.cpf,
      ddd: this.form.value.ddd || null,
      inscricao: this.form.value.inscricao || null,
      faceData: this.form.value.faceData,
      faceGroupIndexCode: this.form.value.faceGroupIndexCode,
      beginTime,
      endTime
    };

    this.hikService.cadastrarPessoa(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.selectedGroupId = '';
        this.orgSelecionada = null;
        this.orgFilter = '';
        this.form.reset({ tipoAcesso: 'PERMANENTE', accessType: AccessType.Visitor });
        this.fotoPreview = null;
        this.snackBar.open('Acesso cadastrado com sucesso!', 'Fechar', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-success']
        });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao cadastrar acesso. Tente novamente.', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-error']
        });
      }
    });
  }
}
