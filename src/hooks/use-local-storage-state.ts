import { useEffect, useState } from "react"

export const useLocalStorageState = <Value>(key: string, defaultValue: Value) => {

	const valueInStorage: Value = JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue) || '{}')
	const [value, setValue] = useState<Value>(valueInStorage)

	useEffect(() => {
		console.log('value change', value)
		localStorage.setItem(key, JSON.stringify(value || {}))
	}, [value])

	return [value, setValue] as [Value, React.Dispatch<React.SetStateAction<Value>>]
}
