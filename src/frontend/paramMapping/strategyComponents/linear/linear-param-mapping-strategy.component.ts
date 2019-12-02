import {Component, OnInit} from '@angular/core';
import {AbstractParamMappingComponent} from '../abstractParamMappingComponent';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LinearParamMappingStrategy} from '../../../../shared/paramMapping/model/model';
import {ParamMappingStrategies} from '../../../../shared/paramMapping/model/paramMappingStrategies';
import {Select, Store} from '@ngxs/store';
import {ParamMappingPageState} from '../../../../shared/paramMapping/state/paramMappingPage.state';
import {debounceTime, distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {
	SetParamMappingValueLearningAction,
	UpdateParamMappingStrategyAction
} from '../../../../shared/paramMapping/state/paramMappingPage.actions';

@Component({
	selector: 'app-linear-param-mapping-strategy',
	templateUrl: './linear-param-mapping-strategy.component.html',
	styleUrls: ['./linear-param-mapping-strategy.component.scss'],
//	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinearParamMappingStrategyComponent extends AbstractParamMappingComponent implements OnInit {

	form: FormGroup;

	noRetransmit = false;

	model: LinearParamMappingStrategy = {
		type: ParamMappingStrategies.LINEAR,
		oscFrom: 0,
		oscTo: 1,
		oscInverse: false,
		dispFrom: 0,
		dispTo: 1,
		dispDecimals: 0,
		dispSuffix: null
	};

	@Select(ParamMappingPageState.getValueLearningIndex)
	learningValueIndex$;

	constructor(fb: FormBuilder, protected store: Store) {
		super();
		this.form = fb.group({
			'oscFrom': [null, [Validators.required, Validators.pattern('^[0-9\.\-]*$')]],
			'oscTo': [null, [Validators.required, Validators.pattern('^[0-9\.\-]*$')]],
			'oscInverse': [false, [Validators.required]],
			'dispFrom': [null, [Validators.required, Validators.pattern('^[0-9\.\-]*$')]],
			'dispTo': [null, [Validators.required, Validators.pattern('^[0-9\.\-]*$')]],
			'dispDecimals': [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
			'dispSuffix': [null]
		});
	}

	ngOnInit(): void {
		console.log('[LPMS INIT]');

		this.store.select(ParamMappingPageState.getSelectedMapping).subscribe((val) => console.log('[LPMS] CUR CHANGED'));
		this.store.select(ParamMappingPageState.getMappings).subscribe((val) => console.log('[LPMS] ALL CHANGED'));

		this.subscriptions.push(
			this.store.select(ParamMappingPageState.getSelectedMapping)
				.pipe(filter(val => val !== null))
				.pipe(map(mapping => mapping.items[this.currentItemId]))
				.pipe(tap(val => console.log('[LPMS] CUR ITEM', val)))
				.pipe(distinctUntilChanged())
				.subscribe(mappingItem => {
					this.model = <LinearParamMappingStrategy> mappingItem.mappingStrategy;
					this.noRetransmit = true;
					console.log('[LPMS] UPDATING FORM VALUES FROM MODEL', this.model);
					this.updateFormValuesFromModel();
				})
		);
		this.subscriptions.push(
			this.form.valueChanges.pipe(debounceTime(500)).subscribe((val) => {
				if (this.noRetransmit) {
					this.noRetransmit = false;
					return;
				}
				this.noRetransmit = false;

				if (!this.form.valid) {
					return;
				}

				const linearMappingStrategy: LinearParamMappingStrategy = {
					oscInverse: val.oscInverse,
					oscFrom: parseFloat(val.oscFrom),
					oscTo: parseFloat(val.oscTo),
					dispFrom: parseFloat(val.dispFrom),
					dispTo: parseFloat(val.dispTo),
					dispDecimals: parseFloat(val.dispDecimals),
					dispSuffix: val.dispSuffix,
					type: ParamMappingStrategies.LINEAR
				};
				this.store.dispatch(
					new UpdateParamMappingStrategyAction(
						this.currentItemId,
						linearMappingStrategy
					)
				);
			})
		);
		this.updateFormValuesFromModel();
	}

	protected updateFormValuesFromModel() {
		if (this.model) {
			const realValues = Object.assign({}, this.model);
			delete realValues['type'];
			console.log(realValues);
			this.form.setValue(realValues);
		}
	}

	setParamLearning(index: number | null) {
		if (index === null) {   // stop learning
			this.store.dispatch(
				new SetParamMappingValueLearningAction(
					null,
					null
				)
			);
		} else {
			this.store.dispatch(
				new SetParamMappingValueLearningAction(
					this.currentItemId,
					index
				)
			);
		}
	}
}