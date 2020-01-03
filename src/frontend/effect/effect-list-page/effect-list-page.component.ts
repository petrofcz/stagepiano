import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {Effect, EffectScope} from '../../../shared/vst/model/effect';
import {MatDialog} from '@angular/material/dialog';
import {AvailabilityComponent} from '../../vst/availability/availability.component';
import {SessionState} from '../../../shared/session/state/session.state';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {map} from 'rxjs/operators';
import {BiduleState} from '../../../shared/bidule/state/bidule.state';
import {Router} from '@angular/router';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {SendOscMessageAction} from '../../../shared/bidule/state/bidule.actions';
import {TakeEffectSnapshotAction} from '../../../shared/session/state/session.actions';
import {SetIgnoreParamsForSessionAction} from '../../../shared/preset/state/presetSession.actions';

@Component({
	selector: 'app-effect-list',
	templateUrl: './effect-list-page.component.html',
	styleUrls: ['./effect-list-page.component.scss'],
})
export class EffectListPageComponent implements OnInit {

	@Select(VSTState.getEffects)
	effects$: Observable<Effect[]>;

	@Select(SessionState.getEffectSnapshot)
	snapshot$: Observable<{
		effectId: string,
		vstPath: string
	}|null>;

	vstPath: string|null;

	// Ids of VSTs enabled for current layer / global
	paramMappingEnabled$: Observable<string[]>;

	constructor(protected store: Store, public dialog: MatDialog, protected router: Router) {
		this.paramMappingEnabled$ = combineLatest(
			store.select(VSTState.getEffects),
			store.select(ManualState.getCurrentLayer),
			store.select(SessionState.getEffectDisposition),
			store.select(BiduleState.getAvailableGlobalEffectIds)
		)
			.pipe(map((([effects, currentLayer, currentEffectDisposition, availableGlobalEffectIds]) => {
			return effects.filter(effect => {
				if (currentEffectDisposition && currentEffectDisposition.scope === EffectScope.Global) {
					this.vstPath = BiduleOscHelper.getGlobalEffectPrefix();
					// current session "route" configuration is effects - global
					return availableGlobalEffectIds.indexOf(effect.id) > -1;
				} else if (currentLayer) {
					console.log('IS LOCAL - LAYER ' + currentLayer.name);
					this.vstPath = BiduleOscHelper.getLocalVstPrefix(currentLayer);
					// current mode is anything - layer selected
					return currentLayer.availableVstIds.indexOf(effect.id) > -1;
				} else {
					this.vstPath = null;
					// no layer selected
					return [];
				}
			})
				.map(effect => effect.id);
		})));
	}

	public openAvailability(vstId: string) {
		const dialogRef = this.dialog.open(AvailabilityComponent, {
			width: '600px'
		});
		dialogRef.componentInstance.vstId = vstId;
		dialogRef.componentInstance._withGlobal = true;
	}

	ngOnInit(): void {
	}

	openParameterMapping(id: string) {
		this.router.navigate(['/effects/param-mapping', id]);
	}

	openUI(id: string) {
		if (this.vstPath) {
			this.store.dispatch(new SendOscMessageAction(this.vstPath + id + '/' + BiduleCommonEndpoint.OPEN_UI, [1]));
		}
	}

	takeSnapshot(id: string) {
		if (this.vstPath) {
			this.store.dispatch(
				new SetIgnoreParamsForSessionAction(this.store.selectSnapshot(SessionState.getActiveLayerId), true)
			);
			setTimeout(() =>
				this.store.dispatch(
					new TakeEffectSnapshotAction(id, this.vstPath + id + '/')
				),
				10
			);
		}
	}
}
