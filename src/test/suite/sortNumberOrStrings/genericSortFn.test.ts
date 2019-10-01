
import chai = require('chai');
import { genericSortFn } from '../../../sortNumberOrStrings/genericSortFn';
import { SortOrder } from '../../../SortOrder';
const expect = chai.expect;

suite('Determine array type', () => {

	const ASCENDING_ARRAYS = [
		[['foo', 'bar', 'car'], ['bar', 'car', 'foo']],
		[[100, 1, 99], [1, 99, 100]]

	]

	ASCENDING_ARRAYS.forEach(([array, expectedArray]) => {
		test(`should sort array ${JSON.stringify(array)}`, () => {
            array.sort(genericSortFn(SortOrder.ascending));
			expect(array).to.deep.equal(expectedArray);
		});
    });
    
});