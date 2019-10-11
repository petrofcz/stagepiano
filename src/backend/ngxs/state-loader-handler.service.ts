import {Injectable} from '@angular/core';
import {Actions, InitState, ofAction, ofActionDispatched, ofActionSuccessful, Store} from '@ngxs/store';
import {LoadStateAction} from '../../shared/ngxs/load-state.action';
import {FileStateStorage} from '../electron/file-state-storage';
import {RequestGlobalStateAction} from '../../shared/ngxs/request-global-state.action';
import {SelectLayoutAction, SelectLayoutActionDecl} from '../../shared/layout/state/layout.actions';
import {ActionTester} from '../../shared/ngxs/helper';

@Injectable({
	providedIn: 'root'
})
export class StateLoaderHandler {
	constructor(private store: Store, private stateStorage: FileStateStorage, private actions$: Actions) {
		this.actions$.subscribe((val) => {
			if (val.status === 'SUCCESSFUL' && 'action' in val) {
				const actionTester = new ActionTester(val['action']);
				if (actionTester.matches(InitState)) {
					const enhanceData = (data) => {
						data['layout']['active'] = null;
						data['layout']['loading'] = false;
						return data;
					};
					const globalData = this.stateStorage.loadGlobal();
					globalData.then((data) => {
						if (data) {
							this.store.dispatch(new LoadStateAction(enhanceData(data)));
						}
					}).catch((err) => {
						console.log(err);
					});
				}
				if (actionTester.matches(SelectLayoutAction)) {
					const action: SelectLayoutActionDecl = val.action;
					if (!action.layoutId) {
						// todo reset layout state
						this.store.dispatch(new LoadStateAction({
							'layout.active': null,
							'layout.loading': false
						}));
					} else {
						this.stateStorage.loadLayout(action.layoutId).then((data) => {
							let loadStateData = {};
							if (data === null) {
								// todo reset layout state
							} else {
								loadStateData = data;
							}
							loadStateData['layout.active'] = action.layoutId;
							this.store.dispatch(new LoadStateAction(loadStateData));
						}).catch((err) => {
							console.log(err);
							// todo send error message
						});
					}
				}
			}
		});
	}
}