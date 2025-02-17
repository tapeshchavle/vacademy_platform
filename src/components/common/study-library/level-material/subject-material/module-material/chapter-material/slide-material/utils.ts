export const getEpochTimeInMillis = (): number => {
    return new Date().getTime(); // Returns epoch time in milliseconds
};


export const getISTTimeISO = () => {
    return new Date(new Date().getTime() + (330 * 60000)).toISOString();
}

export const getISTTime = () => {
    return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    });
}