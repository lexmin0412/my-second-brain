export * from './oss'
export * from './device'

/**
 * 替换字符串中的指定字符串
 */
export const replaceName = (str: string, replaceStr: string, targetStr: string) => {
  const arr = str.split("");
  arr.splice(str.lastIndexOf(`/${replaceStr}`)+1, replaceStr.length, targetStr);
  return arr.join("");
};

/**
 * 获取去除后缀的文件名
 */
export const getNameWithoutSuffix = (originalName: string) => {
  return originalName.slice(0, originalName.lastIndexOf(".md"));
};
