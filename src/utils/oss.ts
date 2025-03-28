import OSS from "ali-oss";
import { getNameWithoutSuffix, replaceName } from ".";

export interface OssClientInitProps {
	/**
	 * STS 方式需要这个参数，即阿里云 SDK 返回的 SecurityToken 字段
	 */
	securityToken?: string
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

class OssClient {
  constructor(props: OssClientInitProps) {
    const store = new OSS({
			stsToken: props.securityToken,
      region: props.region,
      accessKeyId: props.accessKeyId,
      accessKeySecret: props.accessKeySecret,
      bucket: props.bucket,
    });
    this.store = store;
  }

  store: OSS;

  list = (customPrefix?: string) => {
    return this.store.list(
      {
				prefix: `apis/my-second-brain/articles${customPrefix||''}`,
        "max-keys": 1000,
      },
      {}
    );
  };

	listNotes = (customPrefix?: string) => {
		return this.store.list(
			{
				prefix: `apis/my-second-brain/notes${customPrefix || ''}`,
				"max-keys": 1000,
			},
			{}
		);
	};

	/**
	 * 上传图片
	 * @param fileName 文件名
	 * @param blob 本地 Blob 对象
	 * @returns
	 */
	uploadImage = (fileName: string, blob: string) => {
		new Blob()
		return this.store.put(
			`/statics/my-second-brain/images/${fileName}.png`,
			blob
		)
	}

  put = (fileName: string, content: string) => {
    return this.store.put(
      `/apis/my-second-brain/articles/${fileName}.md`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new OSS.Buffer(content)
    );
  };

	putNote = (fileName: string, content: string) => {
		console.log('更新笔记')
		return this.store.put(
			`/apis/my-second-brain/notes/${fileName}.md`,
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

	getNote = (fileName: string) => {
		return this.store.get(`apis/my-second-brain/notes/${fileName}.md`);
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

	deleteNote = (fileName: string) => {
		return this.store.delete(`/apis/my-second-brain/notes/${fileName}.md`);
	};

  rename = async (sourceFileName: string, targetFileName: string) => {
    await this.copy(sourceFileName, targetFileName);
    const res = await this.delete(sourceFileName);
    return Promise.resolve({
      res,
    });
  };

	renameFolder = async(sourceFolderName: string, targetFolderName: string) => {
		await this.addFolder(targetFolderName)
		const result = await this.list(`/${sourceFolderName}`)
		const promises = result.objects?.filter(item=>item.name.endsWith('.md')).map((item)=>{
			const nameWithoutSuffix = getNameWithoutSuffix(item.name)
			const targetName = replaceName(nameWithoutSuffix, sourceFolderName, targetFolderName)
			// TODO 替换成内部方法实现
			return this.store.copy(`${targetName}.md`, `${nameWithoutSuffix}.md`)
		})
		await Promise.all(promises)
		// FIXME: 这里的删除如果打开就会把老文件和复制的文件一起删掉
		// await this.deleteFolder(sourceFolderName)
		return Promise.resolve()
	}
}

export default OssClient;
