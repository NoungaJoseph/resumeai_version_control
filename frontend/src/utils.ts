export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const getDocumentPrice = (mode: string): number => {
    switch (mode) {
        case 'business-plan':
        case 'visa-letter':
        case 'legal-agreement':
            return 1000;
        default:
            return 300;
    }
};
