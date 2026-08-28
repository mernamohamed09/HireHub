require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../models/application');

const run = async () => {
    await mongoose.connect(process.env.DB_URL);

    const filter = {
        'aiAnalysis.status': 'failed',
        'aiAnalysis.lastError': /version mismatch/i
    };
    const applications = await Application.find(filter).select('_id').lean();
    const result = await Application.updateMany(filter, {
        $set: {
            'aiAnalysis.status': 'pending',
            'aiAnalysis.attempts': 0,
            'aiAnalysis.nextAttemptAt': new Date(),
            'aiAnalysis.lastError': ''
        }
    });

    console.log(JSON.stringify({
        matched: result.matchedCount,
        modified: result.modifiedCount,
        ids: applications.map(({ _id }) => String(_id))
    }));
};

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
