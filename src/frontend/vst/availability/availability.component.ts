import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Layer} from '../../../shared/manual/model/layer';
import {Select, Store} from '@ngxs/store';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {map} from 'rxjs/operators';
import {BiduleState} from '../../../shared/bidule/state/bidule.state';

@Component({
	selector: 'app-vst-availability',
	templateUrl: './availability.component.html',
	styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

	_vstId: string = null;

	_withGlobal = false;

	@Select(ManualState.getLayers)
	$layers: Observable<Layer[]>;

	@Select(BiduleState.getAvailableGlobalEffectIds)
	$globalEffectIds: Observable<string[]>;

	public get vstId(): string {
		return this._vstId;
	}

	@Input()
	public set vstId(vstId: string) {
		this._vstId = vstId;
	}

	public get withGlobal(): boolean {
		return this._withGlobal;
	}

	@Input()
	public set withGlobal(withGlobal: boolean) {
		this._withGlobal = withGlobal;
	}

	public manualById(manualId: string) {
		return this.store.select(ManualState.getManualById).pipe(map(filterFn => filterFn(manualId)));
	}

	public manualNameById(manualId: string) {
		return this.manualById(manualId).pipe(map(manual => manual.name));
	}

	constructor(private store: Store) { }

	ngOnInit() { }

}