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
import {BiduleState} from '../../../shared/bidule/bidule.state';
import {Router} from '@angular/router';

@Component({
	selector: 'app-effect-list',
	templateUrl: './effect-list-page.component.html',
	styleUrls: ['./effect-list-page.component.scss'],
})
export class EffectListPageComponent implements OnInit {

	@Select(VSTState.getEffects)
	effects$: Observable<Effect[]>;

	// Ids of VSTs enabled for current layer / global
	paramMappingEnabled$: Observable<string[]>;

	constructor(protected store: Store, public dialog: MatDialog, protected router: Router) {
		this.paramMappingEnabled$ = combineLatest(
			store.select(VSTState.getEffects),
			store.select(ManualState.getCurrentLayer),
			store.select(SessionState.getEffectDisposition),
			store.select(BiduleState.getAvailableGlobalEffectIds)
		).pipe(map((([effects, currentLayer, currentEffectDisposition, availableGlobalEffectIds]) => {
			return effects.filter(effect => {
				if (currentEffectDisposition && currentEffectDisposition.scope === EffectScope.Global) {
					// current session "route" configuration is effects - global
					return availableGlobalEffectIds.indexOf(effect.id) > -1;
				} else if (currentLayer) {
					console.log('IS LOCAL - LAYER ' + currentLayer.name);
					// current mode is anything - layer selected
					return currentLayer.availableVstIds.indexOf(effect.id) > -1;
				} else {
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
}
