// Import getAllItemsHandler function from get-all-items.mjs 
import { getAllItemsHandler } from '../../../src/handlers/get-all-items.mjs';
 
// This includes all tests for getAllItemsHandler() 
describe('Test getAllItemsHandler', () => {
 
    it('should return ids', async () => { 
        const event = { 
            httpMethod: 'GET' 
        };
 
        // Invoke helloFromLambdaHandler() 
        const result = await getAllItemsHandler(event); 
 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'foobar' }) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
