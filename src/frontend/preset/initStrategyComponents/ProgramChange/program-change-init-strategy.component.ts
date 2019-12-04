import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngxs/store';
import {Subscription} from 'rxjs';
import {PresetSessionState} from '../../../../shared/preset/state/presetSession.state';
import {debounceTime, filter, map} from 'rxjs/operators';
import {PresetInitStrategies} from '../../../../shared/preset/model/PresetInitStrategies';
import {PCPresetInitStrategy} from '../../../../shared/preset/model/model';
import {PatchCurrentPresetAction} from '../../../../shared/preset/state/presetSession.actions';

@Component({
	selector: 'app-init-strategy-program-change',
	templateUrl: './program-change-init-strategy.component.html',
	styleUrls: ['./program-change-init-strategy.component.scss']
})
export class ProgramChangeInitStrategyComponent implements OnInit, OnDestroy {

	protected subscriptions: Subscription[] = [];

	form: FormGroup;

	protected _noRetransmit = false;

	constructor(fb: FormBuilder, protected store: Store) {
		this.form = fb.group({
			'programNumber': [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
		});
	}

	ngOnInit(): void {
		this.subscriptions.push(
			this.form.valueChanges.pipe(debounceTime(500)).subscribe((val) => {
				if (this._noRetransmit) {
					this._noRetransmit = false;
					return;
				}
				this._noRetransmit = false;

				if (!this.form.valid) {
					return;
				}

				const strategy: PCPresetInitStrategy = {
					type: PresetInitStrategies.PROGRAM_CHANGE,
					program: val.programNumber
				};
				this.store.dispatch(
					new PatchCurrentPresetAction({
						initStrategy: strategy
					})
				);
			})
		);
		this.subscriptions.push(
			this.store.select(PresetSessionState.getCurrentPreset)
				.pipe(filter(preset => preset !== null && preset.initStrategy && preset.initStrategy.type === PresetInitStrategies.PROGRAM_CHANGE))
				.pipe(map(preset => preset.initStrategy))
				.subscribe((strategy: PCPresetInitStrategy) => {
					this._noRetransmit = true;
					this.form.patchValue({
						programNumber: strategy.program
					});
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
		this._noRetransmit = false;
	}
}