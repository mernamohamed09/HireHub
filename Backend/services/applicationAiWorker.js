const Application = require('../models/application');
const { processApplicationAI } = require('../controller/applicationController');

const POLL_INTERVAL_MS = Number(process.env.AI_WORKER_POLL_MS || 15000);
const STALE_AFTER_MS = Number(process.env.AI_WORKER_STALE_MS || 5 * 60 * 1000);
const CURRENT_SCORING_VERSION = '2.4';
let timer;
let running = false;

const runBatch = async () => {
    if (running) return;
    running = true;
    try {
        await Application.updateMany(
            {
                'aiAnalysis.status': 'completed',
                $or: [
                    { 'aiAnalysis.scoringVersion': { $ne: CURRENT_SCORING_VERSION } },
                    {
                        'aiAnalysis.matchScore': { $gt: 0 },
                        'aiAnalysis.scoreBreakdown.semantic': 0
                    }
                ]
            },
            {
                $set: {
                    'aiAnalysis.status': 'pending',
                    'aiAnalysis.nextAttemptAt': new Date(),
                    'aiAnalysis.attempts': 0
                }
            }
        );

        const staleBefore = new Date(Date.now() - STALE_AFTER_MS);
        await Application.updateMany(
            {
                'aiAnalysis.status': 'processing',
                'aiAnalysis.processingStartedAt': { $lt: staleBefore }
            },
            {
                $set: {
                    'aiAnalysis.status': 'pending',
                    'aiAnalysis.nextAttemptAt': new Date()
                }
            }
        );

        const applications = await Application.find({
            'aiAnalysis.status': 'pending',
            $or: [
                { 'aiAnalysis.nextAttemptAt': { $exists: false } },
                { 'aiAnalysis.nextAttemptAt': null },
                { 'aiAnalysis.nextAttemptAt': { $lte: new Date() } }
            ]
        }).select('_id').sort({ createdAt: 1 }).limit(5).lean();

        await Promise.all(applications.map((application) => processApplicationAI(application._id)));
    } catch (error) {
        console.error('AI worker batch failed:', error.message);
    } finally {
        running = false;
    }
};

const startApplicationAiWorker = () => {
    if (timer) return;
    void runBatch();
    timer = setInterval(runBatch, POLL_INTERVAL_MS);
    timer.unref?.();
};

module.exports = { startApplicationAiWorker, runBatch };
