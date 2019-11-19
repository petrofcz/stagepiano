import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Layer} from '../../../shared/manual/model/layer';
import {Select, Store} from '@ngxs/store';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {map} from 'rxjs/operators';
import {BiduleState} from '../../../shared/bidule/bidule.state';
import {ParamMappingPageState} from '../../../shared/paramMapping/state/paramMappingPage.state';
import {ParamMapping, ParamMappingPage} from '../../../shared/paramMapping/model/model';
import {PresetCategoryState} from '../../../shared/preset/state/preset-category.state';
import {NamedEntityDialogComponent, NamedEntityDialogData} from '../../shared/dialogs/named/named-entity-dialog.component';
import {AddPresetCategoryAction, UpdatePresetCategoryAction} from '../../../shared/preset/state/preset-category.actions';
import {PresetCategory} from '../../../shared/preset/model/model';
import {MatDialog} from '@angular/material/dialog';
import {
	AddParamMappingAction,
	RemoveParamMappingAction,
	UpdateParamMappingAction
} from '../../../shared/paramMapping/state/paramMappingPage.actions';
import { v1 as uuid } from 'uuid';

@Component({
	selector: 'app-param-mapping-page',
	templateUrl: './param-mapping-page.component.html',
	styleUrls: ['./param-mapping-page.component.scss']
})
export class ParamMappingPageComponent implements OnInit {

	@Select(ParamMappingPageState.getPage)
	page$: Observable<ParamMappingPage>;

	@Select(ParamMappingPageState.getMappings)
	mappings$: Observable<ParamMapping[]>;

	// todo component (modal) for setting name (or add new mapping)

	// todo component for learn (endpoint name)

	// todo component for given strategy

	// todo handle saving (to instrument / effect)

	constructor(private store: Store, private dialog: MatDialog) { }

	ngOnInit() { }

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
}