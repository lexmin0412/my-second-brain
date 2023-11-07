import OSS from "ali-oss";

export interface OssClientInitProps {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

class OssClient {
  constructor(props: OssClientInitProps) {
    const store = new OSS({
      region: props.region,
      accessKeyId: props.accessKeyId,
      accessKeySecret: props.accessKeySecret,
      bucket: props.bucket,
    });
    this.store = store;
  }

  store: OSS;

  list = () => {
    return this.store.list(
      {
        prefix: "apis/my-second-brain/articles",
        "max-keys": 100,
      },
      {}
    );
  };

  put = (fileName: string, content: string) => {
    return this.store.put(
      `/apis/my-second-brain/articles/${fileName}.md`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new OSS.Buffer(content)
    );
  };

  addFolder = (folderName: string) => {
    return this.store.put(
      `/apis/my-second-brain/articles/${folderName}/`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new OSS.Buffer("")
    );
  };

	/**
	 * 删除目录
	 */
	deleteFolder = async(folderName: string) => {
		console.log('enter delete folder', folderName)
		// 列出所有子项
		const result = await this.store.list({
			prefix: `apis/my-second-brain/articles/${folderName}`,
			"max-keys": 100
		}, {});
		// 一次删除多个文件
		return this.store.deleteMulti(result.objects.map((item)=>item.name))
	}

  get = (fileName: string) => {
    return this.store.get(`apis/my-second-brain/articles/${fileName}.md`);
  };

  copy = (sourceFileName: string, targetFileName: string) => {
    return this.store.copy(
      `apis/my-second-brain/articles/${targetFileName}.md`,
      `apis/my-second-brain/articles/${sourceFileName}.md`
    );
  };

  delete = (fileName: string) => {
    return this.store.delete(`/apis/my-second-brain/articles/${fileName}.md`);
  };

  rename = async (sourceFileName: string, targetFileName: string) => {
    await this.copy(sourceFileName, targetFileName);
    const res = await this.delete(sourceFileName);
    return Promise.resolve({
      res,
    });
  };
}

export default OssClient;