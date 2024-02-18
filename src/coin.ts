export const DEFAULT_DECIMALS = 18

const validateDecimals = (decimals: any): decimals is number => {
  if (typeof decimals !== 'number') throw new Error('Invalid decimals, must be a number')
  if (decimals < 1 || decimals > 18) throw new Error('Invalid decimals, must be between 0 and 18')
  return true
}

export const coinToWeiInBigInt = (value: string | number, decimals: number = DEFAULT_DECIMALS): bigint => {
  value = value.toString()

  //test that value is string of positive number
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error('Invalid value')
  }
  validateDecimals(decimals)

  // Define the multiplier as a BigInt
  const multiplier = 10n ** BigInt(decimals)

  // Convert the integer part and fractional part separately
  let [integerPart, fractionalPart = ''] = value.split('.')

  // Ensure the fractional part is not longer than decimals digits
  fractionalPart = fractionalPart.padEnd(decimals, '0').slice(0, decimals)

  // Combine the integer and fractional parts
  const weiValue = BigInt(integerPart) * multiplier + BigInt(fractionalPart)

  return weiValue
}

export const coinToWei = (value: string | number, decimals: number = DEFAULT_DECIMALS): string => {
  return coinToWeiInBigInt(value, decimals).toString()
}

export const weiToCoin = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): string => {
  validateDecimals(decimals)

  const weiBigInt = BigInt(weiValue)
  const divisor = 10n ** BigInt(decimals)

  // Divide the Wei amount by the divisor to get the Ether amount
  const ethAmountBigInt = weiBigInt / divisor
  const remainder = weiBigInt % divisor

  // Determine how many digits to keep based on the Ether amount
  // let digits = 0
  // const ethAmount = Number(ethAmountBigInt) + (remainder > 0 ? Number(remainder) / 10 ** decimals : 0)
  // if (ethAmount < 0.1) digits = 6
  // else if (ethAmount < 1) digits = 4
  // else if (ethAmount < 10) digits = 3
  // else if (ethAmount < 100) digits = 2
  // else if (ethAmount < 100000) digits = 1
  // For amounts >= 100000, digits remain 0 for integer values

  // Format the fractional part based on the determined digits
  const remainderStr = remainder.toString()
    .padStart(decimals, '0')
  // .substring(0, digits)

  // Remove trailing zeros from the remainder
  const formattedRemainder = remainderStr.replace(/0+$/, '')

  // Combine the integer part and the fractional part
  const formattedEthAmount = `${ethAmountBigInt}${formattedRemainder.length > 0 ? '.' + formattedRemainder : ''}`

  return formattedEthAmount
}

export const dangerouslyWeiToCoinInFloat = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): number =>
  parseFloat(weiToCoin(weiValue, decimals))

export const formatNice = (value: string | number, formattingThreshold: number = 100_000): string => {
  const numStr = typeof value === 'string' ? value : value.toString()
  const roughNum = parseFloat(numStr)
  if (isNaN(roughNum)) throw new Error(`Coin.format: Invalid number: ${numStr}`)

  if (formattingThreshold === -1) {
    return numStr
  }

  const [integerPart, fractionalPart = ''] = numStr.split('.')
  const integerNum = parseInt(integerPart)

  if (integerNum < formattingThreshold) {
    if (!fractionalPart) return numStr

    const roughRemainder = parseFloat(`0.${fractionalPart}`)
    let digits = 0
    if (roughRemainder < 0.1) digits = 6
    else if (integerNum < 1) digits = 4
    else if (integerNum < 10) digits = 3
    else if (integerNum < 10000) digits = 2
    else if (integerNum < 100000) digits = 1
    // For amounts >= 100000, digits remain 0 for integer values

    let fractionalPadded = fractionalPart
      .substring(0, digits)
    if (fractionalPadded.length < 2 && digits >= 2) fractionalPadded = fractionalPadded.padEnd(2, '0')

    // if fractional part contains only zeroes, remove it
    if (fractionalPadded.replace(/0/g, '') === '') return integerPart
    if (!fractionalPadded) return integerPart
    return `${integerPart}.${fractionalPadded}`
  }

  const suffixes = ["", "K", "M", "B", "T"]
  const i = integerNum === 0
    ? 0
    // 6.907... is Math.log(1000), 4 is max index of suffixes
    : Math.min(Math.floor(Math.log(integerNum) / 6.907755278982137), 4)

  const [integerPartOfNice, fractionalPartOfNice = ''] = (integerNum / Math.pow(1000, i)).toString().split('.')
  const formatted = integerPartOfNice +
    (fractionalPartOfNice.length > 0 ? '.' + fractionalPartOfNice.slice(0, 3) : '')

  return `${formatted}${suffixes[i]}`
}

export const formatFixed = (value: string | number, precision: number = 3): string => {
  const numStr = value.toString()
  if (precision === -1) return numStr

  const [integerPart, fractionalPart = ''] = numStr.split('.')
  if (!fractionalPart) return numStr

  return `${integerPart}.${fractionalPart.substring(0, precision).padEnd(precision, '0')}`
}

export const weiFormatNice = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS, formattingThreshold = 100_000): string => {
  return formatNice(weiToCoin(weiValue, decimals), formattingThreshold)
}

export const weiFormatFixed = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS, precision: number = 3): string => {
  return formatFixed(weiToCoin(weiValue, decimals), precision)
}

export const weiToGwei = (gwei: string | bigint, decimals: number = DEFAULT_DECIMALS): string => {
  const weiBigInt = BigInt(gwei)
  if (weiBigInt < 0n) throw new Error('Invalid gwei value')
  const divisor = 10n ** (BigInt(decimals) / 2n)
  const [integerPart, fractionalPart = ''] = [
    (weiBigInt / divisor).toString(),
    (weiBigInt % divisor).toString().padStart(decimals / 2, '0').replace(/0+$/, '')
  ]
  if (!fractionalPart) return integerPart
  return `${integerPart}.${fractionalPart}`
}

export const gweiToWei = (gwei: string | number | bigint, decimals: number = DEFAULT_DECIMALS): string => {
  const multiplier = 10n ** (BigInt(decimals) / 2n)

  const [integerPart, fractionalPart = ''] = gwei.toString().split('.')
  if (BigInt(integerPart) < 0n) throw new Error('Invalid gwei value - must be positive')
  const gweiIntegerPartInWei = BigInt(integerPart) * multiplier
  if (!fractionalPart) return gweiIntegerPartInWei.toString()

  const fractionalPartStr = fractionalPart.padEnd(decimals / 2, '0').slice(0, decimals / 2)

  const weiValue = gweiIntegerPartInWei + BigInt(fractionalPartStr)
  return weiValue.toString()
}

export const coinToGwei = (value: string | number, decimals: number = DEFAULT_DECIMALS): string => {
  return weiToGwei(coinToWei(value, decimals), decimals)
}

export const gweiToCoin = (value: string | number, decimals: number = DEFAULT_DECIMALS): string => {
  return weiToCoin(gweiToWei(value, decimals), decimals)
}

export const cleanUpCoinsValue = (value: string | number): string => {
  return value.toString().trim().replace(/\.?0+$/, '')
}

export const Coin = (
  currency: string,
  decimals: number = DEFAULT_DECIMALS,
  precision: number = 3,
  formattingThreshold: number = 100_000
) => {
  if (typeof currency as any !== 'string') throw new Error('Invalid currency, must be a string')
  validateDecimals(decimals)
  const paddedCurrency = currency.trim() === '' ? '' : ` ${currency.trim()}`

  return {
    coinToWeiInBigInt: (value: string): bigint => coinToWeiInBigInt(value, decimals),
    coinToWei: (value: string): string => coinToWei(value, decimals),
    weiToCoin: (value: string | bigint): string => weiToCoin(value, decimals),

    dangerouslyWeiToCoinInFloat: (value: string | bigint): number => dangerouslyWeiToCoinInFloat(value, decimals),

    formatNice: (value: string): string => formatNice(value, formattingThreshold) + paddedCurrency,
    formatMetric: (value: string): string => formatNice(value, formattingThreshold),
    formatFixed: (value: string | number, _precision = precision): string => formatFixed(value, _precision) + paddedCurrency,
    formatFixedClean: (value: string | number, _precision = precision): string => formatFixed(value, _precision),
    weiFormatNice: (value: string | bigint): string => weiFormatNice(value, decimals, formattingThreshold) + paddedCurrency,
    weiFormatMetric: (value: string | bigint): string => weiFormatNice(value, decimals, formattingThreshold),
    weiFormatFixed: (value: string | bigint, _precision = precision): string => weiFormatFixed(value, decimals, _precision) + paddedCurrency,
    weiFormatFixedClean: (value: string | bigint, _precision = precision): string => weiFormatFixed(value, decimals, _precision),

    gwei: {
      gweiToWei: (value: string | number | bigint): string => gweiToWei(value, decimals),
      weiToGwei: (value: string | bigint): string => weiToGwei(value, decimals),
      gweiToCoin: (value: string | number): string => gweiToCoin(value, decimals),
      coinToGwei: (value: string | number): string => coinToGwei(value, decimals),
    },

    inAllFormats: (value: string | number, _precision = precision): ICoinFormats => {
      const wei = coinToWei(value, decimals)
      const coins = cleanUpCoinsValue(value)
      const metric = formatNice(value, formattingThreshold)
      return {
        value: coins,
        metric,
        nice: metric + paddedCurrency,
        fixed: formatFixed(value, _precision) + paddedCurrency,
        exact: coins + paddedCurrency,
        currency,
        wei,
      }
    },

    weiInAllFormats: (wei: string | bigint, _precision = precision): ICoinFormats => {
      const coins = weiToCoin(wei, decimals)
      const metric = weiFormatNice(wei, decimals, formattingThreshold)
      return {
        value: coins,
        metric,
        nice: metric + paddedCurrency,
        fixed: weiFormatFixed(wei, decimals, _precision) + paddedCurrency,
        exact: coins + paddedCurrency,
        currency,
        wei: wei.toString(),
      }
    }
  }
}

export type ICoinFormats = {
  value: string
  metric: string
  nice: string
  fixed: string
  exact: string
  currency: string
  wei: string
}

export type ICoin = ReturnType<typeof Coin>
