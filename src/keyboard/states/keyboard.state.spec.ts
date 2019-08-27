import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { KeyboardState, KeyboardStateModel } from './keyboard.state';

describe('Keyboard state', () => {
    let store: Store;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([KeyboardState])]
        }).compileComponents();
        store = TestBed.get(Store);
    }));

    it('should create an empty state', () => {
        const actual = store.selectSnapshot(KeyboardState.getState);
        const expected: KeyboardStateModel = {
            items: []
        };
        expect(actual).toEqual(expected);
    });

});
