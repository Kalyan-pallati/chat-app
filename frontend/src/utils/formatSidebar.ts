export const formatSidebarTime = (timestamp: string): string => {
    if(!timestamp) return "";

    const date = new Date(timestamp + "Z");

    const now = new Date();
    
    const isToday = date.toDateString() == now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if(isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if(isYesterday) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
    });
};
