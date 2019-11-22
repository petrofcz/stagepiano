import {Component, OnInit} from '@angular/core';
import {AbstractParamMappingComponent} from '../abstractParamMappingComponent';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LinearParamMappingStrategy} from '../../../../shared/paramMapping/model/model';
import {ParamMappingStrategies} from '../../../../shared/paramMapping/model/paramMappingStrategies';
import {Store} from '@ngxs/store';
import {ParamMappingPageState} from '../../../../shared/paramMapping/state/paramMappingPage.state';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {UpdateParamMappingStrategyAction} from '../../../../shared/paramMapping/state/paramMappingPage.actions';

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
		this.subscriptions.push(
			this.store.select(ParamMappingPageState.getSelectedMapping)
				.pipe(map(mapping => mapping.items[this.currentItemId]))
				.pipe(distinctUntilChanged())
				.subscribe(mappingItem => {
					this.model = <LinearParamMappingStrategy> mappingItem.mappingStrategy;
					this.noRetransmit = true;
					this.updateFormValuesFromModel();
				})
		);
		this.subscriptions.push(
			this.form.valueChanges.subscribe((val: LinearParamMappingStrategy) => {
				if (this.noRetransmit) {
					this.noRetransmit = false;
					return;
				}
				this.noRetransmit = false;
				const linearMappingStrategy: LinearParamMappingStrategy = {
					... val,
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

}