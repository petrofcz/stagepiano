import {Component, OnInit,} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Instrument} from '../../../shared/vst/model/instrument';
import {MatDialog} from '@angular/material/dialog';
import {AvailabilityComponent} from '../../vst/availability/availability.component';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {SessionState} from '../../../shared/session/state/session.state';
import {BiduleState} from '../../../shared/bidule/state/bidule.state';
import {map} from 'rxjs/operators';
import {EffectScope} from '../../../shared/vst/model/effect';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {SendOscMessageAction} from '../../../shared/bidule/state/bidule.actions';
import {TakeEffectSnapshotAction} from '../../../shared/session/state/session.actions';
import {Router} from '@angular/router';

@Component({
	selector: 'app-instrument-list',
	templateUrl: './instrument-list-page.component.html',
	styleUrls: ['./instrument-list-page.component.scss'],
})
export class InstrumentListPageComponent implements OnInit {

	@Select(VSTState.getInstruments)
	instruments$: Observable<Instrument[]>;

	// Ids of VSTs enabled for current layer / global
	enabledVstIds$: Observable<string[]>;

	@Select(SessionState.getEffectSnapshot)
	snapshot$: Observable<{
		effectId: string,
		vstPath: string
	}|null>;

	constructor(protected store: Store, public dialog: MatDialog, protected router: Router) {
		this.enabledVstIds$ = combineLatest(
			store.select(VSTState.getInstruments),
			store.select(ManualState.getCurrentLayer),
		)
			.pipe(map((([effects, currentLayer]) => {
				return !currentLayer ? [] : effects.filter(effect => {
					return currentLayer.availableVstIds.indexOf(effect.id) > -1;
				}).map(effect => effect.id);
			})));
	}

	public openAvailability(vstId: string) {
		const dialogRef = this.dialog.open(AvailabilityComponent, {
			width: '600px'
		});
		dialogRef.componentInstance.vstId = vstId;
	}

	ngOnInit() {
	}

	openUI(id: string) {
		const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
		if (currentLayer) {
			this.store.dispatch(
				new SendOscMessageAction(BiduleOscHelper.getLocalVstPrefix(currentLayer) + id + '/' + BiduleCommonEndpoint.OPEN_UI, [1])
			);
		}
	}

	openParameterMapping(id: string) {
		this.router.navigate(['/instruments/param-mapping', id]);
	}

	takeSnapshot(id: string) {
		const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
		if (currentLayer) {
			this.store.dispatch(
				new TakeEffectSnapshotAction(id, BiduleOscHelper.getLocalVstPrefix(currentLayer) + id + '/')
			);
		}
	}
}
