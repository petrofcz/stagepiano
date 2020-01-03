import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, filter, map, switchMap} from 'rxjs/operators';
import {SetEditingAction, SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {
	PCPresetInitStrategy,
	Preset,
	PresetInitStrategy,
	SnapshotPresetInitStrategy,
	VstPresetInitStrategy
} from '../../../shared/preset/model/model';
import {Observable, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VST} from '../../../shared/vst/model/vst';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';
import { v1 as uuid } from 'uuid';
import {DuplicatePresetAction, SavePresetAction} from '../../../shared/preset/state/preset.actions';
import {PatchCurrentPresetAction, ReinitPresetAction, SelectPresetAction} from '../../../shared/preset/state/presetSession.actions';
import {Instrument} from '../../../shared/vst/model/instrument';
import {LinearParamMappingStrategy, ParamMappingGroup, ParamMappingStrategy} from '../../../shared/paramMapping/model/model';
import {ParamMappingStrategies} from '../../../shared/paramMapping/model/paramMappingStrategies';
import {UpdateParamMappingStrategyAction} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {PresetInitStrategies} from '../../../shared/preset/model/PresetInitStrategies';

@Component({
	selector: 'app-preset-detail',
	templateUrl: './preset-detail-page.component.html',
	styleUrls: ['./preset-detail-page.component.scss'],
})
export class PresetDetailPageComponent implements OnInit, OnDestroy {
	Object = Object;

	protected _subscriptions: Subscription[] = [];

	_form: FormGroup;
	protected _noRetransmit = false;

	_model: Preset = {
		id: null,
		name: null,
		vstId: null,
		parameterMappingGroupId: null,
		initStrategy: null,
		paramValues: { },
		effectParamValues: { }
	};

	availableVsts$: Observable<VST[]>;

	availableParamMappingGroups$: Observable<ParamMappingGroup[]>;

	constructor(private fb: FormBuilder, private router: Router, private store: Store) {
		this.availableVsts$ = this.store.select(ManualState.getCurrentLayer).pipe(
			map(layer => layer.availableVstIds)
		).pipe(switchMap(vstIds => this.store.select(VSTState.getEntities).pipe(map(entities => {
			return vstIds.filter(vstId => entities[vstId].type === 'instrument').map(vstId => entities[vstId]);
		}))));

		this._form = this.fb.group({
			'name': [null, [Validators.required]],
			'vstId': [null, []],
			'parameterMappingGroupId': [null, []],
		});
	}

	protected updateFormValuesFromModel() {
		if (this._model) {
			this._form.setValue({
				'name': this._model.name,
				'vstId': this._model.vstId,
				'parameterMappingGroupId': this._model.parameterMappingGroupId || null
			});
		}
	}

	ngOnInit(): void {
		this.store.dispatch(new SetEditingAction(true));
		this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.INSTRUMENT_DETAIL));

		const $currentPreset = this.store.select(PresetSessionState.getCurrentPreset);

		this._subscriptions.push(
			$currentPreset.subscribe(
				preset => {
					this._model = preset;
					this._noRetransmit = true;
					this.updateFormValuesFromModel();
				}
			)
		);

		this.availableParamMappingGroups$ = $currentPreset.pipe(switchMap(
			preset => preset && preset.vstId
				? this.store.select(VSTState.getVstById).pipe(map(cb => {
					const instr = <Instrument>cb(preset.vstId);
					return instr.paramMappingGroupIds.map(gid => instr.paramMappingGroups[gid]);
				}))
				: <Observable<ParamMappingGroup[]>>of()
		));

		this._subscriptions.push(
			this._form.valueChanges.pipe(debounceTime(500)).subscribe((val) => {
				console.log('FORM VALUES CHANGED', val, this._noRetransmit, this._form.valid);

				if (this._noRetransmit) {
					this._noRetransmit = false;
					return;
				}
				this._noRetransmit = false;

				if (!this._form.valid) {
					return;
				}

				if (!val.vstId) {
					val.parameterMappingGroupId = null;
				} else {
					const instrument: Instrument = <Instrument>this.store.selectSnapshot(VSTState.getVstById)(val.vstId);
					if (val.parameterMappingGroupId !== null && !(val.parameterMappingGroupId in instrument.paramMappingGroups)) {
						val.parameterMappingGroupId = null;
					}
				}

				this.store.dispatch(
					new PatchCurrentPresetAction(val)
				);
			})
		);

		this.updateFormValuesFromModel();
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._subscriptions = [];
		this.store.dispatch(new SetEditingAction(false));
	}

	onStrategySelected(value: any) {
		let strategy: PresetInitStrategy = null;
		switch (value) {
			case PresetInitStrategies.PROGRAM_CHANGE:
				strategy = <PCPresetInitStrategy>{
					type: PresetInitStrategies.PROGRAM_CHANGE,
					program: null
				};
				break;
			case PresetInitStrategies.SNAPSHOT:
				strategy = <SnapshotPresetInitStrategy>{
					type: PresetInitStrategies.SNAPSHOT,
					paramValues: null
				};
				break;
			case PresetInitStrategies.VST_PRESET:
				strategy = <VstPresetInitStrategy>{
					type: PresetInitStrategies.VST_PRESET,
					preset: null
				};
				break;
			default:
				strategy = null;
		}
		if (strategy) {
			this.store.dispatch(new PatchCurrentPresetAction({
				initStrategy: strategy
			}));
		}
	}

	onCancelClick() {
		this.router.navigate(['/presets']);
	}

	onSaveClick() {
		this.store.dispatch(new SavePresetAction());
		this.router.navigate(['/presets']);
	}

	onDuplicateClick() {
		this.store.dispatch(new DuplicatePresetAction(uuid(), this.store.selectSnapshot(PresetSessionState.getCurrentPreset).id));
		this.router.navigate(['/presets']);
	}

	clearParamValues() {
		this.store.dispatch(new PatchCurrentPresetAction({
			paramValues: { }
		}));
		setTimeout(() => this.store.dispatch(new ReinitPresetAction()), 10);
	}

	clearEffectParamValues() {
		this.store.dispatch(new PatchCurrentPresetAction({
			effectParamValues: { }
		}));
		setTimeout(() => this.store.dispatch(new ReinitPresetAction()), 10);
	}

}