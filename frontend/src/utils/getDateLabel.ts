export const getDateLabel = (timestamp: string) => {
    if(!timestamp) return "";

    const date = new Date(timestamp.endsWith("Z") ? timestamp : timestamp + "Z");

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();

    const isYesterday = date.toDateString() === yesterday.toDateString();

    if(isToday) return "Today";
    if(isYesterday) return "Yesterday";

    return date.toLocaleDateString([], {
        day: '2-digit',
        month: 'long',
        year: "numeric"
    }
    );
}