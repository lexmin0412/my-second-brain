
import localforage from 'localforage'
import { useEffect } from 'react'

export const useStorageContent =  (key: string, content: string) => {
	useEffect(()=>{
		if (!key) {
			return
		}
		localforage.setItem(key, content)
	}, [content])
}
