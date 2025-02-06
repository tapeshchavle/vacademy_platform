export const getISTTime = () => {
    return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    });
}

export const getISTTimeISO = () => {
    return new Date(new Date().getTime() + (330 * 60000)).toISOString();
}