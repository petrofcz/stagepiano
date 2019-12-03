import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Effect, EffectScope} from '../../../shared/vst/model/effect';
import {distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {
	LoadParamMappingPageFromEffectAction,
	LoadParamMappingPageFromInstrumentAction, ResetParamMappingPageAction
} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import {
	PatchMappingGroupAction,
	PatchVstAction,
	RemoveMappingGroupAction,
	SaveEffectParamMappingPageAction
} from '../../../shared/vst/state/vst.actions';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {SetEditingAction, SetEffectDispositionAction, SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';
import {EffectDetailControllerParams} from '../../../backend/keyboard/controller/global/display/effectDetailController';
import {EffectDisposition} from '../../../shared/session/model/effectDisposition';
import {Instrument} from '../../../shared/vst/model/instrument';
import {PresetCategoryState} from '../../../shared/preset/state/preset-category.state';
import {NamedEntityDialogComponent, NamedEntityDialogData} from '../../shared/dialogs/named/named-entity-dialog.component';
import {AddPresetCategoryAction, UpdatePresetCategoryAction} from '../../../shared/preset/state/preset-category.actions';
import {PresetCategory} from '../../../shared/preset/model/model';
import {MatDialog} from '@angular/material/dialog';
import { v1 as uuid } from 'uuid';
import {ParamMappingGroup} from '../../../shared/paramMapping/model/model';

@Component({
	selector: 'app-instrument-param-mapping',
	templateUrl: './instrument-param-mapping-page.component.html',
	styleUrls: ['./instrument-param-mapping-page.component.scss'],
})
export class InstrumentParamMappingPageComponent implements OnInit, OnDestroy {

	instrument$: Observable<Instrument>;

	protected _subscriptions: Subscription[] = [];

	protected _instrument: Instrument|null;

	@Input()
	currentParamMappingGroupId = null;

	defaultMappingId$: Observable<string> = null;

	@Input()
	protected _cameFromPresetDetail = false;

	constructor(private route: ActivatedRoute, private router: Router, private store: Store, private dialog: MatDialog) {

	}

	ngOnInit(): void {
		this.instrument$ = <Observable<Instrument>> this.route.paramMap
			.pipe(map((params: ParamMap) => params.get('instrumentId')))
			.pipe(distinctUntilChanged())
			.pipe(switchMap(instrumentId => this.store.select(VSTState.getVstById).pipe(map(fn => fn(instrumentId)))));

		this._subscriptions.push(
			this.instrument$.subscribe(instrument => this._instrument = instrument)
		);

		this._subscriptions.push(
			this.instrument$.subscribe(
				instrument => this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.INSTRUMENT_DETAIL))
			)
		);

		this.store.dispatch(new SetEditingAction(true));
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._subscriptions = [];
		this.store.dispatch(new SetEditingAction(false));
	}

	onCancelClick() {
		this.router.navigate([this._cameFromPresetDetail ? '/presets/detail' : '/instruments']);
	}

	onSaveClick() {
		if (!this._instrument || !this.currentParamMappingGroupId) {
			return;
		}
		const currentParamMappingPage = this.store.selectSnapshot(ParamMappingPageState.getPage);
		if (!currentParamMappingPage) {
			return;
		}
		this.store.dispatch(new PatchMappingGroupAction(this._instrument.id, {
			id: this.currentParamMappingGroupId,
			paramMappingPage: currentParamMappingPage
		}));
	}

	removeParamMappingGroup() {
		this.store.dispatch(new RemoveMappingGroupAction(this._instrument.id, this.currentParamMappingGroupId));
		this.currentParamMappingGroupId = null;
		this.updateParamMappingPage();
	}

	renameParamMappingGroup() {
		this.openParamMappingGroupNameDialog(this.currentParamMappingGroupId);
	}

	duplicateParamMappingGroup() {

	}

	addParamMappingGroup() {
		this.openParamMappingGroupNameDialog(null);
	}

	selectParamMappingGroup(value: string) {
		this.currentParamMappingGroupId = value;
		this.updateParamMappingPage();
	}

	openParamMappingGroupNameDialog(paramMappingGroupId: string|null) {
		const dialogRef = this.dialog.open(NamedEntityDialogComponent, {
			width: '260px',
			data: <NamedEntityDialogData>{
				id: paramMappingGroupId ? paramMappingGroupId : null,
				name: paramMappingGroupId ? this._instrument.paramMappingGroups[paramMappingGroupId].name : (this._instrument.paramMappingGroupIds.length === 0 ? 'Default' : null),
				phrase: 'Select param mapping name:'
			}
		});

		dialogRef.afterClosed().subscribe((result: NamedEntityDialogData) => {
			if (!result) {
				return;
			}
			const groupPatch: Partial<ParamMappingGroup> = {
				id: result.id ? result.id : uuid(),
				name: result.name
			};

			this.store.dispatch(new PatchMappingGroupAction(this._instrument.id, groupPatch));
			this.currentParamMappingGroupId = groupPatch.id;
			this.updateParamMappingPage();
		});
	}

	setDefaultMappingGroup() {
		if (!this.currentParamMappingGroupId || !this._instrument) {
			return;
		}
		this.store.dispatch(new PatchVstAction(<Partial<Instrument>>{
			id: this._instrument.id,
			defaultParamMappingGroupId: this.currentParamMappingGroupId
		}));
	}

	private updateParamMappingPage() {
		if (this.currentParamMappingGroupId) {
			this.store.dispatch(new LoadParamMappingPageFromInstrumentAction(
				this._instrument.id,
				this.currentParamMappingGroupId
			));
		} else {
			this.store.dispatch(new ResetParamMappingPageAction());
		}
	}
}