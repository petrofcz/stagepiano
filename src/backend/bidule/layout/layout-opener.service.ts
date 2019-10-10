import {OscService} from '../../osc/osc.service';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {OscMessage} from '../../osc/osc.message';
import {SelectLayoutAction, SetLayoutLoadingAction} from '../../../shared/layout/state/layout.actions';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Layout} from '../../../shared/layout/model/layout';
import {app} from 'electron';

@Injectable({
	providedIn: 'root'
})
export class LayoutOpener {

	protected oscSubscription;

	protected interval;

	protected timeout;

	@Select(LayoutState.getActiveLayout)
	protected activeLayout$: Observable<Layout>;

	constructor(osc: OscService, store: Store) {
		this.activeLayout$.subscribe((activeLayout) => {
			if (this.oscSubscription) {
				osc.off(this.oscSubscription);
				this.oscSubscription = null;

				clearInterval(this.interval);
				this.interval = null;

				clearTimeout(this.timeout);
				this.timeout = null;
			}
			if (activeLayout) {
				osc.send(new OscMessage('/open', [activeLayout.biduleFile]));

				this.interval = setInterval(() => {
					osc.send(new OscMessage('/ManualMixer/parameters_osc_update', []));
				}, 1000);   // interval for ping

				this.timeout = setTimeout(() => {
					store.dispatch(new SetLayoutLoadingAction(false));
					store.dispatch(new SelectLayoutAction(null));
				}, 60000);  // timeout to wait bidule layout for load

				this.oscSubscription = osc.on('/ManualMixer/*', () => {
					osc.off(this.oscSubscription);
					this.oscSubscription = null;
					clearInterval(this.interval);
					this.interval = null;
					clearTimeout(this.timeout);
					this.interval = null;
					store.dispatch(new SetLayoutLoadingAction(false));
				});

				store.dispatch(new SetLayoutLoadingAction(true));
			} else {
				const appDir = app.getAppPath();
				osc.send(new OscMessage('/open', [appDir + '/bidule/emptyLayout.bidule']));
				store.dispatch(new SetLayoutLoadingAction(false));
			}
		});
	}
}