export const eventClassifications = [
    'Unspecified',
    'Scheduled',
    'Open',
    'New',
    'Started',
    'Initiated',
    'Running',
    'Completed',
    'Fired',
    'CancelRequested',
    'TimedOut',
    'Signaled',
    'Canceled',
    'Failed',
    'Terminated',
];
export const getEventClassification = (eventType) => {
    if (eventType.includes('RequestCancel'))
        return 'CancelRequested';
    for (const classification of eventClassifications) {
        if (eventType.includes(classification))
            return classification;
    }
};
