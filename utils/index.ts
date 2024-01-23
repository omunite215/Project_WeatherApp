export const splitStringAtFirstSpace = (string: string) => {
  const firstSpaceIndex = string.indexOf(" ");
  if (firstSpaceIndex === -1) {
    return [string, ""];
  } else {
    return [
      string.slice(0, firstSpaceIndex),
      string.slice(firstSpaceIndex + 1),
    ];
  }
};

export const formatTime = (timeStamp: number) => {
  const date = new Date(timeStamp * 1000);
  const hours = date.getHours() % 12;
  const minutes = "0" + date.getMinutes();
  const amPm = hours >= 12 ? "PM" : "AM";
  const formattedTime = hours + ":" + minutes.slice(-2) + " " + amPm;
  return formattedTime;
};

export const findTime = (dt: number, timezone: number) => {
  const localTime = new Date((dt + timezone) * 1000);
  const day = localTime.toLocaleDateString(undefined, {
    weekday: "long",
  });
  const time = localTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  return [day, time];
};
