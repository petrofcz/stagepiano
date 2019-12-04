import {Injectable} from '@angular/core';
import {OscService} from '../../osc/osc.service';
import {Store} from '@ngxs/store';
import {OscMessage} from '../../osc/osc.message';
import {PatchVstAction} from '../../../shared/vst/state/vst.actions';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {bufferTime, distinctUntilChanged, filter, switchMap, take} from 'rxjs/operators';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {SessionState} from '../../../shared/session/state/session.state';
import {merge, of} from 'rxjs';
import {TakeEffectSnapshotAction} from '../../../shared/session/state/session.actions';

// todo rename to vst snapshot service
@Injectable({
	providedIn: 'root'
})
export class EffectSnapshotService {
	constructor(private osc: OscService, private store: Store) {
		const effectSnapshot$ = this.store.select(SessionState.getEffectSnapshot)
			.pipe(distinctUntilChanged());

		effectSnapshot$.pipe(switchMap(
				(es) => es === null ? of() : merge(of(null), osc.observe(es.vstPath + '*'))
					.pipe(bufferTime(BiduleOscHelper.TIMEOUT_YIELD_PARAMS_LEARN))
					.pipe(take(1))
		)).subscribe((messages: OscMessage[]) => {
			const map = {};

			this.store.dispatch(
				new TakeEffectSnapshotAction(null, null)
			);

			if (messages.length === 1) {
				// todo display error about 'Send to osc servers' is not set up correctly
				console.log('Send to osc server missing');
			} else {
				let pathParts = null;
				messages.forEach(message => {
					if (message === null) {
						return;
					}
					pathParts = message.path.split('/');
					const endpoint = pathParts.pop();
					if (!BiduleOscHelper.isNativeBiduleEndpoint(endpoint, true)) {
						map[endpoint] = message.args;
					}
				});
				if (pathParts !== null) {
					this.store.dispatch(
						new PatchVstAction({
							id: pathParts.pop(),
							snapshot: map
						})
					);
				}
			}
		});

		effectSnapshot$.subscribe(es => {
			if (es !== null) {
				osc.send(new OscMessage(
					es.vstPath + BiduleCommonEndpoint.YIELD_PARAMETERS, [1]
				));
			}
		});

		this.store.select(LayoutState.isLayoutLoaded).subscribe((isLayoutLoaded => {
			if (isLayoutLoaded) {
				const layers = this.store.selectSnapshot(ManualState.getLayers);
				this.store.selectSnapshot(VSTState.getVsts).forEach((vst) => {
					for (const layer of layers) {
						if (vst.snapshot) {
							for (const endpoint in vst.snapshot) {
								this.osc.send(new OscMessage(
									'/Manual' + (parseInt(layer.manualId, 10) + 1) + '/Layer' + layer.position + '/' + vst.id + '/' + endpoint,
									vst.snapshot[endpoint]
								));
							}
						}
					}
					if (vst.snapshot) {
						for (const endpoint in vst.snapshot) {
							this.osc.send(new OscMessage(
								'/' + vst.id + '/' + endpoint,
								vst.snapshot[endpoint]
							));
						}
					}
				});
			}
		}));
	}
}