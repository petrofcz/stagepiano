import {Observable} from 'rxjs';
import {Select, Store} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {Navigate} from '@ngxs/router-plugin';
import {FrontendState} from '../../../shared/frontend/state/frontend.state';

export class LayoutRedirectService {

	@Select(LayoutState.isLayoutLoaded)
	protected isLayoutLoaded$: Observable<boolean>;

	constructor(protected store: Store) {
		this.isLayoutLoaded$.subscribe((isLayoutLoaded) => {
			if (store.selectSnapshot(FrontendState.isInitializing)) {
				return;
			}
			if (!isLayoutLoaded) {
				this.store.dispatch(new Navigate(['/layouts']));
			} else {
				this.store.dispatch(new Navigate(['/instruments']));
			}
		});
	}

}