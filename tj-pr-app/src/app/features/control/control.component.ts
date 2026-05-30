import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
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
export class ControlComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  fotoPreview: string | null = null;
  privilegeGroups: PrivilegeGroupInfo[] = [];
  isLoading = false;
  isLoadingCna = false;
  isLoadingGroups = false;
  oabSemUf = false;
  cnaData: AdvogadoCnaResponse | null = null;
  selectedGroupId = '';
  faceGroups: FaceGroupInfo[] = [];
  isLoadingFaceGroups = false;

  cidadeQuery = '';
  cidadeSugestoes: OrgInfo[] = [];
  isLoadingCidade = false;
  showSugestoes = false;
  cidadeSelecionada: OrgInfo | null = null;

  private cidadeSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();

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
      // tipoPessoa: ['VISITANTE', Validators.required],
      cpf: [''],
      oab: ['', Validators.required],
      uf: ['', Validators.required],
      accessType: [AccessType.Employee, Validators.required],
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
    this.iniciarBuscaCidade();
    this.loadPrivilegeGroups();
    this.loadFaceGroups();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private iniciarBuscaCidade() {
    this.cidadeSearch$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.cidadeSugestoes = [];
          this.showSugestoes = false;
          return of(null);
        }
        this.isLoadingCidade = true;
        return this.hikService.listarOrganizacoes(1, 10, query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.isLoadingCidade = false;
        if (res) {
          this.cidadeSugestoes = res.list ?? [];
          this.showSugestoes = this.cidadeSugestoes.length > 0;
        }
      },
      error: () => {
        this.isLoadingCidade = false;
      }
    });
  }

  onCidadeInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.cidadeQuery = value;
    this.cidadeSelecionada = null;
    this.form.patchValue({ orgIndexCode: '' });
    this.cidadeSearch$.next(value);
  }

  selecionarCidade(org: OrgInfo) {
    this.cidadeSelecionada = org;
    this.cidadeQuery = org.orgName;
    this.showSugestoes = false;
    this.cidadeSugestoes = [];
    this.form.patchValue({ orgIndexCode: org.orgIndexCode });
  }

  fecharSugestoes() {
    setTimeout(() => { this.showSugestoes = false; }, 150);
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
        this.isLoadingFaceGroups = false;
      },
      error: () => {
        this.isLoadingFaceGroups = false;
      }
    });
  }

  onGroupChange(groupId: string) {
    this.selectedGroupId = groupId;
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

  registrar() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { beginTime, endTime } = this.resolverDatas();

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
      advogadoInfo: this.cnaData
    };

    this.hikService.cadastrarPessoa(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.cnaData = null;
        this.selectedGroupId = '';
        this.cidadeQuery = '';
        this.cidadeSelecionada = null;
        this.cidadeSugestoes = [];
        this.form.reset({ tipoAcesso: 'PERMANENTE', accessType: AccessType.Employee });
        this.fotoPreview = null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
