import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Layer} from '../../../shared/manual/model/layer';
import {Select, Store} from '@ngxs/store';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {map, tap, timeout} from 'rxjs/operators';
import {BiduleState} from '../../../shared/bidule/state/bidule.state';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {LinearParamMappingStrategy, ParamMapping, ParamMappingPage, ParamMappingStrategy} from '../../../shared/paramMapping/model/model';
import {PresetCategoryState} from '../../../shared/preset/state/preset-category.state';
import {NamedEntityDialogComponent, NamedEntityDialogData} from '../../shared/dialogs/named/named-entity-dialog.component';
import {AddPresetCategoryAction, UpdatePresetCategoryAction} from '../../../shared/preset/state/preset-category.actions';
import {PresetCategory} from '../../../shared/preset/model/model';
import {MatDialog} from '@angular/material/dialog';
import {
	AddParamMappingAction,
	RemoveParamMappingAction, SelectParamMappingAction, SetEndpointLearningAction,
	UpdateParamMappingAction, UpdateParamMappingStrategyAction
} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import { v1 as uuid } from 'uuid';
import {SendOscMessageAction} from '../../../shared/bidule/state/bidule.actions';
import {BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {ParamMappingStrategies} from '../../../shared/paramMapping/model/paramMappingStrategies';

@Component({
	selector: 'app-param-mapping-page',
	templateUrl: './param-mapping-page.component.html',
	styleUrls: ['./param-mapping-page.component.scss']
})
export class ParamMappingPageComponent implements OnInit, OnDestroy {

	@Select(ParamMappingPageState.getPage)
	page$: Observable<ParamMappingPage>;

	@Select(ParamMappingPageState.getMappings)
	mappings$: Observable<ParamMapping[]>;

	@Select(ParamMappingPageState.getSelectedMapping)
	selectedMapping$: Observable<ParamMapping|null>;

	@Select(ParamMappingPageState.isEndpointLearning)
	isParamLearning$: Observable<boolean>;

	private _subscriptions: Subscription[] = [];

	constructor(private store: Store, private dialog: MatDialog) { }

	ngOnInit() {

	}

	ngOnDestroy() {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._subscriptions = [];
		this.store.dispatch(new SetEndpointLearningAction(false));
	}

	onAddClick() {
		this.openNameDialog(null);
	}

	private openNameDialog(id: string | null) {

		const dialogRef = this.dialog.open(NamedEntityDialogComponent, {
			width: '260px',
			data: <NamedEntityDialogData>{
				id: id,
				name: id ? this.store.selectSnapshot(ParamMappingPageState.getById)(id).name : '',
				phrase: 'Select parameter mapping item name:'
			}
		});

		dialogRef.afterClosed().subscribe((result: NamedEntityDialogData) => {
			if (result.id) {
				this.store.dispatch(new UpdateParamMappingAction(<Partial<ParamMapping>>{
					id: result.id,
					name: result.name
				}));
			} else {
				this.store.dispatch(new AddParamMappingAction(<ParamMapping>{
					id: uuid(),
					name: result.name,
					items: [],
					mainItemId: null
				}));
			}
		});
	}

	onEditNameClick(id: string) {
		this.openNameDialog(id);
	}

	onRemoveClick(id: string) {
		this.store.dispatch(new RemoveParamMappingAction(id));
	}

	onSelectClick(id: string) {
		this.store.dispatch(new SelectParamMappingAction(id));
	}

	setParamLearning(learning: boolean) {
		if (learning) {
			this.store.dispatch(new SendOscMessageAction(
				this.store.selectSnapshot(ParamMappingPageState.getVstPathPrefix) + 'Open_UI', [1.0]
			));
		}
		setTimeout(() => {
			this.store.dispatch(new SetEndpointLearningAction(learning));
		}, BiduleOscHelper.TIMEOUT_OPEN_UI);
	}

	onStrategySelected(value: any) {
		let strategy: ParamMappingStrategy = null;
		if (value === ParamMappingStrategies.LINEAR) {
			strategy = <LinearParamMappingStrategy>{
				type: ParamMappingStrategies.LINEAR,
				oscFrom: 0,
				oscTo: 1,
				oscInverse: false,
				dispFrom: 0,
				dispTo: 100,
				dispDecimals: 0,
				dispSuffix: null
			};
		}
		if (strategy) { // todo transfer common values between linear and linearlist
			this.store.dispatch(new UpdateParamMappingStrategyAction(0, strategy));
		}
	}
}