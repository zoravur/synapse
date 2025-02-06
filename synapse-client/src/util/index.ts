const getUserOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
    return "Unknown";
}

export {
    getUserOS,
}