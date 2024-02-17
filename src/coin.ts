export const DEFAULT_DECIMALS = 18

const validateDecimals = (decimals: any): decimals is number => {
  if (typeof decimals !== 'number') throw new Error('Invalid decimals, must be a number')
  if (decimals < 1 || decimals > 18) throw new Error('Invalid decimals, must be between 0 and 18')
  return true
}

export const coinsToWeiInBigInt = (value: string | number, decimals: number = DEFAULT_DECIMALS): bigint => {
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

export const coinsToWei = (value: string | number, decimals: number = DEFAULT_DECIMALS): string => {
  return coinsToWeiInBigInt(value, decimals).toString()
}

export const weiToCoins = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): string => {
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

export const dangerouslyWeiToCoinsInFloat = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS): number =>
  parseFloat(weiToCoins(weiValue, decimals))

export const format = (value: string | number, formattingThreshold: number = 100_000): string => {
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
  const i = integerNum === 0 ? 0 : Math.floor(Math.log(integerNum) / 6.907755278982137) // 6.907... is Math.log(1000)
  const withPossibleTrailingZeroes = (integerNum / Math.pow(1000, i)).toFixed(3)

  // remove trailing zeroes
  const formatted = withPossibleTrailingZeroes.replace(/\.?0+$/, '')

  return `${formatted}${suffixes[i]}`
}

export const formatPrecise = (value: string | number, precision: number = 3): string => {
  const numStr = value.toString()
  if (precision === -1) return numStr

  const [integerPart, fractionalPart = ''] = numStr.split('.')
  if (!fractionalPart) return numStr

  return `${integerPart}.${fractionalPart.substring(0, precision).padEnd(precision, '0')}`
}

export const formatWithCurrency = (value: string | number, currency: string = '', formattingThreshold: number = 100_000): string => {
  return format(value, formattingThreshold) + (currency ? ` ${currency}` : '')

}

export const weiFormat = (weiValue: string | bigint, decimals: number = DEFAULT_DECIMALS, formattingThreshold = 100_000): string => {
  return format(weiToCoins(weiValue, decimals), formattingThreshold)
}

export const weiFormatPrecise = (weiValue: string | bigint, precision: number = 3): string => {
  return formatPrecise(weiToCoins(weiValue), precision)
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
    coinsToWeiInBigInt: (value: string): bigint => coinsToWeiInBigInt(value, decimals),
    coinsToWei: (value: string): string => coinsToWei(value, decimals),
    weiToCoins: (value: string | bigint): string => weiToCoins(value, decimals),

    dangerouslyWeiToCoinsInFloat: (value: string | bigint): number => dangerouslyWeiToCoinsInFloat(value, decimals),

    format: (value: string): string => format(value, formattingThreshold) + paddedCurrency,
    formatPrecise: (value: string | number, _precision = precision): string => formatPrecise(value, _precision) + paddedCurrency,
    formatPure: (value: string | number): string => format(value, formattingThreshold),
    formatPurePrecise: (value: string | number, _precision = precision): string => formatPrecise(value, _precision),
    weiFormat: (value: string | bigint): string => weiFormat(value, decimals, formattingThreshold) + paddedCurrency,
    weiFormatPrecise: (value: string | bigint, _precision = precision): string => weiFormatPrecise(value, _precision) + paddedCurrency,
    weiFormatPure: (value: string | bigint): string => weiFormat(value, formattingThreshold),
    weiFormatPurePrecise: (value: string | bigint, _precision = precision): string => weiFormatPrecise(value, _precision),

    inAllFormats: (value: string | number, _precision = precision): ICoinFormats => {
      const wei = coinsToWei(value, decimals)
      const coins = value.toString()
      return {
        parsed: coins,
        full: format(value, formattingThreshold) + paddedCurrency,
        precise: formatPrecise(value, _precision) + paddedCurrency,
        exact: coins + paddedCurrency,
        currency,
        wei,
      }
    },

    weiInAllFormats:
      (wei: string | bigint, _precision = precision): ICoinFormats => {
        const coins = weiToCoins(wei, decimals)

        return {
          parsed: coins,
          full: format(coins, formattingThreshold) + paddedCurrency,
          precise: formatPrecise(coins, _precision) + paddedCurrency,
          exact: coins + paddedCurrency,
          currency,
          wei: wei.toString(),
        }
      }
  }
}

export type ICoinFormats = {
  parsed: string
  full: string
  precise: string
  exact: string
  currency: string
  wei: string
}

export type ICoin = ReturnType<typeof Coin>
