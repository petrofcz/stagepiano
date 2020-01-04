import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Select, Store} from '@ngxs/store';
import {Observable, of, Subscription} from 'rxjs';
import {PresetSessionState} from '../../../../shared/preset/state/presetSession.state';
import {debounceTime, delay, filter, map, take} from 'rxjs/operators';
import {PresetInitStrategies} from '../../../../shared/preset/model/PresetInitStrategies';
import {PCPresetInitStrategy, SnapshotPresetInitStrategy, VstPresetInitStrategy} from '../../../../shared/preset/model/model';
import {
	PatchCurrentPresetAction,
	SetInitSnapshotLearningAction,
	SetInitVstPresetLearningAction
} from '../../../../shared/preset/state/presetSession.actions';
import {SendOscMessageAction} from '../../../../shared/bidule/state/bidule.actions';
import {ManualState} from '../../../../shared/manual/state/manual.state';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../../shared/bidule/osc/bidule-osc-helper';

@Component({
	selector: 'app-init-strategy-snapshot',
	templateUrl: './snapshot-init-strategy.component.html',
	styleUrls: ['./snapshot-init-strategy.component.scss']
})
export class SnapshotInitStrategyComponent implements OnInit, OnDestroy {
	Object = Object;

	protected subscriptions: Subscription[] = [];

	currentStrategy$: Observable<SnapshotPresetInitStrategy|null>;

	@Select(PresetSessionState.isCurrentInitSnapshotLearning)
	isLearning$;

	constructor(protected store: Store) {
		this.currentStrategy$ = this.store.select(PresetSessionState.getCurrentPreset)
			.pipe(map(preset => !preset || !preset.initStrategy || preset.initStrategy.type !== PresetInitStrategies.SNAPSHOT ? null : <SnapshotPresetInitStrategy>preset.initStrategy));
	}

	setLearn(learning: boolean) {
		this.store.dispatch(
			new SetInitSnapshotLearningAction(learning)
		);
		if (learning) {
			of(1).pipe(delay(100)).pipe(take(1)).subscribe(() => {
				this.store.dispatch(
					new SendOscMessageAction(
						BiduleOscHelper.getLocalVstPrefix(this.store.selectSnapshot(ManualState.getCurrentLayer))
						+ this.store.selectSnapshot(PresetSessionState.getCurrentPreset).vstId + '/' + BiduleCommonEndpoint.OPEN_UI,
						[1],
						true
					)
				);
			});
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.store.dispatch(
			new SetInitSnapshotLearningAction(false)
		);
	}
}