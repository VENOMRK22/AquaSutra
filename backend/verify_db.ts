
import { CROP_DATABASE } from './src/data/CropDatabase';

console.log(`CROP_DATABASE Length: ${CROP_DATABASE.length}`);
console.log('--- IDs ---');
console.log(CROP_DATABASE.map(c => c.id).join(', '));
