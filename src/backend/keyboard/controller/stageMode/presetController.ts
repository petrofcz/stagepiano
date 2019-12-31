import {MortalInterface} from '../../model/MortalInterface';
import {DisplayRegionDriver} from '../../hw/display/display-region-driver';
import {combineLatest, Subscription} from 'rxjs';
import {auditTime, bufferWhen, distinctUntilChanged, filter, last, map, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {ButtonMultiClickEvent, MultiClickHandler} from '../../hw/common/button/multiClickHandler';
import {EventEmitter, Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {PresetCategoryState} from '../../../../shared/preset/state/preset-category.state';
import {PresetCategory} from '../../../../shared/preset/model/model';
import {PresetState} from '../../../../shared/preset/state/preset.state';
import {PresetSessionState} from '../../../../shared/preset/state/presetSession.state';
import {SelectPresetCategoryAction} from '../../../../shared/session/state/session.actions';
import {SelectPresetAction} from '../../../../shared/preset/state/presetSession.actions';

@Injectable({
	providedIn: 'root'
})
export class PresetController implements MortalInterface {

	protected static readonly ROW_CATEGORIES = 1;
	protected static readonly ROW_PRESETS = 2;
	protected static readonly NUM_COLS = 8;

	private subscriptions: Subscription[] = [];

	private onGoto: EventEmitter<GotoEvent> = new EventEmitter<GotoEvent>();
	private onPresetSelect: EventEmitter<number> = new EventEmitter<number>();

	private buttonsByRow: { [key: number]: number[] } = {};

	constructor(private display: DisplayRegionDriver, private store: Store) {
		this.buttonsByRow = {
			1: this.display.buttonMatrix.getIdsForRow(1),
			2: this.display.buttonMatrix.getIdsForRow(2)
		};
	}

	onDestroy(): void {
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.display.clearDisplay();
		this.buttonsByRow[PresetController.ROW_CATEGORIES].forEach((buttonId) => {
			this.display.buttonMatrix.buttons.setButtonClickHandler(buttonId, null);
		});
		for (const subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
		this.subscriptions = [];
	}

	onInit(): void {
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.display.clearDisplay();

		this.buttonsByRow[PresetController.ROW_CATEGORIES].forEach((buttonId) => {
			this.display.buttonMatrix.buttons.setButtonClickHandler(buttonId, new MultiClickHandler(null)); // 1000 = dummy value
		});

		this.subscriptions.push(this.display.buttonMatrix.onButtonClick.pipe(filter(evt => {
			return evt.row === PresetController.ROW_CATEGORIES;
		})).subscribe((evt) => {
			this.onGoto.emit(new GotoEvent(evt.col, (<ButtonMultiClickEvent>evt.originalEvent).clickCount, false, true));
		}));
		this.subscriptions.push(this.display.buttonMatrix.onButtonClick.pipe(filter(evt => {
			return evt.row === PresetController.ROW_PRESETS;
		})).subscribe((evt) => {
			this.onPresetSelect.emit(evt.col);
		}));

		const commonChange$ = combineLatest(
			this.onGoto.pipe(),
			this.store.select(PresetCategoryState.getAll)
		)
			.pipe(map(([gotoEvent, presetCategories]): [number, number, PresetCategory, string[], boolean] => {
				// console.log('START COMMON CHANGE PIPE');
				// console.log(gotoEvent);
				// console.log(presetCategories);

				if (!presetCategories.length) {
					return null;
				}
				if (gotoEvent.categoryPosition === 0) {
					return null;
				}

				let categoryPosition = gotoEvent.categoryPosition;

				if (categoryPosition > presetCategories.length) {
					categoryPosition = gotoEvent.enableSkipToNext ? 1 : presetCategories.length;
				}
				categoryPosition = Math.max(1, categoryPosition);
				const category = presetCategories[categoryPosition - 1];
				const pageCount = Math.max(1, Math.ceil(category.presetIds.length / PresetController.NUM_COLS));

				// console.log(category);
				// console.log(pageCount);

				let page = gotoEvent.page;
				if (page > pageCount) {
					if (gotoEvent.enableSkipToNext) {
						this.onGoto.emit(new GotoEvent((categoryPosition % presetCategories.length) + 1, 1, false, false));
						return null;
					} else {
						page = pageCount;
					}
				}

				// console.log(page);

				page = Math.max(1, page);
				const firstIndex = ((page - 1) * PresetController.NUM_COLS);
				const presetIds = category.presetIds.slice(firstIndex, firstIndex + PresetController.NUM_COLS);

				// console.log(presetIds);
				// console.log('-----');

				return [page, categoryPosition, category, presetIds, gotoEvent.transmit];
			})).pipe(distinctUntilChanged());

		const presetIds$ = commonChange$
			.pipe(map((args) => {
				if (args === null) {
					return [];
				}
				return args[3];
			}))
			.pipe(distinctUntilChanged());

		const presetNames$ = presetIds$.pipe(switchMap(presetIds => this.store.select(PresetState.getEntities).pipe(map(
			entities => presetIds.map(presetId => entities[presetId].name)
		))));

		// 0-no category
		const currentCategoryPosition$ = commonChange$
			.pipe(map((args) => {
				return args !== null ? args[1] : 0;
			}))
			.pipe(distinctUntilChanged());

		// connection to global state
		this.subscriptions.push(
			commonChange$
				.pipe(filter( (val) => { return val !== null; } ))
				.subscribe(([page, categoryPosition, category, presetIds, transmit]) => {
					// console.log('DISPATCHING COMMON ACTION');
					// console.log(category);
					// console.log('-----');
					if (transmit) {
						this.store.dispatch(new SelectPresetCategoryAction(category.id));
					}
				})
		);
		this.subscriptions.push(
			combineLatest(
				this.store.select(PresetCategoryState.getCurrent).pipe(map(category => { return category ? category.id : null; })).pipe(distinctUntilChanged()),
				this.store.select(PresetCategoryState.getAll)
			).pipe(map(([categoryId, categories]) => {
				if (!categoryId) {
					return -1;
				}
				let pos = -1;
				let i = 0;
				categories.forEach((iCategory) => {
					if (iCategory.id === categoryId) {
						pos = i;
					}
					i++;
				});
				return pos;
			}))
				.subscribe((categoryIndex) => {
					// console.log('PCWPCH');
					// console.log(categoryIndex);
					if (categoryIndex > -1) {
						this.onGoto.emit(new GotoEvent(categoryIndex + 1, 1, false, false));
					} else {
						this.onGoto.emit(new GotoEvent(0, 1, false, false));
					}
				})
		);

		// category list
		this.subscriptions.push(
			this.store.select(PresetCategoryState.getAll)
				.subscribe((categories: PresetCategory[]) => {
					let i = 0;
					this.buttonsByRow[PresetController.ROW_CATEGORIES].forEach((buttonId) => {
						if (i < categories.length) {
							const category = categories[i];
							this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, true);
							this.display.display.setCellContent(PresetController.ROW_CATEGORIES, i + 1, category.name);
						} else {
							this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
							this.display.display.setCellContent(PresetController.ROW_CATEGORIES, i + 1, null);
						}
						i++;
					});
				})
		);

		// current category
		this.subscriptions.push(
			currentCategoryPosition$.subscribe((categoryPosition: number) => {
				this.buttonsByRow[PresetController.ROW_CATEGORIES].forEach((buttonId) => {
					this.display.buttonMatrix.buttons.setLed(buttonId, false);
				});
				if (categoryPosition > 0) {
					this.display.buttonMatrix.buttons.setLed(
						this.buttonsByRow[PresetController.ROW_CATEGORIES][categoryPosition - 1], true
					);
				}
			})
		);

		// preset list
		this.subscriptions.push(
			presetNames$.subscribe((presetNames) => {
				let i = 0;
				this.buttonsByRow[PresetController.ROW_PRESETS].forEach((buttonId) => {
					if (i < presetNames.length) {
						this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, true);
						this.display.display.setCellContent(PresetController.ROW_PRESETS, i + 1, presetNames[i]);
					} else {
						this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
						this.display.display.setCellContent(PresetController.ROW_PRESETS, i + 1, null);
					}
					i++;
				});
			})
		);

		// current preset
		this.subscriptions.push(
			combineLatest(
				presetIds$,
				this.store.select(PresetSessionState.getCurrentPresetId),
			)
				.pipe(auditTime(20))
				.subscribe(([presetIds, currentPresetId]) => {
					this.buttonsByRow[PresetController.ROW_PRESETS].forEach((buttonId) => {
						this.display.buttonMatrix.buttons.setLed(buttonId, false);
					});
					if (!currentPresetId || !presetIds.length) {
						return;
					}
					const activeButtonIndex = presetIds.indexOf(currentPresetId);
					if (activeButtonIndex > -1) {
						this.display.buttonMatrix.buttons.setLed(
							this.buttonsByRow[PresetController.ROW_PRESETS][activeButtonIndex], true
						);
					}
			})
		);

		// page watchdog
		this.subscriptions.push(
			this.store.select(PresetSessionState.getCurrentPresetId)
				.pipe(auditTime(20))
				.pipe(withLatestFrom(
					presetIds$,
					commonChange$
				))
				.subscribe(([currentPresetId, presetIds, commonChange]) => {
					if (!currentPresetId || !presetIds.length) {
						return;
					}
					const activeButtonIndex = presetIds.indexOf(currentPresetId);
					if (activeButtonIndex === -1 && commonChange[2].presetIds.indexOf(currentPresetId) > -1) {
						console.log('[PC] Preset out of range');
						if (commonChange[1] && commonChange[2].presetIds && commonChange[2].presetIds.length) {
							console.log('[PC] Emitting', new GotoEvent(commonChange[1], Math.floor(commonChange[2].presetIds.indexOf(currentPresetId) / PresetController.NUM_COLS) + 1, false, false));
							this.onGoto.emit(
								new GotoEvent(commonChange[1], Math.floor(commonChange[2].presetIds.indexOf(currentPresetId) / PresetController.NUM_COLS) + 1, false, false)
							);
						}
					}
				})
		);

		// preset selection
		this.subscriptions.push(
			this.onPresetSelect.pipe(
				withLatestFrom(presetIds$)
			)
				.subscribe(([presetPosition, presetIds]) => {
					if (presetPosition <= presetIds.length) {
						this.store.dispatch(new SelectPresetAction(presetIds[presetPosition - 1]));
					}
				})
		);

		this.onGoto.emit(new GotoEvent(1, 1, false, false));
	}

}

class GotoEvent {
	constructor(public readonly categoryPosition: number, public readonly page: number, public readonly enableSkipToNext: boolean, public readonly transmit: boolean) {
	}
}