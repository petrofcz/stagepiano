import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Layout} from '../../../shared/layout/model/layout';
import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {SelectLayoutAction} from '../../../shared/layout/state/layout.actions';

@Component({
	selector: 'app-layout-list',
	templateUrl: './layout-list-page.component.html',
	styleUrls: ['./layout-list-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutListPageComponent implements OnInit {

	@Select(LayoutState.getAll)
	layouts$: Observable<Layout[]>;

	constructor(protected store: Store) {
	}

	ngOnInit() {
	}

	selectLayout(id: string) {
		this.store.dispatch(new SelectLayoutAction(id));
	}
}
