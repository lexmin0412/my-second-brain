import * as OSS from "ali-oss";

export interface OssClientInitProps {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

class OssClient {
  constructor(props: OssClientInitProps) {
    console.log("props", props);
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

	get = (fileName: string) => {
		return this.store.get(`/apis/my-second-brain/articles/${fileName}.md`)
	}
}

export default OssClient;
