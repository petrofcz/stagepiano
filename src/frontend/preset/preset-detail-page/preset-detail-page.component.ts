import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, filter, map, switchMap} from 'rxjs/operators';
import {SetEditingAction, SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {Preset} from '../../../shared/preset/model/model';
import {Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VST} from '../../../shared/vst/model/vst';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';
import { v1 as uuid } from 'uuid';
import {DuplicatePresetAction, SavePresetAction} from '../../../shared/preset/state/preset.actions';
import {PatchCurrentPresetAction} from '../../../shared/preset/state/presetSession.actions';

@Component({
	selector: 'app-preset-detail',
	templateUrl: './preset-detail-page.component.html',
	styleUrls: ['./preset-detail-page.component.scss'],
})
export class PresetDetailPageComponent implements OnInit, OnDestroy {


	protected _subscriptions: Subscription[] = [];

	_form: FormGroup;
	protected _noRetransmit = false;

	_model: Preset = {
		id: null,
		name: null,
		vstId: null,
		parameterMappingId: null,
		initStrategy: null,
		paramValues: { }
	};

	availableVsts$: Observable<VST[]>;

	constructor(private fb: FormBuilder, private router: Router, private store: Store) {
		this.availableVsts$ = this.store.select(ManualState.getCurrentLayer).pipe(
			map(layer => layer.availableVstIds)
		).pipe(switchMap(vstIds => this.store.select(VSTState.getEntities).pipe(map(entities => {
			return vstIds.filter(vstId => entities[vstId].type === 'instrument').map(vstId => entities[vstId]);
		}))));
	}

	protected updateFormValuesFromModel() {
		if (this._model) {
			this._form.setValue({
				'name': this._model.name,
				'vstId': this._model.vstId,
				'paramMappingId': this._model.parameterMappingId
			});
		}
	}


	ngOnInit(): void {
		this._form = this.fb.group({
			'name': [null, [Validators.required]],
			'vstId': [null],
			'paramMappingId': [null],
		});
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

}