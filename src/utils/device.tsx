/**
 * 判断是否移动端
 */
export const isMobile = () => {
  const _navigator =
    typeof navigator !== "undefined" ? navigator : window.navigator;
  const userAgent = _navigator.userAgent.toLowerCase();
  const isMobile =
    /ipad|ipod|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(
      userAgent
    );
  const isIpad =
    !!userAgent.match(/(ipad)/) ||
    (_navigator.platform === "MacIntel" &&
      _navigator.maxTouchPoints > 1 &&
      window.screen.height > window.screen.width);
  if (!isMobile && !isIpad) return /mobile/i.test(userAgent);
  return isMobile || isIpad;
};
